import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
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

  // 파일 데이터 헬퍼
  const { recentFiles, favoriteFiles, searchFiles } = useFileData(files);

  // 사이드바에서 선택된 폴더 ID를 여기서 유지 (검색 범위로 사용)
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      // ✅ 선택된 폴더 범위로 검색
      const searchResults = searchFiles(currentQuery, selectedFolderIds);
      const botContent =
        searchResults.length === 0
          ? `"${currentQuery}"에 대한 파일을 찾지 못했습니다.`
          : `"${currentQuery}"에 대한 검색 결과를 찾았습니다.`;

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botContent,
        files: searchResults,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* 공통 사이드바 */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden`}>
        <ExplorerSidebar
          recentFiles={recentFiles.slice(0,12)} // 최근 12개 파일만 표시
          favoriteFiles={favoriteFiles}
          onFileSelect={onFileSelect}
          activeTabDefault="drive"
          onClose={() => setSidebarOpen(false)}
          // 선택 결과를 상위로 알려줌 → 검색 범위에 사용
          onSelectionChange={setSelectedFolderIds}
          // 드라이브 로딩/API 호출/체크박스/토글은 내부에서 자동 처리
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
                <div className="rounded-lg border px-3 py-2 text-sm bg-background">
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-sm text-muted-foreground">...</div>}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* 입력 영역 */}
        <footer className="bg-background border-t-2 border-border p-4">
          <div className="max-w-4xl mx-auto flex items-end space-x-3">
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
              <Paperclip className="w-5 h-5" />
            </Button>
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
                onClick={handleSendMessage}
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
          onFileSelect={onFileSelect}
          files={files}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  );
}
