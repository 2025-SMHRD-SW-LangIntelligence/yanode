// C:\Users\smhrd\Desktop\front_f\SS\frontend\src\App.tsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import { LoginScreen } from '../features/auth/LoginScreen';
import { SignupScreen } from '../features/auth/SignupScreen';
import { OnboardingScreen } from '../features/home/OnboardingScreen';
import { HomeScreen } from '../features/home/HomeScreen';
import UploadScreen from '../features/upload/UploadScreen.tsx'; // ✅ default export 로 import
import { MainChatInterface } from '../features/chat/MainChatInterface';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { FilePreviewDrawer } from '../features/files/FilePreviewDrawer';
import { useFiles } from '../features/files/useFiles';
import { useApiKeys } from '../features/settings/useApiKeys';
import { useMobile } from '../hooks/useMobile';
import type { FileItem } from '../types';


// 모바일 컴포넌트
import MobileHomeScreen from '../components/mobile/MobileHomeScreen';
import MobileChatInterface from '../components/mobile/MobileChatInterface';
import MobileSettingsScreen from '../components/mobile/MobileSettingsScreen';
import MobileBottomNav from '../components/mobile/MobileBottomNav';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("http://localhost:8090/api/auth/me", {
          method: 'GET',
          credentials: "include"
        });
        if (res.ok) {
          navigate('/home'); // 로그인 되어있으면 홈으로
        }
      } catch (e) {
        console.error("세션 확인 실패", e);
      }
    };
    checkLogin();
  }, []);

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
    onUpdateApiKeys,
    onDisconnectAllApiKeys,
    onDisconnectApiKey,
    onConnectApiKey,
  } = useApiKeys();

  const { isMobile } = useMobile();

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  // ✅ 모바일 라우팅
  if (isMobile) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <LoginScreen
                onLogin={() => navigate('/onboarding')}
                onSignupClick={() => navigate('/signup')}
              />
            }
          />
          <Route
            path="/signup"
            element={
              <SignupScreen
                onSignup={() => navigate('/onboarding')}
                onBackToLogin={() => navigate('/login')}
              />
            }
          />
          <Route path="/onboarding" element={<OnboardingScreen onComplete={() => navigate('/home')} />} />
          <Route
            path="/home"
            element={
              <MobileHomeScreen
                onNavigateToChat={() => navigate('/chat')}
                onOpenSettings={() => navigate('/settings')}
                hasConnectedApiKeys={hasConnectedApiKeys}
                files={files}
                onToggleFavorite={onToggleFavorite}
                onFileSelect={onFileSelect}
                apiKeys={apiKeys}
              />
            }
          />
          <Route
            path="/chat"
            element={
              <MobileChatInterface
                onFileSelect={onFileSelect}
                onBack={() => navigate('/home')}
                files={files}
                onToggleFavorite={onToggleFavorite}
                onOpenSettings={() => navigate('/settings')}
                apiKeys={apiKeys}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <MobileSettingsScreen
                onBack={() => navigate('/home')}
                onLogout={handleLogout}
                apiKeys={apiKeys}
                isDarkMode={isDarkMode}
                onToggleDarkMode={setIsDarkMode}
              />
            }
          />
        </Routes>
        {/* 필요하면 <MobileBottomNav /> 추가 */}
      </div>
    );
  }

  // ✅ 데스크탑 라우팅
  return (
    <>
      {selectedFile && (
        <FilePreviewDrawer
          isOpen={showPreviewDrawer}
          file={selectedFile}
          onClose={handleClosePreview}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <LoginScreen
              onLogin={() => navigate('/onboarding')}
              onSignupClick={() => navigate('/signup')}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <SignupScreen
              onSignup={() => navigate('/onboarding')}
              onBackToLogin={() => navigate('/login')}
            />
          }
        />
        <Route path="/onboarding" element={<OnboardingScreen onComplete={() => navigate('/home')} />} />
        <Route
          path="/home"
          element={
            <HomeScreen
              onNavigateToChat={() => navigate('/chat')}
              onOpenSettings={() => navigate('/settings')}
              hasConnectedApiKeys={hasConnectedApiKeys}
              files={files}
              onToggleFavorite={onToggleFavorite}
              onFileSelect={onFileSelect}
              onDisconnectAllApiKeys={onDisconnectAllApiKeys}
              apiKeys={apiKeys}
            />
          }
        />
        <Route
          path="/chat"
          element={
            <MainChatInterface
              onOpenSettings={() => navigate('/settings')}
              onFileSelect={onFileSelect}
              onBack={() => navigate('/home')}
              files={files}
              onToggleFavorite={onToggleFavorite}
              apiKeys={apiKeys}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <SettingsScreen
              onBack={() => navigate('/home')}
              onLogout={handleLogout}
              apiKeys={apiKeys}
              onUpdateApiKeys={onUpdateApiKeys}
              onDisconnectApiKey={onDisconnectApiKey}
              onConnectApiKey={onConnectApiKey}
              isDarkMode={isDarkMode}
              onToggleDarkMode={setIsDarkMode}
            />
          }
        />
        <Route path="/upload" element={<UploadScreen />} /> {/* ✅ 업로드 페이지 */}
        <Route path="*" element={<div><h1>404 - Page Not Found</h1></div>} />
      </Routes>
    </>
  );
}
