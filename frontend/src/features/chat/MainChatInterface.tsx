import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { askRag } from '../../api/rag';
import {
  Send,
  Paperclip,
  Search,
  Settings,
  ArrowLeft,
  Bot,
  User,
} from 'lucide-react';
import type { FileItem, ChatMessage, ApiKey } from '../../types';
import { FileSearchModal } from '../files/FileSearchModal';
import ExplorerSidebar from '../../components/layout/ExplorerSidebar';
import { PanelLeft } from 'lucide-react';
import { useFileData } from '../files/hooks/useFileData';
import { useDriveFolders } from '../files/hooks/useDriveFolders';
import { useFiles } from '../../features/files/useFiles';
import { FilePreviewDrawer } from '../../features/files/FilePreviewDrawer'
import { fetchRecentFile } from '../files/utils/fetchRecentFile';
import { fetchFavoriteFiles } from '../files/utils/fetchFavoriteFiles';
import { flattenDriveFiles } from '../files/utils/flattenDriveFiles';
import { useGlobal } from '../../types/GlobalContext';

interface MainChatInterfaceProps {
  onOpenSettings: () => void;
  onFileSelect: (file: FileItem) => void;
  onBack: () => void;
  files: FileItem[];
  onToggleFavorite: (fileId: string) => void;
  apiKeys: ApiKey[];
}

