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

export function useDriveFolders(apiToken: string | undefined, initialFiles: FileItem[]) {
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | undefined>(undefined);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('drive:selected') || '[]'); } catch { return []; }
  });

  // API 불러오기 + 변환
  useEffect(() => {
    if (!apiToken) return;

    const fetchDriveFolders = async () => {
      try {
        const res = await fetch("http://localhost:8090/api/dooray/driveLoading", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          console.error("드라이브 불러오기 실패", await res.text());
          return;
        }

        const data = await res.json();
        console.log(data)

        const transformFolder = (folder: any, driveId?: string): DriveFolder => ({
          id: folder.id,
          name: folder.name,
          driveId,
          isExpanded: false,
          files: (folder.files || []).map((f: any) => ({
            id: f.id,
            name: f.name,
            type: f.type,
            size: f.size,
            creator : f.creator.organizationMemberId,
            createdAt : f.createdAt,
            lastUpdater : f.lastUpdater.organizationMemberId,
            updatedAt: f.updatedAt,
            icon: "📄",
          })),
          folders: (folder.subFolders || []).map((sub: any) => transformFolder(sub, driveId)),
        });

        const roots: DriveFolder[] = data.map((apiDrive: any) => ({
          id: `root-${apiDrive.apiIdx || apiDrive.apiTitle}`,
          name: apiDrive.apiTitle,
          isExpanded: true,
          files: [], // 루트 파일 없으면 빈 배열
          folders: apiDrive.drives.flatMap((drive: any) => 
            (drive.root.folders || []).map((f: any) => transformFolder(f, drive.id))
          ),
        }));

        setDriveFolders(roots);
      } catch (err) {
        console.error("드라이브 API 오류", err);
      }
    };

    fetchDriveFolders();
  }, [apiToken]);

  useEffect(() => {
    localStorage.setItem('drive:selected', JSON.stringify(selectedFolderIds));
  }, [selectedFolderIds]);

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
  };
}