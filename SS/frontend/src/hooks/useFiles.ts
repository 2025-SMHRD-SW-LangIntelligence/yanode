import { useState, useCallback, useMemo } from 'react';
import type { FileItem, FilesHookReturn } from '../types';
import { initialFiles } from '../data/mockData';


export function useFiles(): FilesHookReturn {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [showPreviewDrawer, setShowPreviewDrawer] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const handleFileSelect = useCallback((file: FileItem) => {
    setSelectedFile(file);
    setShowPreviewDrawer(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setShowPreviewDrawer(false);
    setSelectedFile(null);
  }, []);

  const handleToggleFavorite = useCallback((fileId: string) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId 
          ? { ...file, isFavorite: !file.isFavorite }
          : file
      )
    );
  }, []);

  // 파일 통계를 메모이제이션
  const fileStats = useMemo(() => {
    const totalFiles = files.length;
    const favoriteFiles = files.filter(file => file.isFavorite);
    const recentFiles = files.slice(0, 5);
    
    return {
      totalFiles,
      favoriteFiles,
      recentFiles,
      favoriteCount: favoriteFiles.length
    };
  }, [files]);

  return {
    files,
    showPreviewDrawer,
    selectedFile,
    onFileSelect: handleFileSelect,
    onToggleFavorite: handleToggleFavorite,
    handleClosePreview,
    ...fileStats
  };
}