export function MainChatInterface({
  onOpenSettings,
  onFileSelect,
  onBack,
  files,
  onToggleFavorite,
  apiKeys,
}: MainChatInterfaceProps) {
  const { globalValue } = useGlobal();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: '안녕하세요! 무엇을 도와드릴까요? 파일을 검색하거나 질문해 주세요.',
      timestamp: new Date(Date.now() - 60000),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const { driveFolders, toggleFolder, fetchDriveFolders, selectedFolderIds,
    toggleSelectCascade, clearSelectedFolders, selectAllFolders, getCheckState } =
    useDriveFolders(apiKeys.find(k => k.isConnected)?.apiURL, files);

  // 파일 데이터 헬퍼
  const { recentFiles, favoriteFiles, searchFiles } = useFileData(files);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const filesHook = useFiles(driveFolders);
  const showPreviewDrawer = !!selectedFile;
  const handleClosePreview = () => setSelectedFile(null);
  const [recentFilesSidebar, setRecentFilesSidebar] = useState<FileItem[]>([]);
  const [recentFilesMain, setRecentFilesMain] = useState<FileItem[]>([]);
  const [favoriteFilesSidebar, setFavoriteFilesSidebar] = useState<FileItem[]>([]);

  const location = useLocation();
  const initialQuery = (location.state as any)?.query ?? '';
  const hasSentInitialQueryRef = useRef(false);

  useEffect(() => {
    if (initialQuery && !hasSentInitialQueryRef.current) {
      handleSendMessage(initialQuery);
      hasSentInitialQueryRef.current = true; // Ref는 렌더 간 유지됨
    }
  }, [initialQuery]);

  const handleSendMessage = async (query?: string) => {
    const messageContent = query ?? inputValue;
    if (!messageContent.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // ✅ FastAPI 호출
      const data: { answer?: string; items?: any[] } = await askRag(messageContent);


      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data?.answer ?? `"${messageContent}"에 대한 응답이 없습니다.`,
        // files: mappedFiles, // 필요 시 위 매핑 주석 해제
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `에러: ${err?.message ?? String(err)}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
  }

  useEffect(() => {
    const loadRecentFiles = async () => {
      const recentIds = await fetchRecentFile(globalValue);
      const allFiles = flattenDriveFiles(driveFolders);
      const favorites = await fetchFavoriteFiles(globalValue);

      const mappedFiles = recentIds
        .map(r => allFiles.find(f => f.id === r.recentFile))
        .filter(Boolean)
        .map(f => ({
          ...f!,
          isFavorite: favorites.some(fav => fav.id === f!.id)
        })) as FileItem[];

      setRecentFilesSidebar(mappedFiles.slice(0, 12));
      setRecentFilesMain(mappedFiles.slice(0, 8));
    };
    loadRecentFiles();
  }, [driveFolders]);

  useEffect(() => {
    const loadFavorites = async () => {
      const favorites = await fetchFavoriteFiles(globalValue);
      setFavoriteFilesSidebar(favorites);
    };
    loadFavorites();
  }, []);

  const handleRecentFileSaved = async (fileId: string) => {
    const recent = await fetchRecentFile(globalValue);
    const allFiles = flattenDriveFiles(driveFolders);
    const favorites = await fetchFavoriteFiles(globalValue);

    const mappedFiles = recent
      .map(r => allFiles.find(f => f.id === r.recentFile))
      .filter(Boolean)
      .map(f => ({
        ...f!,
        isFavorite: favorites.some(fav => fav.id === f!.id)
      })) as FileItem[];

    setRecentFilesSidebar(mappedFiles.slice(0, 12));
    setRecentFilesMain(mappedFiles.slice(0, 8));
  }

  const handleToggleFavorite = async (fileId: string) => {
    await onToggleFavorite(fileId); // 서버 호출

    const favorites = await fetchFavoriteFiles(globalValue);
    setFavoriteFilesSidebar(favorites);

    setRecentFilesMain(prev =>
      prev.map(f => ({ ...f, isFavorite: favorites.some(fav => fav.id === f.id) }))
    );
    setRecentFilesSidebar(prev =>
      prev.map(f => ({ ...f, isFavorite: favorites.some(fav => fav.id === f.id) }))
    );
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* 공통 사이드바 */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden`}>
        <ExplorerSidebar
          favoriteFiles={favoriteFilesSidebar}
          driveFolders={driveFolders}
          toggleFolder={toggleFolder}
          onFileSelect={handleFileSelect}
          activeTabDefault="recent"
          onClose={() => setSidebarOpen(false)}
          selectedFolderIds={selectedFolderIds}
          onToggleSelectFolder={toggleSelectCascade}
          onClearSelection={clearSelectedFolders}
          onSelectAll={selectAllFolders}
          getCheckState={getCheckState}
          fetchDriveFolders={fetchDriveFolders}
          recentFiles={recentFilesSidebar}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="bg-background border-b-2 border-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 hover:bg-accent rounded-xl border border-border"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <PanelLeft className="w-5 h-5 text-muted-foreground" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">AI 채팅</h1>
                  <p className="text-sm text-muted-foreground">AI와 대화하며 파일을 검색하세요</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0"
                onClick={() => setShowFileModal(true)}
              >
                <Search className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0"
                onClick={onOpenSettings}
              >
                <Settings className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* 채팅 영역 */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-4xl mx-auto space-y-6">

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* ✅ 봇 메시지면 Dooray URL을 iframe으로 치환해 렌더링 */}
                {message.type === 'bot' ? (
                  <div
                    className="rounded-lg border px-3 py-2 text-sm bg-background"
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        // 줄바꿈 보존(선택)
                        .replace(/\n/g, '<br/>')
                        // Dooray preview URL → iframe 치환
                        .replace(
                          /(https?:\/\/smhrd\.dooray\.com\/preview-pages\/drives\/[A-Za-z0-9]+)/g,
                          (url) => `
                    <div class="my-2">
                      <iframe
                        src="${url}"
                        width="100%"
                        height="400"
                        style="border:none;border-radius:8px;"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        allowfullscreen
                      ></iframe>
                    </div>
                  `
                        )
                    }}
                  />
                ) : (
                  // ✅ 유저 메시지는 텍스트로 그대로
                  <div className="rounded-lg border px-3 py-2 text-sm bg-background">
                    {message.content}
                  </div>
                )}
              </div>
            ))}

            {isTyping && <div className="text-sm text-muted-foreground">...</div>}
            <div ref={messagesEndRef} />
          </div>
        </main>


        {/* 입력 영역 */}
        <footer className="bg-background border-t-2 border-border p-4">
          <div className="max-w-4xl mx-auto flex items-end space-x-3">
            <div className="flex-1 relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="파일을 검색하거나 질문을 입력하세요..."
                className="w-full min-h-[60px] max-h-32 resize-none"
                disabled={isTyping}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 bottom-2 w-8 h-8 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </footer>
      </div>

      {showFileModal && (
        <FileSearchModal
          isOpen={showFileModal}
          onClose={() => setShowFileModal(false)}
          files={filesHook.files}
          onFileSelect={handleFileSelect}
          onToggleFavorite={onToggleFavorite}
          zIndex={50}
          disableBackdropClick={!!selectedFile}
        />
      )}
      {selectedFile && (
        <FilePreviewDrawer
          isOpen={showPreviewDrawer}
          file={selectedFile}
          onClose={handleClosePreview}
          onToggleFavorite={handleToggleFavorite}
          zIndex={100}
          onRecentFileSaved={handleRecentFileSaved}
        />
      )}
    </div>
  );
}
