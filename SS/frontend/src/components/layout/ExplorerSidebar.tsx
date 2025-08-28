// src/components/layout/ExplorerSidebar.tsx
import { Button } from "../ui/button";
import { Clock, Star, HardDrive } from "lucide-react";
import DriveTree from "../drive/DriveTree";
import type { FileItem } from "../../types";
import type { DriveFolder } from "../../features/files/hooks/useDriveFolders";
import { useState, useMemo } from "react";
import { FileSearchModal } from "../../features/files/FileSearchModal";

type CheckState = "checked" | "indeterminate" | "unchecked";

export default function ExplorerSidebar({
  recentFiles,
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
}: {
  recentFiles: FileItem[];
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
}) {
  const [activeTab, setActiveTab] = useState<"recent" | "favorites" | "drive">(activeTabDefault);
  const currentSidebarFiles = activeTab === "recent" ? recentFiles.slice(0, 6) : favoriteFiles.slice(0, 6);

  return (
    <div className="w-80 h-full bg-muted border-r-2 border-border flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">탐색</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg w-8 h-8 p-0"
          >
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
            {/* ✅ 선택 요약/버튼 (한 번만 렌더) */}
            {onToggleSelectFolder && (
              <div className="flex items-center justify-between px-1 py-2 text-xs text-muted-foreground">
                <span>선택된 폴더: {selectedFolderIds?.length ?? 0}</span>
                <div className="flex gap-2">
                  {onSelectAll && (
                    <button className="underline hover:text-foreground" onClick={onSelectAll}>
                      전체선택
                    </button>
                  )}
                  {onClearSelection && (
                    <button className="underline hover:text-foreground" onClick={onClearSelection}>
                      초기화
                    </button>
                  )}
                </div>
              </div>
            )}

            <DriveTree
              driveFolders={driveFolders}
              toggleFolder={toggleFolder}
              onFileSelect={onFileSelect}
              selectedFolderIds={selectedFolderIds}
              onToggleCascade={onToggleSelectFolder}
              getCheckState={getCheckState}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-2">
              {currentSidebarFiles.map((file) => (
                <div
                  key={file.id}
                  className="group p-3 rounded-xl bg-background hover:bg-accent transition-all cursor-pointer border border-border"
                  onClick={() => onFileSelect(file)}
                >
                  <div className="flex items-center space-x-3 gap-2">
                    <span className="text-lg flex-shrink-0">{file.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {file.type} • {file.size}
                      </p>
                    </div>
                    {/* 즐겨찾기 버튼은 필요 시 상위에서 prop 추가 */}
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
