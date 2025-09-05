# rag_agent/api.py
import os
import requests
from requests.adapters import HTTPAdapter, Retry



# --- 필수 토큰 체크 ---
OPENAI_API_KEY   = os.getenv("OPENAI_API_KEY")
DOORAY_API_TOKEN = os.getenv("DOORAY_API_TOKEN")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set (환경변수 필요).")
if not DOORAY_API_TOKEN:
    raise RuntimeError("DOORAY_API_TOKEN is not set (환경변수 필요).")

# --- Dooray 기본 설정 ---
DOORAY_API = "https://api.dooray.com"
DEFAULT_TIMEOUT = 20
PAGE_SIZE = int(os.getenv("DOORAY_PAGE_SIZE", "50"))  # 한 페이지 최대 50으로 제한
base_url = DOORAY_API
headers = {"Authorization": f"dooray-api {DOORAY_API_TOKEN}"}

def _build_session() -> requests.Session:
    s = requests.Session()
    retries = Retry(
        total=6,
        backoff_factor=0.6,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=frozenset(["GET"]),
        raise_on_status=False,
        respect_retry_after_header=True,
    )
    s.mount("https://", HTTPAdapter(max_retries=retries))
    s.headers.update({
        "Authorization": f"dooray-api {DOORAY_API_TOKEN}",
        "Content-Type": "application/json",
    })
    return s

_session = _build_session()

def _norm_url(url: str) -> str:
    """상대 경로('/drive/...')면 절대 URL로 변환."""
    return url if url.startswith("http") else f"{DOORAY_API}{url}"

def _dooray_get(url: str, params: dict | None = None, timeout: int = DEFAULT_TIMEOUT) -> dict:
    """GET + 페이지 size를 50으로 clamp + JSON 반환."""
    p = dict(params or {})
    p["size"] = min(int(p.get("size", PAGE_SIZE)), PAGE_SIZE)  # ✅ 50 상한 적용
    resp = _session.get(_norm_url(url), params=p, timeout=timeout)
    resp.raise_for_status()
    return resp.json()

# ---- 공개 API 함수들 ----

def list_personal_drives() -> list[dict]:
    # Dooray 스펙상 type=private (개인 드라이브)
    data = _dooray_get("/drive/v1/drives", params={"type": "private"})
    return data.get("result", [])

def list_folders_in_folder(drive_id: str, folder_id: str, page: int = 0, size: int = PAGE_SIZE) -> list[dict]:
    data = _dooray_get(
        f"/drive/v1/drives/{drive_id}/files",
        params={"parentId": folder_id, "type": "folder", "page": page, "size": size},
    )
    return data.get("result", [])

def list_files_in_folder(drive_id: str, folder_id: str, page: int = 0, size: int = PAGE_SIZE) -> list[dict]:
    data = _dooray_get(
        f"/drive/v1/drives/{drive_id}/files",
        params={"parentId": folder_id, "type": "file", "page": page, "size": size},
    )
    return data.get("result", [])

def search_in_root(drive_id: str, query: str, page: int = 0, size: int = PAGE_SIZE) -> list[dict]:
    data = _dooray_get(
        f"/drive/v1/drives/{drive_id}/files",
        params={"parentId": "root", "searchText": query, "page": page, "size": size},
    )
    return data.get("result", [])
