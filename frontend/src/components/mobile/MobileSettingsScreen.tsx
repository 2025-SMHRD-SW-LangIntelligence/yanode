import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft,
  User,
  Key,
  Moon,
  Sun,
  LogOut,
  Zap,
  ChevronRight,
  Bell,
  Smartphone,
  HelpCircle,
  Shield
} from 'lucide-react';
import type { MobileSettingsScreenProps } from '../../types';

const MobileSettingsScreen: React.FC<MobileSettingsScreenProps> = ({
  onBack,
  onLogout,
  apiKeys,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [showApiDetails, setShowApiDetails] = useState(false);

  const connectedKeys = apiKeys.filter(k => k.isConnected);

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 glass border-b border-border/50">
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
            <div>
              <h1 className="text-xl font-bold text-foreground">설정</h1>
              <p className="text-sm text-muted-foreground">앱 환경을 설정하세요</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 pb-28 safe-area-left safe-area-right safe-area-bottom">
        {/* 프로필 카드 */}
        <Card className="p-4 animate-slide-up">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">김사용자</h3>
              <p className="text-sm text-muted-foreground truncate">user@company.com</p>
              <p className="text-sm text-muted-foreground">마케팅팀</p>
            </div>
          </div>
        </Card>

        {/* API 연결 상태 */}
        <Card className="p-4 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-foreground">API 연결</h3>
                <p className="text-sm text-muted-foreground">
                  {connectedKeys.length}개 API 키 연결됨
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {connectedKeys.length > 0 && (
                <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  활성
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiDetails(!showApiDetails)}
                className="w-8 h-8 p-0 touch-feedback"
                aria-label={showApiDetails ? 'API 세부정보 숨기기' : 'API 세부정보 보기'}
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${showApiDetails ? 'rotate-90' : ''}`} />
              </Button>
            </div>
          </div>
          
          {showApiDetails && (
            <div className="space-y-2 pt-2 border-t border-border animate-slide-up">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${key.isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground">{key.name}</span>
                      <p className="text-xs text-muted-foreground truncate">{key.lastUsed}</p>
                    </div>
                  </div>
                  <Badge variant={key.isConnected ? "default" : "secondary"} className="text-xs">
                    {key.isConnected ? '연결됨' : '비활성'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 앱 설정 */}
        <div className="space-y-3 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <h2 className="text-lg font-semibold text-foreground px-1">
            앱 설정
          </h2>
          
          <Card className="p-2">
            <div className="space-y-1">
              {/* 다크모드 */}
              <div className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-foreground">다크 모드</span>
                    <p className="text-sm text-muted-foreground">
                      {isDarkMode ? '어두운 테마 사용 중' : '밝은 테마 사용 중'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={onToggleDarkMode}
                  aria-label="다크 모드 토글"
                />
              </div>

              {/* 알림 설정 */}
              <button 
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-muted/50 w-full text-left touch-feedback active:scale-[0.98] transition-transform"
                aria-label="알림 설정"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-foreground">알림 설정</span>
                    <p className="text-sm text-muted-foreground">푸시 알림 관리</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* 보안 설정 */}
              <button 
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-muted/50 w-full text-left touch-feedback active:scale-[0.98] transition-transform"
                aria-label="보안 설정"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-foreground">보안</span>
                    <p className="text-sm text-muted-foreground">개인정보 및 보안 설정</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </Card>
        </div>

        {/* 지원 */}
        <div className="space-y-3 animate-slide-up" style={{animationDelay: '0.3s'}}>
          <h2 className="text-lg font-semibold text-foreground px-1">
            지원
          </h2>
          
          <Card className="p-2">
            <div className="space-y-1">
              <button 
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-muted/50 w-full text-left touch-feedback active:scale-[0.98] transition-transform"
                aria-label="도움말"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-foreground">도움말</span>
                    <p className="text-sm text-muted-foreground">사용법과 FAQ</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button 
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-muted/50 w-full text-left touch-feedback active:scale-[0.98] transition-transform"
                aria-label="앱 정보"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-foreground">앱 정보</span>
                    <p className="text-sm text-muted-foreground">Smart Search v1.0.0</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </Card>
        </div>

        {/* 로그아웃 */}
        <Card className="p-4 border-red-200/20 bg-red-50/10 dark:border-red-800/20 dark:bg-red-900/10 animate-slide-up" style={{animationDelay: '0.4s'}}>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-100/20 dark:text-red-400 dark:hover:text-red-300 touch-feedback"
          >
            <LogOut className="w-5 h-5 mr-3" />
            로그아웃
          </Button>
        </Card>

        {/* 버전 정보 */}
        <div className="text-center text-xs text-muted-foreground space-y-1 animate-fade-in" style={{animationDelay: '0.5s'}}>
          <p>Smart Search v1.0.0</p>
          <p>© 2024 Dooray Team</p>
          <p className="text-primary">Made with ❤️ for better productivity</p>
        </div>
      </div>
    </div>
  );
};

MobileSettingsScreen.displayName = 'MobileSettingsScreen';

export default MobileSettingsScreen;