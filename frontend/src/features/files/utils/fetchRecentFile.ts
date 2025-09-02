import type { FileItem } from '../../../types';

export async function fetchRecentFile(globalValue: string): Promise<FileItem[]> {
  try {
    const res = await fetch(`${globalValue}/recentFile/show`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('최근 파일 불러오기 실패');
    return await res.json(); // FileItem[] 형태 반환
  } catch (err) {
    // console.error(err);
    return [];
  }
}