import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Send, 
  Paperclip, 
  Search, 
  Settings, 
  ArrowLeft,
  FileText,
  Download,
  ExternalLink,
  Bot,
  User,
  Sparkles,
  Clock,
  Star,
  Filter,
  MoreVertical
} from 'lucide-react';
import type { FileItem, ChatMessage } from '../types';
import { FileSearchModal } from './FileSearchModal';
import Sidebar from '../imports/Sidebar-2051-288';

interface MainChatInterfaceProps {
  onOpenSettings: () => void;
  onFileSelect: (file: FileItem) => void;
  onBack: () => void;
  files: FileItem[];
  onToggleFavorite: (fileId: string) => void;
}

export function MainChatInterface({
  onOpenSettings,
  onFileSelect,
  onBack,
  files,
  onToggleFavorite
}: MainChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: '안녕하세요! 무엇을 도와드릴까요? 파일을 검색하거나 질문해 주세요.',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');
  const [showFileModal, setShowFileModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 메시지 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 향상된 파일 검색 함수 - 관련도 기반 정렬
  const searchFiles = (query: string): FileItem[] => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    
    // 검색 점수 계산 함수
    const calculateRelevanceScore = (file: FileItem): number => {
      let score = 0;
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();
      const filePath = file.path.toLowerCase();
      const modifiedBy = file.modifiedBy.toLowerCase();
      
      // 파일명에서 정확한 매치 (가장 높은 점수)
      if (fileName.includes(searchTerm)) {
        score += 10;
        // 파일명 시작 부분에 매치되면 추가 점수
        if (fileName.startsWith(searchTerm)) score += 5;
      }
      
      // 파일 경로에서 매치 (마케팅 폴더 등)
      if (filePath.includes(searchTerm)) {
        score += 8;
      }
      
      // 파일 타입에서 매치
      if (fileType.includes(searchTerm)) {
        score += 6;
      }
      
      // 수정자에서 매치
      if (modifiedBy.includes(searchTerm)) {
        score += 4;
      }
      
      // 즐겨찾기 파일에 추가 점수
      if (file.isFavorite) {
        score += 2;
      }
      
      // 특별 키워드별 추가 점수
      if (searchTerm === '마케팅' || searchTerm === 'marketing') {
        if (filePath.includes('/marketing/') || fileName.includes('마케팅') || fileName.includes('브랜드') || fileName.includes('고객')) {
          score += 15;
        }
      }
      
      return score;
    };
    
    // 모든 파일에 대해 검색 점수 계산
    const scoredFiles = files
      .map(file => ({
        file,
        score: calculateRelevanceScore(file)
      }))
      .filter(item => item.score > 0) // 점수가 0보다 큰 파일만 필터링
      .sort((a, b) => b.score - a.score) // 점수 순으로 내림차순 정렬
      .map(item => item.file);
    
    // 최대 5개 반환
    return scoredFiles.slice(0, 5);
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue('');
    setIsTyping(true);

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const searchResults = searchFiles(currentQuery);
      
      let botContent = '';
      if (searchResults.length > 0) {
        if (currentQuery.toLowerCase().includes('마케팅') || currentQuery.toLowerCase().includes('marketing')) {
          botContent = `"${currentQuery}"에 대한 마케팅 관련 문서를 찾았습니다. ${searchResults.length}개의 관련 파일이 있습니다.`;
        } else {
          botContent = `"${currentQuery}"에 대한 검색 결과를 찾았습니다. ${searchResults.length}개의 관련 파일이 있습니다.`;
        }
      } else {
        botContent = `"${currentQuery}"에 대한 검색 결과를 찾을 수 없습니다. 다른 키워드로 검색해보세요.`;
      }
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botContent,
        files: searchResults,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  // 키보드 이벤트
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const recentFiles = files.slice().sort((a, b) => {
    const timeOrder = ['2시간 전', '5시간 전', '1일 전', '2일 전', '3일 전', '1주 전'];
    return timeOrder.indexOf(a.modified) - timeOrder.indexOf(b.modified);
  });

  const favoriteFiles = files.filter(file => file.isFavorite);
  const currentFiles = activeTab === 'recent' ? recentFiles.slice(0, 6) : favoriteFiles.slice(0, 6);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* 확장 사이드바 */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden`}>
        <div className="w-80 h-full bg-muted border-r-2 border-border flex flex-col animate-slide-in">
          {/* 사이드바 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">최근 파일</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg w-8 h-8 p-0"
            >
              ×
            </Button>
          </div>
          
          {/* 탭 네비게이션 */}
          <div className="flex space-x-1 bg-accent rounded-lg p-1 border border-border m-4 mb-2">
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === 'recent'
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>최근</span>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === 'favorites'
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>즐겨찾기</span>
            </button>
          </div>

          {/* 파일 목록 */}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-2">
              {currentFiles.map((file) => (
                <div key={file.id} className="group p-3 rounded-xl bg-background hover:bg-accent transition-all cursor-pointer border border-border card-hover shadow-sm overflow-hidden">
                  <div className="flex items-center space-x-3 gap-2">
                    <span className="text-lg flex-shrink-0">{file.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {file.type} • {file.modified}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(file.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0 hover:bg-accent flex-shrink-0"
                    >
                      <Star 
                        className={`w-4 h-4 ${
                          file.isFavorite 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-muted-foreground hover:text-yellow-500'
                        }`} 
                      />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 헤더 */}
        <header className="bg-background border-b-2 border-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 hover:bg-accent rounded-xl border border-border"
                onClick={onBack}
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 hover:bg-accent rounded-xl border border-border"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <div className="w-5 h-5 text-muted-foreground">
                  <Sidebar />
                </div>
              </Button>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center border border-border">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">AI 채팅</h1>
                  <p className="text-sm text-muted-foreground">AI와 대화하며 파일을 검색하세요</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 hover:bg-accent rounded-xl border border-border"
                onClick={() => setShowFileModal(true)}
              >
                <Search className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 hover:bg-accent rounded-xl border border-border"
                onClick={onOpenSettings}
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </Button>
              <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center border border-border">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* 채팅 영역 */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
                <div className={`flex space-x-3 max-w-4xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* 아바타 */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-gradient-primary shadow-lg' 
                      : 'glass-strong border border-border'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  {/* 메시지 콘텐츠 */}
                  <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* 발신자 이름과 시간 */}
                    <div className={`flex items-center space-x-2 mb-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <span className="text-sm font-medium text-foreground">
                        {message.type === 'user' ? '나' : (
                          <div className="flex items-center space-x-1">
                            <span>AI 어시스턴트</span>
                            <Sparkles className="w-3 h-3 text-primary" />
                          </div>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* 메시지 버블 */}
                    <div className={`inline-block p-4 rounded-2xl max-w-full ${
                      message.type === 'user'
                        ? 'bg-gradient-primary text-white rounded-br-md'
                        : 'glass-strong rounded-bl-md border border-border'
                    }`}>
                      <p className={`whitespace-pre-wrap leading-relaxed ${
                        message.type === 'user' ? 'text-white' : 'text-foreground'
                      }`}>{message.content}</p>
                      
                      {/* 파일 결과 */}
                      {message.files && message.files.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {message.files.map((file) => (
                            <div
                              key={file.id}
                              className="glass p-4 rounded-xl border border-border hover:bg-accent transition-all cursor-pointer card-hover group overflow-hidden"
                              onClick={() => onFileSelect(file)}
                            >
                              <div className="flex items-center space-x-3 gap-2">
                                <span className="text-2xl flex-shrink-0">{file.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-foreground truncate text-sm leading-5">
                                    {file.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {file.type} • {file.size} • {file.modified}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleFavorite(file.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
                                  >
                                    <Star 
                                      className={`w-4 h-4 ${
                                        file.isFavorite 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : 'text-muted-foreground hover:text-yellow-500'
                                      }`} 
                                    />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground w-8 h-8 p-0"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground w-8 h-8 p-0"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 타이핑 인디케이터 */}
            {isTyping && (
              <div className="flex justify-start mb-6">
                <div className="flex space-x-3 max-w-4xl">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full glass-strong border border-border flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-foreground flex items-center space-x-1">
                        <span>AI 어시스턴트</span>
                        <Sparkles className="w-3 h-3 text-primary" />
                      </span>
                    </div>
                    <div className="inline-block p-4 rounded-2xl glass-strong rounded-bl-md border border-border">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">AI가 응답 중...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* 입력 영역 */}
        <footer className="bg-background border-t-2 border-border p-4 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 w-10 h-10 p-0 hover:bg-accent rounded-xl border border-border"
                onClick={() => setShowFileModal(true)}
              >
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </Button>
              
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="파일을 검색하거나 질문을 입력하세요..."
                  className="w-full min-h-[60px] max-h-32 resize-none border-2 border-border rounded-2xl px-4 py-3 pr-12 focus:ring-2 focus:ring-ring focus:border-primary bg-input text-foreground placeholder:text-muted-foreground"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 bottom-2 w-8 h-8 p-0 bg-gradient-primary hover:shadow-lg btn-glow text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-center mt-3">
              <p className="text-xs text-muted-foreground">
                AI가 생성한 정보는 부정확할 수 있습니다. 중요한 결정을 내리기 전에 확인해 주세요.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* 파일 검색 모달 */}
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