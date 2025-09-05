import os, tempfile, subprocess
import pandas as pd
from langchain_community.document_loaders import Docx2txtLoader
from langchain_teddynote.document_loaders import HWPLoader
import shutil
from langchain_community.document_loaders import PyPDFLoader
from rag_agent.api import list_personal_drives
from rag_agent.downloader import _download_to_tmp, _extract_pdf_text, _ocr_pdf


def _find_lo_bin() -> str:
    # 0) 환경변수로 강제 지정 가능
    env = os.getenv("LIBREOFFICE_BIN")
    if env and os.path.exists(env):
        return env

    # 1) Windows 기본 설치 경로 (CLI용 .com 우선)
    candidates = [
        r"C:\Program Files\LibreOffice\program\soffice.com",
        r"C:\Program Files\LibreOffice\program\soffice.exe",
        r"C:\Program Files (x86)\LibreOffice\program\soffice.com",
        r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
        shutil.which("soffice"),
        shutil.which("libreoffice"),
    ]
    for c in candidates:
        if c and os.path.exists(c):
            return c

    raise FileNotFoundError("LibreOffice(soffice) 실행 파일을 찾지 못했습니다.")


def _preview_text(name: str, text: str, limit: int = 1200) -> str:
    text = (text or "").strip()
    if not text:
        return f"⚠️ *{name}* 에서 추출된 텍스트가 없습니다."
    preview = text[:limit]
    return f"📄 *{name}* 미리보기 (앞부분 {limit}자):\n{preview}..."

def _preview_pdf_by_item(item: dict) -> str:
    drives = list_personal_drives(); drive_id = drives[0]["id"]
    src = _download_to_tmp(item["id"], ".pdf", drive_id)

    text = ""

    # 0) PyPDFLoader 우선
    try:
        docs = PyPDFLoader(src).load()
        text = "\n\n".join(
            (getattr(d, "page_content", "") or "").strip()
            for d in docs if getattr(d, "page_content", "")
        )
    except Exception:
        text = ""

    # 1) 부족하면: PyMuPDF → pdfplumber 추출
    if len(text) < 50:
        text = _extract_pdf_text(src, max_pages=12)  # 필요시 12~15로 올려도 됨

    # 2) 그래도 부족하면: OCR 폴백
    if len(text) < 50:
        text = _ocr_pdf(src)

    if not text:
        text = "(미리보기를 생성할 수 없습니다.)"

    return _preview_text(item.get("name","PDF"), text)

    

def _preview_hwp_by_item(item: dict) -> str:
    drives = list_personal_drives(); drive_id = drives[0]["id"]
    src_name = item.get("name","").lower()
    ext = ".hwp" if src_name.endswith(".hwp") else ".hwpx"
    src = _download_to_tmp(item["id"], ext, drive_id)

    try:
        docs = HWPLoader(src).load()
        text = "\n\n".join((getattr(d,"page_content","") or "").strip()
                           for d in docs if getattr(d,"page_content",""))
    except Exception as e:
        return f"⚠️ *{item['name']}* HWP 추출 실패: {e}"

    return _preview_text(item.get("name","HWP"), text)

def _locate_converted_pdf(src_path: str, outdir: str) -> str | None:
    base = os.path.splitext(os.path.basename(src_path))[0]
    cand = os.path.join(outdir, base + ".pdf")
    if os.path.exists(cand): return cand
    pdfs = [os.path.join(outdir, f) for f in os.listdir(outdir) if f.lower().endswith(".pdf")]
    return max(pdfs, key=os.path.getmtime) if pdfs else None

def _preview_ppt_like_by_item(item: dict) -> str:
    # 1) 원본 PPT(X) 다운로드
    drives = list_personal_drives(); drive_id = drives[0]["id"]
    # ext 우선순위: item["ext"] → 파일명에서 추정 → 기본값 .pptx
    name = item.get("name", "")
    ext = (item.get("ext") or (".pptx" if name.lower().endswith(".pptx") else ".ppt")).lower()
    src = _download_to_tmp(item["id"], ext, drive_id)

    # 2) LibreOffice로 PDF 변환
    outdir = tempfile.gettempdir()
    try:
        lo = _find_lo_bin()  # soffice/libreoffice 경로 찾는 헬퍼(이미 추가했으면 그거 사용)
        cp = subprocess.run(
            [lo, "--headless", "--convert-to", "pdf", "--outdir", outdir, src],
            capture_output=True, text=True, check=True
        )
    except subprocess.CalledProcessError as e:
        msg = (e.stderr or e.stdout or str(e)).strip()
        return f"⚠️ *{item.get('name','(이름없음)')}* PPT 변환 실패: {msg}"
    except Exception as e:
        return f"⚠️ *{item.get('name','(이름없음)')}* PPT 변환 실패: {e}"

    # 3) 변환된 PDF 찾기
    pdf_path = _locate_converted_pdf(src, outdir)
    if not pdf_path or not os.path.exists(pdf_path):
        return f"⚠️ *{item.get('name','(이름없음)')}* PDF 변환 결과를 찾지 못했습니다."

    # 4) PDF 텍스트 추출 → 부족하면 OCR 폴백
    text = _extract_pdf_text(pdf_path, max_pages=8)  # 속도 위해 앞부분만
    if not text or len(text.strip()) < 50:
        text = _ocr_pdf(pdf_path)

    if not text:
        text = "(미리보기를 생성할 수 없습니다.)"

    return _preview_text(item.get("name","PPT"), text)

def _preview_docx_by_item(item: dict) -> str:
    drives = list_personal_drives(); drive_id = drives[0]["id"]
    src = _download_to_tmp(item["id"], ".docx", drive_id)
    text = ""
    try:
        docs = Docx2txtLoader(src).load()
        text = "\n\n".join((getattr(d,"page_content","") or "").strip() for d in docs if getattr(d,"page_content",""))
    except Exception:
        try:
            from docx import Document as _Docx
            d = _Docx(src)
            paras = [p.text.strip() for p in d.paragraphs if p.text and p.text.strip()]
            text = "\n".join(paras).strip()
        except Exception:
            return f"⚠️ *{item['name']}* DOCX 파싱 실패"

    return _preview_text(item.get("name","DOCX"), text)

def _preview_xlsx_by_item(item: dict) -> str:
    drives = list_personal_drives(); drive_id = drives[0]["id"]
    src = _download_to_tmp(item["id"], ".xlsx", drive_id)
    try:
        xls = pd.ExcelFile(src, engine="openpyxl")
    except Exception as e:
        return f"⚠️ *{item['name']}* 엑셀 로드 실패: {e}"

    previews = []
    for sheet in xls.sheet_names[:2]:
        try:
            df = pd.read_excel(src, sheet_name=sheet, nrows=50, engine="openpyxl")
            if df.shape[1] > 20: df = df.iloc[:, :20]
            previews.append(f"[{sheet}] (앞부분 50행)\n{df.head(10).to_string(index=False)}")
        except Exception:
            previews.append(f"[{sheet}] 시트 읽기 실패")

    text = "\n\n".join(previews).strip()
    return _preview_text(item.get("name","XLSX"), text)

def _preview_txt_by_item(item: dict) -> str:
    drives = list_personal_drives(); drive_id = drives[0]["id"]
    src = _download_to_tmp(item["id"], ".txt", drive_id)
    try:
        with open(src, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    except Exception:
        return f"⚠️ *{item['name']}* TXT 읽기 실패"

    return _preview_text(item.get("name","TXT"), text)
