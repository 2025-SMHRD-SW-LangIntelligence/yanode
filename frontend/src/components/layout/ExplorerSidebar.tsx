import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Clock, Star, HardDrive, Folder, FolderOpen, ChevronRight, ChevronDown, RefreshCw, Loader2 } from "lucide-react";
import DriveTree from "../drive/DriveTree";
import type { FileItem } from "../../types";
import type { DriveFolder } from "../../features/files/hooks/useDriveFolders";
import { FileSearchModal } from "../../features/files/FileSearchModal";
import { flattenDriveFiles } from "../../features/files/utils/flattenDriveFiles";

type CheckState = "checked" | "indeterminate" | "unchecked";

export default function ExplorerSidebar({
  favoriteFiles,
  driveFolders,
  toggleFolder,
  onFileSelect,
  activeTabDefault = "recent",
  onClose,
  // ✅ 폴더 선택 관련 (옵션)
  selectedFolderIds,
  onToggleSelectFolder,
  onClearSelection,
  onSelectAll,
  getCheckState,
  fetchDriveFolders,
  recentFiles,
}: {
  favoriteFiles: FileItem[];
  driveFolders: DriveFolder[];
  toggleFolder: (id: string, parentId?: string) => void;
  onFileSelect: (file: FileItem) => void;
  activeTabDefault?: "recent" | "favorites" | "drive";
  onClose?: () => void;
  // 선택 기능 (옵션)
  selectedFolderIds?: string[];
  onToggleSelectFolder?: (id: string, parentId?: string) => void;
  onClearSelection?: () => void;
  onSelectAll?: () => void;
  getCheckState?: (id: string) => CheckState;
  fetchDriveFolders: () => void;
  recentFiles: FileItem[];
}) {
  const [activeTab, setActiveTab] = useState<"recent" | "favorites" | "drive">(activeTabDefault);
  const [loadingDots, setLoadingDots] = useState(0);

  // ====== 내부 드라이브 상태 (외부 미제공 시 자동 로딩) ======
  const [loading, setLoading] = useState(false);
  const [driveFoldersLocal, setDriveFoldersLocal] = useState<DriveFolder[] | null>(null);
  const allFiles = flattenDriveFiles(driveFolders);
  const [reindexing, setReindexing] = useState(false);

  const favoriteFilesToRender = favoriteFiles
    .map(r => allFiles.find(f => f.id === r.favUrl))
    .filter(Boolean)
    .map(f => ({ ...f, isFavorite: true })) as FileItem[];


  const handleRefresh = async () => {
    if (loading) return;           // 로딩 중 중복 클릭 방지

    setLoading(true);
    try {
      const res = await fetchDriveFolders();

    } catch (err) {
      // console.error("드라이브 불러오기 실패", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!driveFolders || driveFolders.length === 0) {
      // 드라이브 연결 끊김 → 선택 초기화
      onClearSelection?.();
    }
  }, [driveFolders]);

  useEffect(() => {
    if (!loading) return;                // 로딩 아닐 땐 동작 안 함
    const id = setInterval(() => {
      setLoadingDots(d => (d + 1) % 4);  // 0→1→2→3→0 순환
    }, 400);
    return () => clearInterval(id);
  }, [loading]);

  const handleReindex = async () => {
    if (!selectedFolderIds || selectedFolderIds.length === 0 || reindexing) {
      return;
    }
    setReindexing(true);
    try {
      const response = await fetch('http://localhost:8000/reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_ids: selectedFolderIds }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '재인덱싱에 실패했습니다.');
      }
      const result = await response.json();
      console.log('재인덱싱 성공:', result);
      alert('선택한 폴더가 AI 검색 대상으로 성공적으로 적용되었습니다!');
    } catch (error) {
      console.error('재인덱싱 중 오류 발생:', error);
      alert(`오류가 발생했습니다: ${(error as Error).message}`);
    } finally {
      setReindexing(false);
    }
  };

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
            className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-md text-xs font-medium ${activeTab === "recent"
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Clock className="w-3 h-3" />
            <span>최근</span>
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-md text-xs font-medium ${activeTab === "favorites"
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Star className="w-3 h-3" />
            <span>즐겨찾기</span>
          </button>
          <button
            onClick={() => setActiveTab("drive")}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-md text-xs font-medium ${activeTab === "drive"
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
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
              <div className="flex items-center gap-2">
                <button className="underline hover:text-foreground" onClick={onSelectAll}>전체선택</button>
                <button className="underline hover:text-foreground" onClick={onClearSelection}>초기화</button>
                <button
                  className="underline font-bold text-primary hover:text-foreground disabled:opacity-50 disabled:no-underline"
                  onClick={handleReindex}
                  disabled={reindexing || !selectedFolderIds || selectedFolderIds.length === 0}
                  title="선택한 폴더를 AI 검색 대상으로 적용"
                >
                  {reindexing ? "적용 중..." : "적용"}
                </button>

                {/* 새로고침 버튼 추가 */}
                <button
                  className="inline-flex items-center gap-1 underline hover:text-foreground disabled:opacity-50"
                  onClick={handleRefresh}
                  disabled={loading}
                  aria-label="드라이브 다시 불러오기"
                  title="드라이브 다시 불러오기"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />

                </button>
              </div>

            </div>

            {/* 드라이브 트리 */}
            {loading ? (
              <div className="text-center text-xs text-muted-foreground py-6" aria-live="polite">
                <div className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span className="animate-pulse">
                    드라이브 로딩 중
                    <span className="inline-block" aria-hidden="true">
                      {".".repeat(loadingDots)}
                    </span>
                  </span>
                </div>
              </div>
            ) : !driveFolders || driveFolders.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-6" aria-live="polite">
                드라이브 데이터가 없습니다.
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
        ) : activeTab === "recent" ? (
          <div className="flex-1 overflow-y-auto pr-1">
            {recentFiles.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-6">
                최근 파일이 없습니다.
              </div>
            ) : (
              <div className="space-y-1">
                {recentFiles.map((file, index) => (
                  <div
                    key={file.id ?? index}
                    className="group flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer border border-border"
                    onClick={() => {
                      onFileSelect(file)
                    }}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-lg flex-shrink-0">{file.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {file.type} • {(file.size / 1024 / 1024).toFixed(1)}MB
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "favorites" ? (
          <div className="flex-1 overflow-y-auto pr-1">
            {favoriteFilesToRender.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-6">
                즐겨찾기가 없습니다.
              </div>
            ) : (
              <div className="space-y-1">
                {favoriteFilesToRender.map((file, index) => (
                  <div
                    key={file.id ?? index}
                    className="group flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer border border-border"
                    onClick={() => {
                      onFileSelect(file)
                    }}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-lg flex-shrink-0">{file.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {file.type} • {(file.size / 1024 / 1024).toFixed(1)}MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.(file.id);
                      }}
                    >
                      <Star
                        className={`w-4 h-4 ${file.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                      />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  )
};
