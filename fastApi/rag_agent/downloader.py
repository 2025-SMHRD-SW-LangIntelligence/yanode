import os, tempfile, requests
import fitz  # PyMuPDF
import logging, warnings
import pdfplumber
import pytesseract
from pdf2image import convert_from_path
from PIL import Image, ImageOps
from langchain.schema import Document
from rag_agent.api import base_url, headers


# pdfminer(=pdfplumber 내부) 경고/노이즈 억제
logging.getLogger("pdfminer").setLevel(logging.ERROR)

# openpyxl 경고 억제 (엑셀 기본 스타일 경고)
warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")

def _download_to_tmp(file_id: str, ext: str, drive_id: str) -> str:
    raw = requests.get(
        f"{base_url}/drive/v1/drives/{drive_id}/files/{file_id}?media=raw",
        headers=headers, allow_redirects=False
    )
    raw.raise_for_status()
    redirect_url = raw.headers.get("Location")
    if not redirect_url:
        raise RuntimeError("리다이렉트 URL 없음")
    fr = requests.get(redirect_url, headers=headers)
    fr.raise_for_status()
    tmp_path = os.path.join(tempfile.gettempdir(), f"{file_id}{ext}")
    with open(tmp_path, "wb") as f: 
        f.write(fr.content)
    return tmp_path

def _make_docs_from_text(text: str, chunk_chars: int = 1600, overlap: int = 200) -> list[Document]:
    text = (text or "").strip()
    if not text: return []
    if len(text) <= chunk_chars: return [Document(page_content=text)]
    docs, i = [], 0
    while i < len(text):
        docs.append(Document(page_content=text[i:i+chunk_chars]))
        i += (chunk_chars - overlap)
    return docs

def _extract_pdf_text(pdf_path: str, max_pages: int | None = None) -> str:
    """PDF 텍스트 추출: PyMuPDF → pdfplumber 순으로 시도."""
    # 0) PyMuPDF 우선
    try:
        doc = fitz.open(pdf_path)
        n = len(doc)
        upto = n if max_pages is None else min(max_pages, n)
        parts = []
        for i in range(upto):
            t = (doc[i].get_text("text") or "").strip()
            if t:
                parts.append(f"--- [Page {i+1}] ---\n{t}")
        doc.close()
        if parts:
            return "\n\n".join(parts).strip()
    except Exception as e:
        print(f"[WARN] PyMuPDF text extract failed: {e}")

    # 1) 실패 시 pdfplumber 폴백
    parts = []
    with pdfplumber.open(pdf_path) as pdf:
        pages = pdf.pages if max_pages is None else pdf.pages[:max_pages]
        for i, p in enumerate(pages, 1):
            t = (p.extract_text() or "").strip()
            if t:
                parts.append(f"--- [Page {i}] ---\n{t}")
    return "\n\n".join(parts).strip()

def _ocr_pdf(
    pdf_path: str,
    dpi: int = 220,
    lang_primary: str = "kor+eng",
    lang_fallback: str = "eng",
    max_pages: int | None = 15,
    page_stride: int = 2,
    tesseract_psm: int = 6,
    tesseract_oem: int = 3,
) -> str:
    chunks = []

    def _do_ocr(img: Image.Image, lang: str) -> str:
        cfg = f"--oem {tesseract_oem} --psm {tesseract_psm}"
        try:
            return pytesseract.image_to_string(img, lang=lang, config=cfg) or ""
        except Exception as e:
            print(f"[WARN] OCR 실패 (lang={lang}): {e}")
            return ""

    def _preproc(img: Image.Image) -> Image.Image:
        g = img.convert("L")
        g = ImageOps.autocontrast(g)
        return g

    # 1) pdfplumber 기반
    try:
        with pdfplumber.open(pdf_path) as pdf:
            pages = pdf.pages
            if max_pages is not None:
                pages = pages[:max_pages]

            for idx, p in enumerate(pages, 1):
                if page_stride > 1 and ((idx - 1) % page_stride != 0):
                    continue
                try:
                    pil = p.to_image(resolution=dpi).original
                except Exception as e:
                    print(f"[WARN] pdfplumber 렌더 실패 (p{idx}): {e}")
                    pil = None

                if pil is None:
                    raise RuntimeError("pdfplumber 렌더링 실패 → pdf2image 폴백")

                pil = _preproc(pil)
                txt = _do_ocr(pil, lang_primary).strip()
                if not txt:
                    txt = _do_ocr(pil, lang_fallback).strip()
                if txt:
                    chunks.append(f"--- [OCR Page {idx}] ---\n{txt}")

        if chunks:
            return "\n\n".join(chunks).strip()
    except Exception as e:
        print(f"[WARN] pdfplumber OCR 블록 전체 실패: {e}")

    # 2) pdf2image 기반
    try:
        last_page = max_pages if max_pages is not None else None
        images = convert_from_path(pdf_path, dpi=dpi, first_page=1, last_page=last_page)

        for i, img in enumerate(images, 1):
            if page_stride > 1 and ((i - 1) % page_stride != 0):
                continue
            pil = _preproc(img)
            txt = _do_ocr(pil, lang_primary).strip()
            if not txt:
                txt = _do_ocr(pil, lang_fallback).strip()
            if txt:
                chunks.append(f"--- [OCR Page {i}] ---\n{txt}")

        return "\n\n".join(chunks).strip()
    except Exception as e:
        print(f"[WARN] pdf2image OCR 실패: {e}")
        return ""
