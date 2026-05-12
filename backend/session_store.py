import asyncio
import logging
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

log = logging.getLogger(__name__)

SESSION_TTL_MINUTES = 30
MAX_HISTORY_TURNS = 10  # each turn = 1 user message + 1 assistant reply
MAX_SESSIONS = 500      # hard cap — prevents memory exhaustion under sustained attack


@dataclass
class SessionData:
    history: list[dict] = field(default_factory=list)
    jd_text: str | None = None
    analysis_result: dict | None = None
    last_active: datetime = field(default_factory=datetime.utcnow)


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, SessionData] = {}

    def create(self) -> str:
        if len(self._sessions) >= MAX_SESSIONS:
            raise RuntimeError("Session limit reached")
        sid = str(uuid.uuid4())
        self._sessions[sid] = SessionData()
        log.info("Session created | id=%s | active=%d", sid, len(self._sessions))
        return sid

    def get(self, sid: str) -> SessionData | None:
        session = self._sessions.get(sid)
        if session:
            session.last_active = datetime.now(timezone.utc)
        return session

    def delete(self, sid: str) -> None:
        if self._sessions.pop(sid, None) is not None:
            log.info("Session deleted | id=%s | active=%d", sid, len(self._sessions))

    def set_jd(self, sid: str, jd_text: str) -> None:
        """Replace the active JD and clear chat history and analysis — new job, fresh conversation."""
        session = self._sessions.get(sid)
        if session:
            session.jd_text = jd_text
            session.history = []
            session.analysis_result = None
            session.last_active = datetime.now(timezone.utc)

    def set_analysis(self, sid: str, result: dict) -> None:
        session = self._sessions.get(sid)
        if session:
            session.analysis_result = result
            session.last_active = datetime.now(timezone.utc)

    def append_turn(self, sid: str, user_msg: str, assistant_reply: str) -> None:
        session = self._sessions.get(sid)
        if not session:
            return
        session.history.append({"role": "user", "content": user_msg})
        session.history.append({"role": "assistant", "content": assistant_reply})
        # Keep only the last MAX_HISTORY_TURNS turns to cap token usage
        max_messages = MAX_HISTORY_TURNS * 2
        if len(session.history) > max_messages:
            session.history = session.history[-max_messages:]
        session.last_active = datetime.now(timezone.utc)

    def touch(self, sid: str) -> bool:
        session = self._sessions.get(sid)
        if session:
            session.last_active = datetime.now(timezone.utc)
            return True
        return False

    def _cleanup_expired(self) -> None:
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=SESSION_TTL_MINUTES)
        expired = [sid for sid, s in self._sessions.items() if s.last_active < cutoff]
        for sid in expired:
            del self._sessions[sid]
        if expired:
            log.info("Session cleanup: removed %d expired | active=%d", len(expired), len(self._sessions))


store = SessionStore()


async def cleanup_loop() -> None:
    while True:
        await asyncio.sleep(300)  # run every 5 minutes
        store._cleanup_expired()
