import io
import pdfplumber
import pytesseract
from PIL import Image


def parse_pdf(file_bytes: bytes) -> str:
    """Extract text from a digital PDF using pdfplumber.

    Note: scanned (image-only) PDFs will return an empty string.
    For full scanned-PDF coverage, swap this path for Claude Vision (see ADR-001).
    """
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        pages = [page.extract_text() or "" for page in pdf.pages]
    return "\n".join(pages).strip()


def parse_image(file_bytes: bytes) -> str:
    """Extract text from a PNG/JPEG/WEBP image using Tesseract OCR."""
    image = Image.open(io.BytesIO(file_bytes))
    return pytesseract.image_to_string(image).strip()
