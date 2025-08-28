// src/components/drive/DriveTree.tsx
import React, { useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import type { DriveFolder } from "../../features/files/hooks/useDriveFolders";
import type { FileItem } from "../../types";

type CheckState = "checked" | "indeterminate" | "unchecked";

function TriCheckbox({
  state,
  onChange,
}: {
  state: CheckState;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === "indeterminate";
  }, [state]);


  return (
    <input
      ref={ref}
      type="checkbox"
      className="h-3.5 w-3.5 accent-blue-500"
      checked={state === "checked"}
      onChange={(e) => {
        e.stopPropagation();
        onChange();
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

// 재귀 폴더 노드
function FolderNode({
  folder,
  toggleFolder,
  onFileSelect,
  onToggleCascade,
  getCheckState,
}: {
  folder: DriveFolder;
  toggleFolder: (id: string, parentId?: string) => void;
  onFileSelect: (file: FileItem) => void;
  onToggleCascade?: (id: string, parentId?: string) => void;
  getCheckState?: (id: string) => CheckState;
}) {
  return (
    <div className="space-y-1">
      <div
        className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg cursor-pointer group transition-all"
        onClick={() => toggleFolder(folder.id)}
      >
        {onToggleCascade && getCheckState && (
          <TriCheckbox state={getCheckState(folder.id)} onChange={() => onToggleCascade(folder.id)} />
        )}

        <div className="flex items-center gap-1">
          {folder.isExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> :
            <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          {folder.isExpanded ? <FolderOpen className="w-4 h-4 text-blue-500" /> :
            <Folder className="w-4 h-4 text-blue-500" />}
        </div>

        <span className="text-sm font-medium group-hover:text-foreground">{folder.name}</span>
        <span className="text-xs text-muted-foreground ml-auto">{folder.files?.length ?? 0}</span>
      </div>

      {folder.isExpanded && (
        <div className="ml-6 space-y-1">
          {/* 하위 폴더 재귀 렌더링 */}
          {folder.folders?.map(sub => (
            <FolderNode
              key={sub.id} // ✅ 고유 key
              folder={sub}
              toggleFolder={toggleFolder}
              onFileSelect={onFileSelect}
              onToggleCascade={onToggleCascade}
              getCheckState={getCheckState}
            />
          ))}

          {/* 파일 렌더링 */}
          {folder.files?.map(file => (
            <div
              key={file.id} // ✅ 고유 key
              className="group p-2 rounded-lg hover:bg-accent cursor-pointer flex items-center gap-2"
              onClick={() => onFileSelect(file)}
            >
              <span className="text-lg flex-shrink-0">{file.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground truncate">{file.type} • {(file.size / 1024 / 1024).toFixed(1)}MB</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DriveTree({
  driveFolders,
  toggleFolder,
  onFileSelect,
  // 선택/토글/상태
  selectedFolderIds,
  onToggleCascade,
  getCheckState,
}: {
  driveFolders: DriveFolder[];
  toggleFolder: (id: string, parentId?: string) => void;
  onFileSelect: (file: FileItem) => void;
  selectedFolderIds?: string[];
  onToggleCascade?: (id: string, parentId?: string) => void;
  getCheckState?: (id: string) => CheckState;
}) {
  return (
    <div className="space-y-1">
      {driveFolders.map(folder => (
        <FolderNode
          key={folder.id}
          folder={folder}
          toggleFolder={toggleFolder}
          onFileSelect={onFileSelect}
          onToggleCascade={onToggleCascade}
          getCheckState={getCheckState}
        />
      ))}
    </div>
  );
}

function TreeNode({
  node,
  depth,
  parentId,
  toggleFolder,
  onFileSelect,
  onToggleCascade,
  getCheckState,
}: {
  node: DriveFolder;
  depth: number;
  parentId?: string;
  toggleFolder: (id: string, parentId?: string) => void;
  onFileSelect: (file: FileItem) => void;
  onToggleCascade?: (id: string, parentId?: string) => void;
  getCheckState?: (id: string) => CheckState;
}) {
  const hasChildren = (node.subFolders?.length ?? 0) > 0;
  const state: CheckState = getCheckState ? getCheckState(node.id) : "unchecked";

  const cbRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (cbRef.current) cbRef.current.indeterminate = state === "indeterminate";
  }, [state]);

  const handleToggle = () => toggleFolder(node.id, parentId);

  return (
    <div
      className="ml-[calc(10px_*_var(--depth))]"
      style={{ ["--depth" as any]: depth }}
    >
      <div
        className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg cursor-pointer group transition-all"
        onClick={handleToggle}
      >
        {/* 확장/접기 버튼 */}
        {hasChildren ? (
          <button
            className="w-5 h-5 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            title={node.isExpanded ? "접기" : "펼치기"}
          >
            {node.isExpanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5 h-5" />
        )}

        {/* tri-state 체크박스 */}
        {onToggleCascade && getCheckState && (
          <TriCheckbox
            state={state}
            onChange={() => onToggleCascade(node.id, parentId)}
          />
        )}

        {/* 아이콘 + 이름 */}
        {node.isExpanded ? (
          <FolderOpen className="w-4 h-4 text-blue-500" />
        ) : (
          <Folder className="w-4 h-4 text-blue-500" />
        )}
        <span className="text-sm font-medium group-hover:text-foreground">
          {node.name}
        </span>

        {/* 현재 폴더의 파일 수 */}
        {!!node.files?.length && (
          <span className="text-xs text-muted-foreground ml-auto">
            {node.files.length}
          </span>
        )}
      </div>

      {/* 이 폴더의 파일들 */}
      {node.isExpanded && (node.files?.length ?? 0) > 0 && (
        <div className="ml-8 space-y-1">
          {node.files!.map((file) => (
            <button
              key={file.id}
              onClick={() => onFileSelect(file)}
              className="w-full text-left flex items-center gap-2 p-1 pl-2 rounded-md hover:bg-accent border border-border"
            >
              <span className="text-sm">{(file as any).icon ?? "📄"}</span>
              <span className="text-xs truncate">{file.name}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {file.type}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 하위 폴더들 (재귀) */}
      {node.isExpanded &&
        (node.subFolders ?? []).map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            parentId={node.id}
            toggleFolder={toggleFolder}
            onFileSelect={onFileSelect}
            onToggleCascade={onToggleCascade}
            getCheckState={getCheckState}
          />
        ))}
    </div>
  );
}
