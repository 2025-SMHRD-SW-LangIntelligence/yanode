import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Bot,
  User,
  Star,
  FileText,
  RotateCcw,
  Zap,
  MoreVertical
} from 'lucide-react';
import type { MobileChatInterfaceProps, ChatMessage } from '../../types';

const QUICK_QUESTIONS = [
  "파일 내용 요약해주세요",
  "핵심 키워드 찾아주세요", 
  "관련 문서 더 보여주세요",
  "자세한 설명 부탁드려요"
] as const;

const MobileChatInterface: React.FC<MobileChatInterfaceProps> = ({
  onFileSelect,
  onBack,
  files,
  onToggleFavorite,
  initialMessage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: '안녕하세요! 😊 파일 검색과 질문에 도움을 드릴게요. 무엇을 도와드릴까요?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState(initialMessage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 키보드 감지 및 처리
  useEffect(() => {
    const handleViewportChange = () => {
      const vh = window.visualViewport?.height || window.innerHeight;
      const isKeyboard = vh < window.screen.height * 0.75;
      setIsKeyboardOpen(isKeyboard);
      
      if (isKeyboard) {
        // 키보드가 올라왔을 때 채팅을 최하단으로 스크롤
        setTimeout(scrollToBottom, 100);
      }
    };

    // Visual Viewport API 지원 시
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
      };
    }

    // 폴백: window resize 이벤트
    window.addEventListener('resize', handleViewportChange);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [scrollToBottom]);

  // 초기 메시지가 있으면 자동으로 전송
  useEffect(() => {
    if (initialMessage && messages.length === 1) {
      handleSendMessage();
    }
  }, [initialMessage, messages.length]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 봇 응답 시뮬레이션
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `"${userMessage.content}"에 대해 검색해드릴게요! 관련 문서들을 찾았습니다. 📄`,
        files: files.slice(0, 3), // 관련 파일 3개 표시
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  }, [inputValue, files]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleClearChat = useCallback(() => {
    setMessages([{
      id: '1',
      type: 'bot',
      content: '새로운 대화를 시작할게요! 😊 무엇을 도와드릴까요?',
      timestamp: new Date()
    }]);
  }, []);

  const handleQuickQuestion = useCallback((question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  }, []);

  return (
    <div 
      className={`flex flex-col bg-background transition-all duration-300 ${
        isKeyboardOpen ? 'h-screen' : 'min-h-screen'
      }`}
      style={{
        height: isKeyboardOpen && window.visualViewport 
          ? `${window.visualViewport.height}px` 
          : '100vh'
      }}
    >
      {/* 헤더 */}
      <header className="sticky top-0 z-40 glass border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between p-4 safe-area-left safe-area-right">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="w-10 h-10 p-0 rounded-full touch-feedback"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">AI 어시스턴트</h1>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs text-muted-foreground">온라인</p>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="w-10 h-10 p-0 rounded-full touch-feedback"
            aria-label="채팅 초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* 메시지 영역 */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 safe-area-left safe-area-right"
        style={{
          paddingBottom: isKeyboardOpen ? '120px' : '120px' // 입력창을 위한 여유 공간
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex animate-slide-up ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] ${
                message.type === 'user'
                  ? 'bg-gradient-primary text-white rounded-2xl rounded-tr-md'
                  : 'bg-muted text-foreground rounded-2xl rounded-tl-md'
              } px-4 py-3 shadow-sm`}
            >
              {/* 메시지 내용 */}
              <div className="flex items-start space-x-2">
                {message.type === 'bot' && (
                  <div className="w-5 h-5 bg-gradient-primary rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`${message.type === 'user' ? 'text-white' : 'text-foreground'} leading-relaxed break-words`}>
                    {message.content}
                  </p>
                  
                  {/* 파일 첨부 */}
                  {message.files && message.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.files.map((file) => (
                        <Card 
                          key={file.id}
                          className="p-3 cursor-pointer touch-feedback active:scale-[0.98] transition-transform bg-background/80 hover:bg-background"
                          onClick={() => onFileSelect(file)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-lg">{file.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">{file.name}</p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>{file.type}</span>
                                <span>•</span>
                                <span>{file.size}</span>
                                <span>•</span>
                                <span className="truncate">{file.modified}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(file.id);
                              }}
                              className="w-8 h-8 p-0 touch-feedback"
                              aria-label={file.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                            >
                              <Star className={`w-4 h-4 ${file.isFavorite ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`} />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {message.timestamp.toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* 로딩 표시 */}
        {isLoading && (
          <div className="flex justify-start animate-slide-up">
            <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 빠른 질문 제안 (메시지가 적을 때만 표시) */}
        {messages.length <= 2 && !isLoading && (
          <div className="space-y-2 animate-fade-in">
            <p className="text-sm text-muted-foreground px-1">💡 이런 질문은 어때요?</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs bg-muted/50 border-border hover:bg-muted touch-feedback"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 - 최상위 z-index와 고정 위치 */}
      <footer 
        className={`fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/50 transition-all duration-300`}
        style={{
          transform: isKeyboardOpen && window.visualViewport 
            ? `translateY(-${window.innerHeight - window.visualViewport.height}px)` 
            : 'translateY(0)',
        }}
      >
        <div className="p-4 safe-area-left safe-area-right safe-area-bottom">
          <div className="flex items-end space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-11 h-11 p-0 rounded-full flex-shrink-0 touch-feedback"
              aria-label="파일 첨부"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            
            <div className="flex-1">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="질문이나 검색할 내용을 입력하세요..."
                className="min-h-[48px] rounded-full border-border bg-background/90 px-4 focus:bg-background touch-feedback backdrop-blur-sm"
                disabled={isLoading}
                style={{ fontSize: '16px' }} // iOS 확대 방지
              />
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="w-12 h-12 p-0 rounded-full bg-gradient-primary hover:opacity-90 touch-feedback active:scale-[0.95] transition-transform flex-shrink-0"
              aria-label="메시지 전송"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center mt-2">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Zap className="w-3 h-3" />
              <span>Smart Search AI가 도움을 드립니다</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

MobileChatInterface.displayName = 'MobileChatInterface';

export default MobileChatInterface;