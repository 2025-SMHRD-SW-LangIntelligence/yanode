import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  MessageCircle, 
  Settings, 
  Zap,
  ArrowRight,
  Sparkles,
  FileText,
  Search,
  Clock,
  TrendingUp
} from 'lucide-react';
import type { MobileHomeScreenProps } from '../../types';

const RECOMMENDED_QUESTIONS = [
  "마케팅 전략 문서에서 핵심 내용을 요약해주세요",
  "지난 분기 매출 보고서의 주요 지표는?", 
  "브랜드 가이드라인에서 컬러 팔레트 찾아주세요",
  "회사 규정에서 휴가 관련 내용 알려주세요"
] as const;

const MobileHomeScreen: React.FC<MobileHomeScreenProps> = ({
  onNavigateToChat,
  onOpenSettings,
  hasConnectedApiKeys,
  files,
  onToggleFavorite,
  onFileSelect,
  apiKeys = []
}) => {
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요! ☀️';
    if (hour < 18) return '안녕하세요! 👋';
    return '좋은 저녁이에요! 🌙';
  });

  const handleQuestionSelect = useCallback((question: string) => {
    // TODO: 선택된 질문을 채팅 화면으로 전달하는 로직 추가
    onNavigateToChat();
  }, [onNavigateToChat]);

  const stats = useMemo(() => ({
    totalFiles: files?.length || 0,
    connectedApiKeys: apiKeys.filter(k => k.isConnected).length
  }), [files, apiKeys]);

  const hasApiConnection = hasConnectedApiKeys && stats.connectedApiKeys > 0;

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 glass border-b border-border/50">
        <div className="flex items-center justify-between p-4 safe-area-left safe-area-right">
          <div>
            <h1 className="text-xl font-bold text-foreground">Smart Search</h1>
            <p className="text-sm text-muted-foreground">{greeting}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="w-11 h-11 p-0 rounded-full touch-feedback"
            aria-label="설정 열기"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-6 pb-28 safe-area-left safe-area-right safe-area-bottom">
        {/* API 연결 상태 */}
        {!hasApiConnection && (
          <Card className="p-4 border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20 animate-fade-in">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-amber-900 dark:text-amber-100">API 키를 연결해보세요</h3>
                <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                  더 정확하고 빠른 파일 검색을 위해 Dooray API 키가 필요해요
                </p>
                <Button
                  size="sm"
                  onClick={onOpenSettings}
                  className="mt-3 bg-amber-600 hover:bg-amber-700 text-white touch-feedback"
                >
                  지금 연결하기
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 메인 채팅 카드 */}
        <Card className="p-6 bg-gradient-primary text-white relative overflow-hidden shadow-clean-lg touch-feedback animate-slide-up">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
          
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-3">
              <MessageCircle className="w-6 h-6" />
              <h2 className="text-xl font-semibold">AI 어시스턴트</h2>
              <Sparkles className="w-5 h-5" />
            </div>
            
            <p className="text-white/90 mb-4 leading-relaxed">
              파일 내용에 대해 궁금한 점이 있으신가요? 
              <br />언제든 질문하세요!
            </p>
            
            <Button
              onClick={onNavigateToChat}
              size="lg"
              variant="secondary"
              className="w-full bg-white text-primary hover:bg-white/90 font-medium touch-feedback active:scale-[0.98] transition-transform"
            >
              대화 시작하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* 상태 카드들 */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 card-hover animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold text-foreground">{stats.totalFiles}</p>
                <p className="text-sm text-muted-foreground truncate">검색 가능한 파일</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 card-hover animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold text-foreground">{stats.connectedApiKeys}</p>
                <p className="text-sm text-muted-foreground truncate">API 연결</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 추천 질문들 */}
        <section className="space-y-3 animate-slide-up" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center">
              <Search className="w-5 h-5 mr-2 text-purple-500" />
              이런 질문은 어때요?
            </h2>
          </div>
          
          <div className="space-y-2">
            {RECOMMENDED_QUESTIONS.map((question, index) => (
              <Card 
                key={index}
                className="p-3 cursor-pointer touch-feedback active:scale-[0.98] transition-transform border-l-4 border-l-purple-200 dark:border-l-purple-700 hover:bg-muted/50"
                onClick={() => handleQuestionSelect(question)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground pr-2 flex-1">{question}</p>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* API 키 상태 */}
        {hasApiConnection && (
          <Card className="p-4 bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-green-900 dark:text-green-100">API 연결 완료</h3>
                  <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                    활성
                  </Badge>
                </div>
                <p className="text-sm text-green-700 dark:text-green-200">
                  모든 파일을 빠르고 정확하게 검색할 수 있어요
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* 최근 활동 */}
        <section className="space-y-3 animate-slide-up" style={{animationDelay: '0.4s'}}>
          <h2 className="text-lg font-semibold text-foreground flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-500" />
            최근 활동
          </h2>
          
          <Card className="p-4 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">아직 대화가 없어요</p>
            <p className="text-sm text-muted-foreground mt-1">
              첫 번째 질문으로 시작해보세요
            </p>
            <Button
              size="sm"
              onClick={onNavigateToChat}
              className="mt-3 bg-gradient-primary touch-feedback"
            >
              지금 시작하기
            </Button>
          </Card>
        </section>
      </main>
    </div>
  );
};

MobileHomeScreen.displayName = 'MobileHomeScreen';

export default MobileHomeScreen;