import asyncio
import logging
import os
import uuid
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()  # must run before importing agent, which creates the Anthropic client at module level

from fastapi import FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

import agent
import parser as file_parser
from session_store import store, cleanup_loop

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

if not os.getenv("ANTHROPIC_API_KEY"):
    raise RuntimeError("ANTHROPIC_API_KEY environment variable is not set")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
MAX_FILE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_TYPES = {"application/pdf", "image/png", "image/jpeg", "image/webp"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(cleanup_loop())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


limiter = Limiter(key_func=get_remote_address, default_limits=["30/minute"])
app = FastAPI(title="PathPilot Demo API", docs_url=None, redoc_url=None, lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Session-ID"],
)


def _validate_uuid(value: str) -> bool:
    try:
        uuid.UUID(value, version=4)
        return True
    except ValueError:
        return False


def _require_session(session_id: str | None):
    """Resolve session or raise — centralises the 'not found' response."""
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing X-Session-ID header")
    if not _validate_uuid(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID")
    session = store.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    return session


class ChatRequest(BaseModel):
    message: str


@app.get("/health")
def health():
    return {"status": "ok"}


# ── Session lifecycle ──────────────────────────────────────────────────────────

@app.post("/session")
@limiter.limit("10/minute")
async def create_session(request: Request):
    try:
        sid = store.create()
    except RuntimeError:
        log.warning("Session limit reached — rejecting create request")
        raise HTTPException(status_code=503, detail="Service busy — try again later")
    return {"session_id": sid}


@app.post("/session/{session_id}/close")
async def close_session(session_id: str):
    if _validate_uuid(session_id):
        store.delete(session_id)
    return {"ok": True}


@app.post("/session/{session_id}/ping")
async def ping_session(session_id: str):
    if not _validate_uuid(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID")
    if not store.touch(session_id):
        raise HTTPException(status_code=404, detail="Session not found or expired")
    return {"ok": True}


# ── Chat ───────────────────────────────────────────────────────────────────────

@app.post("/chat")
@limiter.limit("10/minute;50/hour")
async def chat(
    request: Request,
    body: ChatRequest,
    x_session_id: str | None = Header(default=None),
):
    session = _require_session(x_session_id)

    if len(body.message.strip()) == 0:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if len(body.message) > 1000:
        raise HTTPException(status_code=400, detail="Message too long (max 1000 characters)")

    try:
        reply = agent.chat(session, body.message)
        store.append_turn(x_session_id, body.message, reply)  # type: ignore[arg-type]
        return {"reply": reply}
    except Exception as e:
        log.exception("Chat agent failed | message=%r | error=%s", body.message[:80], e)
        raise HTTPException(status_code=500, detail="Agent error — please try again")


# ── Analyze ────────────────────────────────────────────────────────────────────

@app.post("/analyze")
@limiter.limit("3/minute;10/hour")
async def analyze(
    request: Request,
    file: UploadFile = File(...),
    x_session_id: str | None = Header(default=None),
):
    session = _require_session(x_session_id)

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Use PDF, PNG, JPEG, or WEBP.",
        )

    content = await file.read()
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 5 MB)")

    try:
        if file.content_type == "application/pdf":
            text = file_parser.parse_pdf(content)
        else:
            text = file_parser.parse_image(content)
    except Exception as e:
        log.exception("File parsing failed | filename=%r | type=%r | error=%s", file.filename, file.content_type, e)
        raise HTTPException(status_code=422, detail="Could not read the file")

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="No text could be extracted. PDF may be scanned/image-only. Try a screenshot instead.",
        )

    try:
        # Store JD in session (also clears chat history and previous analysis)
        store.set_jd(x_session_id, text)  # type: ignore[arg-type]
        result = agent.analyze(text)
        store.set_analysis(x_session_id, result)  # type: ignore[arg-type]
        return result
    except Exception as e:
        log.exception("Analysis agent failed | filename=%r | error=%s", file.filename, e)
        raise HTTPException(status_code=500, detail="Analysis failed — please try again")
