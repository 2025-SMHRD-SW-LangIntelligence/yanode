import re, torch
from typing import List, Tuple
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from rag_agent.api import list_personal_drives
from rag_agent.downloader import _download_to_tmp, _extract_pdf_text, _ocr_pdf
from rag_agent.previewers import _preview_ppt_like_by_item
from langchain_teddynote.document_loaders import HWPLoader
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
from rag_agent.indexer import hybrid_search, GLOBAL_INDEX


# Cross-Encoder 모델 준비
_CE_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"
_DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
_ce_tok = AutoTokenizer.from_pretrained(_CE_MODEL)
_ce_mdl = AutoModelForSequenceClassification.from_pretrained(_CE_MODEL).to(_DEVICE)
_ce_mdl.eval()

def _ce_scores(query: str, passages: List[str], batch_size: int = 16) -> List[float]:
    out: List[float] = []
    for i in range(0, len(passages), batch_size):
        batch = passages[i:i+batch_size]
        enc = _ce_tok([query]*len(batch), batch, padding=True, truncation=True,
                      max_length=512, return_tensors="pt").to(_DEVICE)
        with torch.no_grad():
            logits = _ce_mdl(**enc).logits.squeeze(-1).detach().cpu().tolist()
            if isinstance(logits, float):
                logits = [logits]
        out.extend(logits)
    return out

def _chunk(text: str, size: int = 900, overlap: int = 150) -> List[str]:
    text = (text or "").strip()
    if not text: return []
    res, i, step = [], 0, max(1, size - overlap)
    while i < len(text):
        res.append(text[i:i+size])
        i += step
    return res

def _load_item_chunks_semantic(item: dict) -> List[Tuple[str, str]]:
    ext = (item.get("ext") or "").lower()
    drives = list_personal_drives()
    if not drives:
        return []
    drive_id = drives[0]["id"]

    text = ""

    try:
        if ext == ".pdf":
            src = _download_to_tmp(item["id"], ".pdf", drive_id)
            text = _extract_pdf_text(src)
            if (not text or len(text) < 50) and PyPDFLoader is not None:
                try:
                    docs = PyPDFLoader(src).load()
                    text2 = "\n".join(getattr(d, "page_content", "") for d in docs if getattr(d, "page_content", ""))
                    if len(text2.strip()) > len(text.strip()):
                        text = text2.strip()
                except Exception:
                    pass
            if not text or len(text.strip()) < 50:
                text = _ocr_pdf(src)

        elif ext == ".hwp":
            src = _download_to_tmp(item["id"], ".hwp", drive_id)
            try:
                docs = HWPLoader(src).load()
                text = "\n".join(getattr(d, "page_content", "") for d in docs if getattr(d, "page_content", "")).strip()
            except Exception:
                text = ""

        elif ext in (".ppt", ".pptx"):
            # _preview_ppt_like_by_item은 (item) -> str 반환
            text = _preview_ppt_like_by_item(item)

        elif ext == ".docx":
            src = _download_to_tmp(item["id"], ".docx", drive_id)
            if Docx2txtLoader is not None:
                try:
                    docs = Docx2txtLoader(src).load()
                    text = "\n".join(getattr(d, "page_content", "") for d in docs if getattr(d, "page_content", "")).strip()
                except Exception:
                    text = ""
            if not text:
                try:
                    from docx import Document as _Docx
                    d = _Docx(src)
                    text = "\n".join(p.text.strip() for p in d.paragraphs if p.text and p.text.strip()).strip()
                except Exception:
                    text = ""

        elif ext == ".txt":
            src = _download_to_tmp(item["id"], ".txt", drive_id)
            try:
                with open(src, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read().strip()
            except Exception:
                text = ""
        else:
            return []
    except Exception:
        text = ""

    chunks = _chunk(text, size=900, overlap=150)
    return [(item["id"], c) for c in chunks if c.strip()]

def dooray_semantic_preview(query: str, exts=None) -> str:
    # 인덱스/선택범위는 이미 /reindex 에서 구성되었다는 전제
    if not GLOBAL_INDEX.get("items"):
        return "아직 검색 대상이 설정되지 않았습니다. 먼저 UI에서 폴더 선택 후 '적용'을 눌러 주세요."

    if exts is None:
        exts = (".pdf", ".hwp", ".ppt", ".pptx", ".docx", ".txt")

    
    items = hybrid_search(query, exts=exts, limit=12)

    # 선택한 루트(체크리스트) 범위로 제한
    roots = GLOBAL_INDEX.get("roots")  # tuple(...) or None
    if roots:
        allow = set(roots)
        items = [it for it in items if it.get("root_id") in allow]

    if not items:
        return f"'{query}' 관련 파일을 찾지 못했습니다. (선택 폴더 범위 내 결과 없음)"


    pairs: List[Tuple[str, str]] = []
    meta = {}
    for it in items:
        meta[it["id"]] = (it.get("name",""), it.get("_path","/"), it.get("ext",""))
        pairs.extend(_load_item_chunks_semantic(it))

    MIN_CHUNK_LEN, MAX_PER_FILE = 30, 6
    q_terms = {t for t in re.split(r"\s+", (query or "").lower().strip()) if t and len(t) >= 2}

    filtered, seen, per_file = [], set(), {}
    for fid, c in pairs:
        s = (c or "").strip()
        if len(s) < MIN_CHUNK_LEN: continue
        key = (fid, s)
        if key in seen: continue
        if q_terms and not any(t in s.lower() for t in q_terms): continue
        if per_file.get(fid, 0) >= MAX_PER_FILE: continue
        per_file[fid] = per_file.get(fid, 0) + 1
        seen.add(key)
        filtered.append((fid, s))

    if not filtered:
        return f"'{query}' 관련 본문을 읽을 수 있는 파일이 없습니다."

    texts = [t for _, t in filtered]
    try:
        scores = _ce_scores(query, texts)
    except Exception:
        qtk = set(re.split(r"\s+", (query or "").lower().strip()))
        def cheap(x):
            xtk = set(re.split(r"\s+", x.lower()))
            return len(qtk & xtk) / (len(qtk) or 1)
        scores = [cheap(t) for t in texts]

    m = min(len(scores), len(filtered))
    ranked = sorted(zip(filtered[:m], scores[:m]), key=lambda x: x[1], reverse=True)

    K = min(5, len(ranked))
    previews, used = [], set()
    for (fid, chunk), _ in ranked[:K]:
        nm, pth, ext = meta.get(fid, ("", "", ""))
        used.add((fid, nm, pth))
        previews.append(f"📄 {nm}\n{chunk[:400]}...\n")

    src = "\n".join(f"- {pth}{nm}" for (_, nm, pth) in sorted(used, key=lambda x: x[1])) or "(출처 없음)"
    return f"🧠 의미기반 검색 결과 (요약 없음, 프리뷰만)\n\n" + "\n".join(previews) + f"\n📎 출처\n{src}"
