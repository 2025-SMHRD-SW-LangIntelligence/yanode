from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os, traceback, uuid
from typing import Optional, Any, Dict, List

from rag_agent.indexer import ensure_index, GLOBAL_INDEX  # hybrid_search는 여기선 불필요
from rag_agent.agent import make_agent  # agent는 내부에서 ops_dooray의 오토프리뷰를 사용
from rag_agent.api import list_folders_in_folder


app = FastAPI(title="Smart Search")

# 프론트 주소만 허용(필요 시 127.0.0.1도 추가 가능)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        # "http://127.0.0.1:5173",  # 필요하면 주석 해제
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Pydantic Models =====
class AskIn(BaseModel):
    query: str

class ChatIn(BaseModel):
    session_id: Optional[str] = None
    message: str
    reset: bool = False

class ReindexRequest(BaseModel):
    folder_ids: List[str]

# ===== Helpers =====
def _is_index_ready() -> bool:
    """GLOBAL_INDEX 형태가 달라도 안전하게 '준비됨' 판단."""
    if GLOBAL_INDEX.get("items"):     # 리스트/트리 인덱스 형태
        return True
    if GLOBAL_INDEX.get("db"):        # 벡터 인덱스 형태 (faiss 등)
        return True
    if GLOBAL_INDEX.get("built_at"):  # 빌드 타임만 있어도 일단 준비된 것으로 간주
        return True
    return False

def _only_output(result) -> str:
    """LangChain agent.invoke() 가 dict/str 어떤 타입을 반환하든 최종 문자열만 뽑아냄."""
    if isinstance(result, dict):
        # LangChain 에이전트는 보통 {"input":..., "output": "..."} 형태
        return result.get("output") or result.get("answer") or str(result)
    return str(result)


def _normalize_folders(ids: list[str]) -> list[str]:
    # 드라이브/루트 노드는 제외하고 폴더만
    return [fid for fid in ids if not (fid.startswith("drive-") or fid.startswith("root-"))]

def _expand_roots_to_children(ids: list[str], drive_id: str) -> list[str]:
    out = []
    for fid in ids:
        if fid.startswith("root-"):
            # 루트면 직속 하위 폴더를 불러와서 확장(페이지 size는 25~50 권장)
            out.extend([fo["id"] for fo in list_folders_in_folder(drive_id, fid, page=0, size=50) or []])
        else:
            out.append(fid)
    # 중복 제거
    return list(dict.fromkeys(out))


# ===== Global exception → 항상 JSON =====
@app.exception_handler(Exception)
async def _all_exc(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"detail": str(exc)})

# ===== Health / Status =====
@app.get("/health")
def health():
    return {"ok": True}

@app.get("/_env")
def _env():
    return {
        "OPENAI_API_KEY_SET": bool(os.getenv("OPENAI_API_KEY")),
        "DOORAY_API_TOKEN_SET": bool(os.getenv("DOORAY_API_TOKEN")),
        "OPENAI_MODEL": os.getenv("OPENAI_MODEL", ""),
    }

@app.get("/_status")
def _status():
    # 두 체계를 모두 지원 (items 방식, db 벡터 방식)
    db = GLOBAL_INDEX.get("db")
    items = GLOBAL_INDEX.get("items") or []
    return {
        "indexed_docs": (getattr(getattr(db, "index", None), "ntotal", 0) if db else len(items)),
        "built_at": GLOBAL_INDEX.get("built_at"),
        "roots": GLOBAL_INDEX.get("roots"),
        "drive_id": GLOBAL_INDEX.get("drive_id"),
    }

# ===== (선택한 폴더 기반) 인덱스 재빌드 =====
@app.post("/reindex")
def reindex_with_checklist(request: ReindexRequest):
    try:
        orig_ids = request.folder_ids or []
        ids = _normalize_folders(orig_ids)

        # 루트만 온 경우 → 자식으로 확장
        if not ids and any(fid.startswith("root-") for fid in orig_ids):
            drive_id = GLOBAL_INDEX.get("drive_id")
            if not drive_id:
                raise RuntimeError("drive_id가 아직 설정되지 않았습니다.")
            ids = _expand_roots_to_children(orig_ids, drive_id)

        if not ids:
            return {"status": "skipped", "reason": "선택된 폴더가 없습니다(루트/드라이브 제외됨)."}

        # ✅ 핵심: 강제 재빌드 끄기(증분/동일선택 스킵)
        ensure_index(checklist_ids=ids, force=False)
        return {"status": "reindexed", "folders": ids}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"reindex 실패: {e}")

    



# ===== 단발성 질의 =====
@app.post("/ask")
def ask(in_: AskIn):
    q = (in_.query or "").strip()
    if not q:
        raise HTTPException(status_code=400, detail="query is required")

    if not _is_index_ready():
        return {
            "answer": "아직 검색 대상이 설정되지 않았습니다. 먼저 '탐색' 탭에서 검색할 폴더를 선택하고 '적용' 버튼을 눌러주세요."
        }

    agent = make_agent()  # 매 호출 시 새 에이전트 (세션 필요 없으면 OK)
    out = agent.invoke({"input": q})
    return {"answer": _only_output(out)}

# ===== 세션형 대화 =====
SESSIONS: Dict[str, Any] = {}

@app.post("/chat")
def chat(in_: ChatIn):
    sid = (in_.session_id or "").strip()
    new_session = False

    if not sid:
        sid = str(uuid.uuid4())
        new_session = True

    if in_.reset or sid not in SESSIONS:
        SESSIONS[sid] = make_agent()
        new_session = True

    if not _is_index_ready():
        return {
            "answer": "아직 검색 대상이 설정되지 않았습니다. 먼저 '탐색' 탭에서 검색할 폴더를 선택하고 '적용' 버튼을 눌러주세요.",
            "session_id": sid,
            "new": new_session,
        }

    out = SESSIONS[sid].invoke({"input": in_.message})
    return {"answer": _only_output(out), "session_id": sid, "new": new_session}
