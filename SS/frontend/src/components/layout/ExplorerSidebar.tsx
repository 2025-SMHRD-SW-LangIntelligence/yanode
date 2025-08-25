import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Clock, Star, HardDrive, Folder, FolderOpen, ChevronRight, ChevronDown } from "lucide-react";
import DriveTree from "../drive/DriveTree";
import type { FileItem } from "../../types";
import type { DriveFolder } from "../../features/files/hooks/useDriveFolders";

type CheckState = "checked" | "indeterminate" | "unchecked";

// 서버에서 내려오는 드라이브/폴더 타입(홈 화면 구조 기준)
type ApiFile = FileItem;
type ApiFolder = {
  id: string;
  name: string;
  subFolders?: ApiFolder[];
  files?: ApiFile[];
};
type ApiDrive = {
  id: string;
  name: string;
  folders: ApiFolder[];
};
type ApiEnvelope = {
  apiTitle: string;
  apiURL: string;
  drives: ApiDrive[];
};

type ExplorerSidebarProps = {
  recentFiles: FileItem[];
  favoriteFiles: FileItem[];
  // 외부에서 드라이브 트리를 직접 주면 그걸 사용(우선)
  driveFolders?: DriveFolder[];
  toggleFolder?: (id: string, parentId?: string) => void;

  onFileSelect: (file: FileItem) => void;
  activeTabDefault?: "recent" | "favorites" | "drive";
  onClose?: () => void;

  // 폴더 선택(체크박스) – 외부 제어 가능
  selectedFolderIds?: string[];
  onToggleSelectFolder?: (id: string, parentId?: string) => void;
  onClearSelection?: () => void;
  onSelectAll?: () => void;
  getCheckState?: (id: string) => CheckState;

  // 내부에서 API 호출할 때 base URL
  apiEndpointBase?: string;

  // 내부 선택 상태를 상위로 통지하고 싶을 때
  onSelectionChange?: (ids: string[]) => void;
};

