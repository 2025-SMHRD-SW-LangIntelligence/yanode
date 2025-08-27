import { useMemo, useCallback } from 'react';
import type { FileItem } from '../../../types';

export function useFileData(files: FileItem[]) {
  const recentFiles = useMemo(() => {
    const order = ['2시간 전', '5시간 전', '1일 전', '2일 전', '3일 전', '1주 전'];
    return [...files].sort((a, b) => order.indexOf(a.lastUpdater) - order.indexOf(b.lastUpdater));
  }, [files]);

  const favoriteFiles = useMemo(() => files.filter(f => f.isFavorite), [files]);

  // ✅ folderIds 배열 지원
  const searchFiles = useCallback((query: string, folderIds?: string[] | string) => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const selectedIds = Array.isArray(folderIds) ? folderIds : (folderIds ? [folderIds] : []);
    const inSelected = (file: FileItem) =>
      selectedIds.length === 0 || selectedIds.some(id => file.path.includes(`/${id}/`));

    const getScore = (file: FileItem) => {
      let score = 0;
      const name = file.name.toLowerCase();
      const path = file.path.toLowerCase();
      const type = file.type.toLowerCase();
      const modifiedBy = file.lastUpdater.toLowerCase();
      if (name.includes(term)) { score += 10; if (name.startsWith(term)) score += 5; }
      if (path.includes(term)) score += 8;
      if (type.includes(term)) score += 6;
      if (modifiedBy.includes(term)) score += 4;
      if (file.isFavorite) score += 2;
      if (['마케팅', 'marketing'].includes(term)) {
        if (path.includes('/marketing/') || name.includes('마케팅') || name.includes('브랜드') || name.includes('고객')) {
          score += 15;
        }
      }
      return score;
    };

    return files
      .filter(inSelected)
      .map(file => ({ file, score: getScore(file) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.file)
      .slice(0, 5);
  }, [files]);

  return { recentFiles, favoriteFiles, searchFiles };
}
