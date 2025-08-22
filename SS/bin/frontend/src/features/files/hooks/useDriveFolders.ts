import { useState, useEffect, useMemo } from 'react';
import type { FileItem } from '../../../types';

export interface DriveFolder {
  id: string;
  name: string;
  isExpanded: boolean;
  files: FileItem[];
  subFolders?: DriveFolder[];
  icon?: string;
}

type CheckState = 'checked' | 'indeterminate' | 'unchecked';

const mockApiFolders = [
  { id: 'reports', name: '보고서', icon: '📊', subFolders: [{ id: 'quarterly', name: '분기별 보고서', icon: '📈' }] },
  { id: 'marketing', name: '마케팅', icon: '🚀', subFolders: [{ id: 'strategy', name: '전략 문서', icon: '📋' }] },
  { id: 'projects', name: '프로젝트', icon: '📁' },
  { id: 'hr', name: '인사관리', icon: '👥' },
  { id: 'design', name: '디자인', icon: '🎨' },
  { id: 'templates', name: '템플릿', icon: '📝' },
  { id: 'analysis', name: '분석', icon: '📈' },
  { id: 'products', name: '제품', icon: '🔧' }
];

export function useDriveFolders(apiToken: string | undefined, initialFiles: FileItem[]) {
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | undefined>(undefined);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('drive:selected') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const mapped: DriveFolder[] = mockApiFolders.map(folder => ({
      ...folder,
      isExpanded: folder.id === 'reports',
      files: initialFiles.filter(file => file.path.includes(`/${folder.id}/`)),
      subFolders: folder.subFolders?.map(sub => ({
        ...sub,
        isExpanded: false,
        files: initialFiles.filter(file =>
          file.path.includes(`/${folder.id}/`) &&
          file.name.toLowerCase().includes(sub.name.substring(0, 2))
        )
      }))
    }));
    setDriveFolders(mapped);
  }, [apiToken, initialFiles]);

  useEffect(() => {
    localStorage.setItem('drive:selected', JSON.stringify(selectedFolderIds));
  }, [selectedFolderIds]);

  // ===== 트리 유틸 =====
  const allIds = useMemo(() => {
    const ids: string[] = [];
    const walk = (nodes: DriveFolder[]) => {
      nodes.forEach(f => {
        ids.push(f.id);
        if (f.subFolders?.length) walk(f.subFolders);
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
        if (n.subFolders?.length) collect(n.subFolders);
      });
    };
    const dfs = (nodes: DriveFolder[]) => {
      for (const n of nodes) {
        if (n.id === id) {
          if (n.subFolders?.length) collect(n.subFolders);
          return;
        }
        if (n.subFolders?.length) dfs(n.subFolders);
      }
    };
    dfs(driveFolders);
    return out;
  };

  const getChildrenIdsInclusive = (id: string): string[] => [id, ...getDescendantIds(id)];

  // 3상태
  const getCheckState = (id: string): CheckState => {
    const ids = getChildrenIdsInclusive(id);
    const selected = ids.filter(i => selectedFolderIds.includes(i)).length;
    if (selected === 0) return 'unchecked';
    if (selected === ids.length) return 'checked';
    return 'indeterminate';
  };

  // 펼침
  const toggleFolder = (folderId: string, parentId?: string) => {
    setDriveFolders(prev =>
      prev.map(f => {
        if (!parentId && f.id === folderId) return { ...f, isExpanded: !f.isExpanded };
        if (parentId && f.id === parentId && f.subFolders) {
          return {
            ...f,
            subFolders: f.subFolders.map(sub =>
              sub.id === folderId ? { ...sub, isExpanded: !sub.isExpanded } : sub
            ),
          };
        }
        return f;
      }),
    );
    setActiveFolderId(folderId);
  };

  // ✅ 개별 토글(그 노드만)
  const toggleSelectFolder = (folderId: string) => {
    setSelectedFolderIds(prev =>
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  // ✅ 부모/자식 일괄 토글
  const toggleSelectCascade = (folderId: string) => {
    const ids = getChildrenIdsInclusive(folderId);
    const allSelected = ids.every(id => selectedFolderIds.includes(id));
    setSelectedFolderIds(prev => {
      if (allSelected) return prev.filter(id => !ids.includes(id)); // 모두 해제
      const set = new Set(prev);
      ids.forEach(id => set.add(id));                               // 전부 선택
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
    toggleSelectFolder,     // ✅ 이제 존재
    toggleSelectCascade,    // ✅ 일괄 토글
    clearSelectedFolders,
    selectAllFolders,

    getCheckState,
  };
}
