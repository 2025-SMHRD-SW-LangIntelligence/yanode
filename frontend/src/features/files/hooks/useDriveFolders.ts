import { useState, useEffect, useMemo } from 'react';
import type { FileItem } from '../../../types';

export interface DriveFolder {
  id: string;
  name: string;
  driveId?: string;
  isExpanded: boolean;
  files: FileItem[];
  folders?: DriveFolder[];
  icon?: string;
}

type CheckState = 'checked' | 'indeterminate' | 'unchecked';

export function useDriveFolders(
  apiToken: string | undefined,
  initialFiles: FileItem[],
  onSelectAll?: () => void
) {
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>(() => {
    try {
      const saved = localStorage.getItem('drive:folders');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeFolderId, setActiveFolderId] = useState<string | undefined>(undefined);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('drive:selected') || '[]');
      return saved.length ? saved : [];
    } catch { return []; }
  });

  // ===== 트리 유틸 =====
  const allIds = useMemo(() => {
    const ids: string[] = [];
    const walk = (nodes: DriveFolder[]) => {
      nodes.forEach(f => {
        ids.push(f.id);
        if (f.folders?.length) walk(f.folders);
      });
    };
    walk(driveFolders);
    return ids;
  }, [driveFolders]);

  // API 불러오기 + 변환
  const fetchDriveFolders = async (): Promise<DriveFolder[]> => {
    if (!apiToken) return [];
    try {
      const res = await fetch("http://localhost:8090/api/dooray/driveLoading", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        // console.error("드라이브 불러오기 실패", await res.text());
        return [];
      }
      const data = await res.json();
      // console.log(data)

      const getFileIcon = (filename: string): string => {
        const ext = filename.split('.').pop()?.toLowerCase();

        switch (ext) {
          case 'hwp':             // 한글
            return '📝';
          case 'doc':
          case 'docx':            // 워드
            return '📝';
          case 'xls':
          case 'xlsx':            // 엑셀
            return '📊';
          case 'ppt':
          case 'pptx':            // 파워포인트
            return '📈';
          case 'txt':             // 텍스트 파일
            return '📃';
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
          case 'bmp':
          case 'svg':             // 사진
            return '🖼️';
          case 'pdf':             // PDF
            return '📄';
          default:                // 기타 파일
            return '📁';
        }
      };


      const transformFolder = (folder: any, driveId?: string): DriveFolder => ({
        id: folder.id,
        name: folder.name,
        driveId,
        isExpanded: false,
        files: (folder.files || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          type: f.name.split(".").pop() || '',
          size: f.size,
          creator: f.creator.organizationMemberId,
          createdAt: f.createdAt,
          lastUpdater: f.lastUpdater.organizationMemberId,
          updatedAt: f.updatedAt,
          driveId: f.driveId,
          icon: getFileIcon(f.name.split(".").pop() || ''),
        })),
        folders: (folder.subFolders || []).map((sub: any) => transformFolder(sub, driveId)),
      });

      const roots: DriveFolder[] = data.map((apiDrive: any) => ({
        id: `root-${apiDrive.apiId || apiDrive.apiTitle}`,
        driveId: apiDrive.drives[0]?.project?.id,
        name: apiDrive.apiTitle,
        isExpanded: true,
        files: [], // 루트 파일 없으면 빈 배열
        folders: apiDrive.drives.flatMap((drive: any) =>
          (drive.root.folders || []).map((f: any) => transformFolder(f, apiDrive.drives[0]?.project?.id))
        ),
      }));

      setDriveFolders(roots);
      localStorage.setItem('drive:folders', JSON.stringify(roots));
      return roots;
    } catch (err) {
      // console.error("드라이브 API 오류", err);
      return [];
    }
  };

  useEffect(() => {
    localStorage.setItem('drive:folders', JSON.stringify(driveFolders));
  }, [driveFolders]);

  useEffect(() => {
    const savedSelected = localStorage.getItem('drive:selected');

    if ((!savedSelected || JSON.parse(savedSelected).length === 0) && driveFolders.length) {
      // 선택값 없으면 전체 선택
      if (onSelectAll) onSelectAll();        // ✅ ExplorerSidebar의 onSelectAll 실행
      setSelectedFolderIds(allIds);          // 내부 상태도 전체 선택
    }
  }, [driveFolders, allIds, onSelectAll]);

  useEffect(() => {
    localStorage.setItem('drive:selected', JSON.stringify(selectedFolderIds));
  }, [selectedFolderIds]);

  const getDescendantIds = (id: string): string[] => {
    const out: string[] = [];
    const collect = (nodes: DriveFolder[]) => {
      nodes.forEach(n => {
        out.push(n.id);
        if (n.folders?.length) collect(n.folders);
      });
    };
    const dfs = (nodes: DriveFolder[]) => {
      for (const n of nodes) {
        if (n.id === id) {
          if (n.folders?.length) collect(n.folders);
          return;
        }
        if (n.folders?.length) dfs(n.folders);
      }
    };
    dfs(driveFolders);
    return out;
  };

  const getChildrenIdsInclusive = (id: string): string[] => [id, ...getDescendantIds(id)];

  const getCheckState = (id: string): CheckState => {
    const ids = getChildrenIdsInclusive(id);
    const selected = ids.filter(i => selectedFolderIds.includes(i)).length;
    if (selected === 0) return 'unchecked';
    if (selected === ids.length) return 'checked';
    return 'indeterminate';
  };

  const toggleFolder = (folderId: string) => {
    setDriveFolders(prev =>
      prev.map(f => {
        const toggleRecursively = (node: DriveFolder): DriveFolder => {
          if (node.id === folderId) return { ...node, isExpanded: !node.isExpanded };
          if (node.folders?.length) {
            return { ...node, folders: node.folders.map(toggleRecursively) };
          }
          return node;
        };
        return toggleRecursively(f);
      })
    );
    setActiveFolderId(folderId);
  };

  const toggleSelectFolder = (folderId: string) => {
    setSelectedFolderIds(prev =>
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  const toggleSelectCascade = (folderId: string) => {
    const ids = getChildrenIdsInclusive(folderId);
    const allSelected = ids.every(id => selectedFolderIds.includes(id));
    setSelectedFolderIds(prev => {
      if (allSelected) return prev.filter(id => !ids.includes(id));
      const set = new Set(prev);
      ids.forEach(id => set.add(id));
      return Array.from(set);
    });
  };

  const clearSelectedFolders = () => setSelectedFolderIds([]);
  const selectAllFolders = () => setSelectedFolderIds(allIds);

  return {
    driveFolders,
    toggleFolder,
    activeFolderId,
    selectedFolderIds,
    toggleSelectFolder,
    toggleSelectCascade,
    clearSelectedFolders,
    selectAllFolders,
    getCheckState,
    fetchDriveFolders,
    setDriveFolders
  };
}