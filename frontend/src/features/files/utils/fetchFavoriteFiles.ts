import type { FileItem } from '../../../types';

export const fetchFavoriteFiles = async (globalValue: string): Promise<FileItem[]> => {
  try {
    const res = await fetch(`${globalValue}/fav/list`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("즐겨찾기 파일 조회 실패");
    const data = await res.json();
    return data as FileItem[];
  } catch (error) {
    // console.error(error);
    return [];
  }
};
