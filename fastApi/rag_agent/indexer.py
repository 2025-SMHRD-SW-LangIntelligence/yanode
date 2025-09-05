import os, re, time
from collections import deque
from rag_agent.api import list_personal_drives, list_folders_in_folder, list_files_in_folder, search_in_root

CHECKLIST_FOLDER_IDS: list[str] = []
INDEX_TTL_SEC = 3600

GLOBAL_INDEX = {"built_at": 0.0, "drive_id": None, "roots": None, "items": []}

def _now(): return time.time()
def _norm(s: str) -> str: return re.sub(r"\s+", " ", (s or "").lower()).strip()

def _ext_lower(name: str) -> str:
    n = (name or "").lower()
    for ext in (".pdf", ".hwp", ".hwpx", ".ppt", ".pptx", ".docx", ".xlsx", ".txt"):
        if n.endswith(ext): return ext
    return os.path.splitext(n)[1]

def _paginate(fetch_fn, *args, size: int = 200):
    page = 0
    while True:
        batch = fetch_fn(*args, page=page, size=size)
        if not batch: break
        for it in batch: yield it
        page += 1

def _walk_from(drive_id: str, start_id: str, start_path: str = "/"):
    q = deque()
    for fo in _paginate(list_folders_in_folder, drive_id, start_id):
        fo["_path"] = start_path + fo["name"] + "/"
        q.append(fo)
        yield {**fo, "_path": fo["_path"]}
    for fi in _paginate(list_files_in_folder, drive_id, start_id):
        fi["_path"] = start_path
        yield {**fi, "_path": fi["_path"]}

    while q:
        folder = q.popleft()
        fid, fpath = folder["id"], folder["_path"]
        for fo in _paginate(list_folders_in_folder, drive_id, fid):
            fo["_path"] = fpath + fo["name"] + "/"
            q.append(fo)
            yield {**fo, "_path": fo["_path"]}
        for fi in _paginate(list_files_in_folder, drive_id, fid):
            fi["_path"] = fpath
            yield {**fi, "_path": fi["_path"]}

def list_top_folders(drive_id: str) -> list[str]:
    folders = list_folders_in_folder(drive_id, "root")
    return [fo["id"] for fo in folders]

def build_index(drive_id: str, root_folder_ids: list[str] | None):
    items = []
    # ✅ 전체(또는 ["root"])일 땐 'root'를 직접 돌지 말고 최상위 폴더만 순회
    if not root_folder_ids or root_folder_ids == ["root"]:
        roots_iter = list_top_folders(drive_id)   # << 여기서 ["root"] 제거!
    else:
        roots_iter = root_folder_ids

    seen = set()  # ✅ file id 중복 방지
    for rid in roots_iter:
        for it in _walk_from(drive_id, rid, start_path="/"):
            if it.get("type") == "file":
                fid = it["id"]
                if fid in seen:
                    continue
                seen.add(fid)
                items.append({
                    "id": fid,
                    "name": it.get("name",""),
                    "type": "file",
                    "_path": it.get("_path","/"),
                    "ext": _ext_lower(it.get("name","")),
                    "root_id": rid,  # ✅ 선택된 루트 기준으로 고정
                })

    GLOBAL_INDEX.update({
        "built_at": _now(),
        "drive_id": drive_id,
        "items": items,   # ✅ 완전 교체
        # roots는 ensure_index()가 책임지고 세팅
    })




def ensure_index(checklist_ids: list[str] | None = None, force: bool = False):
    drives = list_personal_drives()
    if not drives:
        raise RuntimeError("개인 드라이브를 찾을 수 없습니다.")
    drive_id = drives[0]["id"]

    # ✅ root와 다른 폴더가 같이 오면 root 제거(전체로 오해 방지)
    if checklist_ids and "root" in checklist_ids and len(checklist_ids) > 1:
        checklist_ids = [x for x in checklist_ids if x != "root"]

    # ✅ '전체(최상위 전부)' 선택을 None으로 정규화
    if checklist_ids:
        top_ids = set(list_top_folders(drive_id))
        if set(checklist_ids) == top_ids:
            checklist_ids = None

    roots_norm = tuple(sorted(checklist_ids)) if checklist_ids else None

    built_at = GLOBAL_INDEX.get("built_at") or 0
    stale        = (_now() - built_at > INDEX_TTL_SEC)
    changed_root = GLOBAL_INDEX.get("roots") != roots_norm
    wrong_drive  = GLOBAL_INDEX.get("drive_id") != drive_id
    empty        = not GLOBAL_INDEX.get("items")

    need_rebuild = force or stale or changed_root or wrong_drive or empty
    if not need_rebuild:
        # ✅ 리빌드가 없어도 항상 최신 roots 반영
        GLOBAL_INDEX["roots"] = roots_norm
        return "skip"

    build_index(drive_id, checklist_ids)
    GLOBAL_INDEX["drive_id"] = drive_id
    GLOBAL_INDEX["roots"] = roots_norm
    return "rebuilt"




def search_index_by_name(query: str, exts: tuple[str, ...] | None = None, limit: int = 50):
    q = _norm(query)
    toks = [t for t in re.split(r"\s+", q) if t]
    out = []
    for it in GLOBAL_INDEX["items"]:
        if exts and it["ext"] not in exts: continue
        hay = _norm(it["_path"] + it["name"])
        if not toks or any(t in hay for t in toks): out.append(it)

    def score(it):
        hay = _norm(it["_path"] + it["name"])
        s = sum(hay.count(t) for t in toks)
        s += 2 * sum(1 for t in toks if t in _norm(it["name"]))
        return s

    out.sort(key=score, reverse=True)
    return out[:limit]

# rag_agent/indexer.py

def hybrid_search(query: str, exts: tuple[str, ...] | None = None, limit: int = 10):
    # 0) 현재 허용 루트(체크리스트) 읽기
    allowed_roots = GLOBAL_INDEX.get("roots")  # tuple(...) or None
    allow_set = set(allowed_roots) if allowed_roots else None

    # 1) 인덱스에서 넉넉히 뽑고
    base_limit = max(limit * 3, 10)
    hits = search_index_by_name(query, exts=exts, limit=base_limit) or []

    # 2) 체크리스트가 있으면 root_id로 필터
    if allow_set:
        hits = [h for h in hits if h.get("root_id") in allow_set]

    # 3) 있으면 반환
    if hits:
        return hits[:limit]

    # 4) 체크리스트가 **있으면** 전역 fallback 금지 → 빈 리스트
    if allowed_roots is not None:
        return []

    # 5) (전체 모드일 때만) Dooray 전역 fallback
    drives = list_personal_drives()
    if not drives:
        return []
    drive_id = drives[0]["id"]
    root_hits = search_in_root(drive_id, query) or []

    out = []
    for it in root_hits:
        if it["type"] == "file":
            ext = _ext_lower(it["name"])
            if exts and ext not in exts:
                continue
            out.append({"id": it["id"], "name": it["name"], "type":"file", "_path":"/", "ext": ext})
        elif it["type"] == "folder":
            for f in _paginate(list_files_in_folder, drive_id, it["id"], size=50):
                ext = _ext_lower(f["name"])
                if exts and ext not in exts:
                    continue
                out.append({"id": f["id"], "name": f["name"], "type":"file",
                            "_path": f"/{it['name']}/", "ext": ext})
                if len(out) >= limit: break
        if len(out) >= limit: break
    return out[:limit]


