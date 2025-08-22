import React, { useState } from 'react';

import { useFiles } from './hooks/useFiles';
import { useApiKeys } from './hooks/useApiKeys';
import { useMobile } from './hooks/useMobile';
import type { FileItem } from './types';

import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { MainChatInterface } from './components/MainChatInterface';
import { SettingsScreen } from './components/SettingsScreen';

// FilePreviewDrawer가 named export라면 다음 줄 유지,
// default export라면:  import FilePreviewDrawer from './components/FilePreviewDrawer';
import { FilePreviewDrawer } from './components/FilePreviewDrawer';

// 모바일 컴포넌트가 실제로 있는 경우에만 사용하세요.
// 없다면 아래 4줄과 모바일 블록은 통째로 삭제해도 됩니다.
import MobileHomeScreen from './components/mobile/MobileHomeScreen';
import MobileChatInterface from './components/mobile/MobileChatInterface';
import MobileSettingsScreen from './components/mobile/MobileSettingsScreen';
import MobileBottomNav from './components/mobile/MobileBottomNav';
import { useEffect } from 'react';

type Screen = 'login' | 'signup' | 'onboarding' | 'home' | 'chat' | 'settings';

interface ApiKey {
  apiIdx: number;
  apiTitle: string;
  apiURL: string;
  createdDate?: string;
  lastUsed?: string;
  isConnected?: boolean;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("http://localhost:8090/api/auth/me", {
          method: 'GET',
          credentials: "include" // 세션 쿠키 포함
        });
        if (res.ok) {
          setScreen('home'); // 바로 홈으로 이동
        }
      } catch (e) {
        console.error("세션 확인 실패", e);
      }
    };
    checkLogin();
  }, []);

  // ✅ 변경된 useFiles 반환 형태에 맞게 구조 분해
  const {
    files,
    showPreviewDrawer,
    selectedFile,
    onFileSelect,
    onToggleFavorite,
    handleClosePreview,
  } = useFiles();

  const {
    apiKeys,
    hasConnectedApiKeys,
    connectedKeys,
    onUpdateApiKeys,
    onDisconnectAllApiKeys,
    onDisconnectApiKey,
    onConnectApiKey,
  } = useApiKeys();

  const { isMobile } = useMobile();
  const go = (s: Screen) => setScreen(s);


  // ===== 데스크톱 =====
  if (!isMobile) {
    if (screen === 'login')
      return (
        <LoginScreen
          onLogin={() => go('onboarding')}
          onSignupClick={() => go('signup')}
        />
      );

    if (screen === 'signup')
      return (
        <SignupScreen
          onSignup={() => go('onboarding')}
          onBackToLogin={() => go('login')}
        />
      );

    if (screen === 'onboarding')
      return <OnboardingScreen onComplete={() => go('home')} />;

    if (screen === 'home')
      return (
        <>
          <HomeScreen
            onNavigateToChat={() => go('chat')}
            onOpenSettings={() => go('settings')}
            hasConnectedApiKeys={hasConnectedApiKeys}
            files={files}
            onToggleFavorite={onToggleFavorite}
            onFileSelect={(f: FileItem) => onFileSelect(f)}
            onDisconnectAllApiKeys={onDisconnectAllApiKeys}
            apiKeys={connectedKeys}
          />
          {/* ✅ 전역 미리보기 드로어 */}
          {selectedFile && (
            <FilePreviewDrawer
              isOpen={showPreviewDrawer}
              file={selectedFile}
              onClose={handleClosePreview}
              onToggleFavorite={onToggleFavorite}
            />
          )}
        </>
      );

    if (screen === 'chat')
      return (
        <>
          <MainChatInterface
            onOpenSettings={() => go('settings')}
            onFileSelect={(f) => onFileSelect(f)}
            onBack={() => go('home')}
            files={files}
            onToggleFavorite={onToggleFavorite}
          />
          {/* ✅ 채팅에서도 파일 열면 전역 드로어로 표시 */}
          {selectedFile && (
            <FilePreviewDrawer
              isOpen={showPreviewDrawer}
              file={selectedFile}
              onClose={handleClosePreview}
              onToggleFavorite={onToggleFavorite}
            />
          )}
        </>
      );

    if (screen === 'settings')
      return (
        <SettingsScreen
          onBack={() => go('home')}
          onLogout={() => go('login')}
          apiKeys={apiKeys}
          onUpdateApiKeys={onUpdateApiKeys}
          onDisconnectApiKey={onDisconnectApiKey}
          onConnectApiKey={onConnectApiKey}
          isDarkMode={isDarkMode}
          onToggleDarkMode={setIsDarkMode}
        />
      );

    return null;
  }

  // ===== 모바일 (모바일 컴포넌트가 실제 있을 때만 사용) =====
  if (screen === 'login')
    return (
      <LoginScreen
        onLogin={() => go('onboarding')}
        onSignupClick={() => go('signup')}
      />
    );

  if (screen === 'signup')
    return (
      <SignupScreen
        onSignup={() => go('onboarding')}
        onBackToLogin={() => go('login')}
      />
    );

  if (screen === 'onboarding')
    return <OnboardingScreen onComplete={() => go('home')} />;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {screen === 'home' && (
        <>
          <MobileHomeScreen
            onNavigateToChat={() => go('chat')}
            onOpenSettings={() => go('settings')}
            hasConnectedApiKeys={hasConnectedApiKeys}
            files={files}
            onToggleFavorite={onToggleFavorite}
            onFileSelect={(f) => onFileSelect(f)}
            apiKeys={connectedKeys}
          />
          <MobileBottomNav currentScreen="home" onNavigate={(s) => go(s as Screen)} />

          {selectedFile && (
            <FilePreviewDrawer
              isOpen={showPreviewDrawer}
              file={selectedFile}
              onClose={handleClosePreview}
              onToggleFavorite={onToggleFavorite}
            />
          )}
        </>
      )}

      {screen === 'chat' && (
        <>
          <MobileChatInterface
            onFileSelect={(f) => onFileSelect(f)}
            onBack={() => go('home')}
            files={files}
            onToggleFavorite={onToggleFavorite}
            onOpenSettings={() => go('settings')}
          />
          <MobileBottomNav currentScreen="chat" onNavigate={(s) => go(s as Screen)} />

          {selectedFile && (
            <FilePreviewDrawer
              isOpen={showPreviewDrawer}
              file={selectedFile}
              onClose={handleClosePreview}
              onToggleFavorite={onToggleFavorite}
            />
          )}
        </>
      )}

      {screen === 'settings' && (
        <>
          <MobileSettingsScreen
            onBack={() => go('home')}
            onLogout={() => go('login')}
            apiKeys={apiKeys}
            isDarkMode={isDarkMode}
            onToggleDarkMode={setIsDarkMode}
          />
          <MobileBottomNav currentScreen="settings" onNavigate={(s) => go(s as Screen)} />
        </>
      )}
    </div>
  );
}