export default function ExplorerSidebar({
  recentFiles,
  favoriteFiles,
  driveFolders: driveFoldersProp,
  toggleFolder: toggleFolderProp,
  onFileSelect,
  activeTabDefault = "recent",
  onClose,

  selectedFolderIds: selectedFolderIdsProp,
  onToggleSelectFolder: onToggleSelectFolderProp,
  onClearSelection: onClearSelectionProp,
  onSelectAll: onSelectAllProp,
  getCheckState: getCheckStateProp,

  apiEndpointBase = "http://localhost:8090",
  onSelectionChange,
}: ExplorerSidebarProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "favorites" | "drive">(activeTabDefault);
  const currentSidebarFiles =
    activeTab === "recent" ? recentFiles.slice(0, 6) : favoriteFiles.slice(0, 6);

  // ====== 내부 드라이브 상태 (외부 미제공 시 자동 로딩) ======
  const [loading, setLoading] = useState(false);
  const [driveFoldersLocal, setDriveFoldersLocal] = useState<DriveFolder[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (driveFoldersProp && driveFoldersProp.length > 0) return; // 외부 제공 우선
      setLoading(true);
      try {
        const res = await fetch(`${apiEndpointBase}/api/dooray/driveLoading`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Drive API 요청 실패");
        const data: ApiEnvelope[] = await res.json();
        const transformed = transformApiToDriveFolders(data, { groupByProvider: false, filterRootTrash: false });
        if (!cancelled) setDriveFoldersLocal(transformed);
      } catch (e) {
        console.error(e);
        if (!cancelled) setDriveFoldersLocal([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpointBase, driveFoldersProp]);

  // 최종 드라이브 데이터 소스
  const driveFolders = useMemo<DriveFolder[] | null>(() => {
    if (driveFoldersProp && driveFoldersProp.length > 0) return driveFoldersProp;
    return driveFoldersLocal;
  }, [driveFoldersProp, driveFoldersLocal]);

  // ====== 확장 토글 ======
  const toggleFolderLocal = (id: string) => {
    if (!driveFolders) return;
    setDriveFoldersLocal(prev => (prev ? mapToggleExpanded(prev, id) : prev));
  };
  const toggleFolder = toggleFolderProp ?? toggleFolderLocal;

  // ====== 선택(체크박스) 상태 ======
  const [selectedFolderIdsLocal, setSelectedFolderIdsLocal] = useState<string[]>([]);
  const selectedFolderIds = selectedFolderIdsProp ?? selectedFolderIdsLocal;

  useEffect(() => {
    onSelectionChange?.(selectedFolderIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolderIds.join("|")]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, DriveFolder>();
    const walk = (nodes?: DriveFolder[]) => {
      nodes?.forEach(n => {
        m.set(n.id, n);
        if (n.subFolders?.length) walk(n.subFolders);
      });
    };
    walk(driveFolders ?? undefined);
    return m;
  }, [driveFolders]);

  const getDescendantIds = (id: string): string[] => {
    const res: string[] = [];
    const dfs = (n?: DriveFolder) => {
      if (!n) return;
      n.subFolders?.forEach(c => {
        res.push(c.id);
        dfs(c);
      });
    };
    dfs(nodeMap.get(id));
    return res;
  };

  const onToggleSelectFolderLocal = (id: string) => {
    setSelectedFolderIdsLocal(prev => {
      const set = new Set(prev);
      const all = [id, ...getDescendantIds(id)];
      const isSelected = set.has(id);
      if (isSelected) {
        all.forEach(x => set.delete(x));
      } else {
        all.forEach(x => set.add(x));
      }
      return Array.from(set);
    });
  };

  const onClearSelectionLocal = () => setSelectedFolderIdsLocal([]);
  const onSelectAllLocal = () => {
    const allIds: string[] = [];
    const walk = (nodes?: DriveFolder[]) => {
      nodes?.forEach(n => {
        allIds.push(n.id);
        if (n.subFolders?.length) walk(n.subFolders);
      });
    };
    walk(driveFolders ?? undefined);
    setSelectedFolderIdsLocal(allIds);
  };

  const countSubtree = (id: string) => {
    let total = 0;
    let selected = 0;
    const set = new Set(selectedFolderIds);
    const dfs = (n?: DriveFolder) => {
      if (!n) return;
      total += 1;
      if (set.has(n.id)) selected += 1;
      n.subFolders?.forEach(dfs);
    };
    dfs(nodeMap.get(id));
    return { total, selected };
  };

  const getCheckStateLocal = (id: string): CheckState => {
    const { total, selected } = countSubtree(id);
    if (selected === 0) return "unchecked";
    if (selected === total) return "checked";
    return "indeterminate";
  };

  const onToggleSelectFolder = onToggleSelectFolderProp ?? ((id: string) => onToggleSelectFolderLocal(id));
  const onClearSelection = onClearSelectionProp ?? onClearSelectionLocal;
  const onSelectAll = onSelectAllProp ?? onSelectAllLocal;
  const getCheckState = getCheckStateProp ?? getCheckStateLocal;

  return (
    <div className="w-80 h-full bg-muted border-r-2 border-border flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">탐색</h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg w-8 h-8 p-0">
            ×
          </Button>
        )}
      </div>

      {/* 바디 */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* 탭 */}
        <div className="flex space-x-1 bg-accent rounded-lg p-1 border border-border mb-4">
          <button
            onClick={() => setActiveTab("recent")}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-md text-xs font-medium ${activeTab === "recent" ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Clock className="w-3 h-3" />
            <span>최근</span>
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-md text-xs font-medium ${activeTab === "favorites" ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Star className="w-3 h-3" />
            <span>즐겨찾기</span>
          </button>
          <button
            onClick={() => setActiveTab("drive")}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-md text-xs font-medium ${activeTab === "drive" ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <HardDrive className="w-3 h-3" />
            <span>드라이브</span>
          </button>
        </div>

        {/* 콘텐츠 */}
        {activeTab === "drive" ? (
          <div className="flex-1 overflow-y-auto pr-1">
            {/* 선택 요약/버튼 */}
            <div className="flex items-center justify-between px-1 py-2 text-xs text-muted-foreground">
              <span>선택된 폴더: {selectedFolderIds?.length ?? 0}</span>
              <div className="flex gap-2">
                <button className="underline hover:text-foreground" onClick={onSelectAll}>전체선택</button>
                <button className="underline hover:text-foreground" onClick={onClearSelection}>초기화</button>
              </div>
            </div>

            {/* 드라이브 트리 */}
            {!driveFolders ? (
              <div className="text-center text-xs text-muted-foreground py-6">
                {loading ? "드라이브 로딩 중..." : "드라이브 데이터가 없습니다."}
              </div>
            ) : (
              // 렌더 부분
              <DriveTree
                driveFolders={driveFolders!}   
                toggleFolder={toggleFolder}
                onFileSelect={onFileSelect}
                selectedFolderIds={selectedFolderIds}
                onToggleCascade={onToggleSelectFolder}
                getCheckState={getCheckState}
              />

            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-2">
              {currentSidebarFiles.map(file => (
                <div
                  key={file.id}
                  className="group p-3 rounded-xl bg-background hover:bg-accent transition-all cursor-pointer border border-border"
                  onClick={() => onFileSelect(file)}
                >
                  <div className="flex items-center space-x-3 gap-2">
                    <span className="text-lg flex-shrink-0">{file.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{file.type} • {file.modified}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   API → DriveFolder[] 변환
   ========================= */

function mapApiFileToFileItem(file: any): FileItem {
  return {
    id: String(file.id ?? (globalThis.crypto?.randomUUID?.() ?? `tmp-${Date.now()}-${Math.random()}`)),
    name: String(file.name ?? "이름없는 파일"),
    type: String(file.type ?? "file"),
    icon: file.icon ?? "📄",
    modified: file.modified ?? "",
    modifiedBy: file.modifiedBy ?? "",
    isFavorite: Boolean(file.isFavorite ?? false),
  };
}

// (수정) 폴더(재귀) → DriveFolder
function apiFolderToDriveFolder(f: any, prefix: string): DriveFolder {
  const myId = `${prefix}/folder-${String(f.id)}`;
  return {
    id: myId,
    name: String(f.name ?? "이름없는 폴더"),
    icon: "📁",
    isExpanded: false,
    files: (f.files ?? []).map(mapApiFileToFileItem),
    subFolders: (f.subFolders ?? []).map((sf: any) =>
      apiFolderToDriveFolder(sf, `${myId}`)
    ),
  };
}

// (수정) 드라이브 → DriveFolder
function apiDriveToDriveFolder(drive: any, filterRootTrash = true): DriveFolder {
  const driveId = `drive-${String(drive.id)}`;
  const folders = (drive.folders ?? []).filter((f: any) =>
    filterRootTrash ? !["root", "trash"].includes(String(f.name)) : true
  );

  return {
    id: driveId,
    name: String(drive.name ?? "Unnamed Drive"),
    icon: "💾",
    isExpanded: true, // 펼쳐서 구조 확인
    files: [],
    subFolders: folders.map((f: any) => apiFolderToDriveFolder(f, driveId)),
  };
}


function transformApiToDriveFolders(
  envelopes: any[],
  opts: { groupByProvider?: boolean; filterRootTrash?: boolean } = {}
): DriveFolder[] {
  const { groupByProvider = true, filterRootTrash = false } = opts;

  if (groupByProvider) {
    const grouped: DriveFolder[] = [];
    (envelopes ?? []).forEach((env, idx) => {
      const drives = env.drives ?? [];
      const driveNodes = drives.map((d: any) => apiDriveToDriveFolder(d, filterRootTrash));
      grouped.push({
        id: `api-${idx}-${slugify(env.apiTitle ?? "API")}`,
        name: String(env.apiTitle ?? "API"),
        icon: "🔌",
        isExpanded: true,
        files: [],
        subFolders: driveNodes,
      });
    });

    console.log(
      "[ExplorerSidebar] transformed (grouped by API): providers=",
      grouped.length,
      " total files=",
      grouped.reduce((acc, n) => acc + countFiles(n), 0)
    );
    return grouped;
  }

  const flat: DriveFolder[] = [];
  (envelopes ?? []).forEach(env => {
    (env.drives ?? []).forEach((d: any) => flat.push(apiDriveToDriveFolder(d, filterRootTrash)));
  });

  console.log(
    "[ExplorerSidebar] transformed (flat drives):",
    flat.length,
    " total files=",
    flat.reduce((acc, n) => acc + countFiles(n), 0)
  );
  return flat;
}

function countFiles(node: DriveFolder): number {
  const self = (node.files ?? []).length;
  const sub = (node.subFolders ?? []).reduce((a, c) => a + countFiles(c), 0);
  return self + sub;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* =========================
   확장 토글
   ========================= */
function mapToggleExpanded(nodes: DriveFolder[], targetId: string): DriveFolder[] {
  const deep = (arr: DriveFolder[]): DriveFolder[] =>
    arr.map(n => {
      if (n.id === targetId) return { ...n, isExpanded: !n.isExpanded };
      if (n.subFolders?.length) return { ...n, subFolders: deep(n.subFolders) };
      return n;
    });
  return deep(nodes);
}
