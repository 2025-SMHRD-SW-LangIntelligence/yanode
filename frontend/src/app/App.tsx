// C:\Users\smhrd\Desktop\front_f\SS\frontend\src\App.tsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import type { ApiKey } from '../types';

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
import ChangePassword from '../features/settings/ChangePassword.tsx';


// 모바일 컴포넌트
import MobileHomeScreen from '../components/mobile/MobileHomeScreen';
import MobileChatInterface from '../components/mobile/MobileChatInterface';
import MobileSettingsScreen from '../components/mobile/MobileSettingsScreen';
import MobileBottomNav from '../components/mobile/MobileBottomNav';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]); // 중앙 상태

  const hasConnectedApiKeys = apiKeys.some(k => k.isConnected);
  const connectedKeys = apiKeys.filter(k => k.isConnected);

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
          navigate('/home'); // 바로 홈으로 이동
        } else {
          navigate('/login')
        }
      } catch (e) {
        navigate('/login')
      }
    };
    checkLogin();
  }, []);

  useEffect(() => {
    const fetchUserApis = async () => {
      try {
        const res = await fetch('http://localhost:8090/api/auth/myApis', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setApiKeys(data);
        }
      } catch (e) {
      }
    };

    fetchUserApis();
  }, []);

  const {
    files,
    showPreviewDrawer,
    selectedFile,
    onFileSelect,
    onToggleFavorite,
    handleClosePreview,
  } = useFiles();

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
          <Route path="/change-password" element={<ChangePassword />} />
        </Routes>
        {/* 필요하면 <MobileBottomNav /> 추가 */}
      </div>
    );
  }

  // ✅ 데스크탑 라우팅
  return (
    <>
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
              onOpenSettings={(tab?: 'profile' | 'preferences' | 'security' | 'about') => {
                navigate('/settings', { state: { initialTab: tab || 'profile' } });
              }}
              hasConnectedApiKeys={hasConnectedApiKeys}
              files={files}
              onToggleFavorite={onToggleFavorite}
              onFileSelect={onFileSelect}
              apiKeys={apiKeys}
              connectedKeys={apiKeys.filter(key => key.isConnected)}
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
              connectedKeys={connectedKeys}
              onUpdateApiKeys={setApiKeys}
              onConnectApiKey={(apiURL: string) =>
                setApiKeys(prev =>
                  prev.map(k =>
                    k.apiURL === apiURL ? { ...k, isConnected: true, lastUsed: '방금 전' } : k
                  )
                )
              }
              onDisconnectApiKey={(apiURL: string) =>
                setApiKeys(prev =>
                  prev.map(k =>
                    k.apiURL === apiURL ? { ...k, isConnected: false, lastUsed: '방금 연결 해제됨' } : k
                  )
                )
              }
              isDarkMode={isDarkMode}
              onToggleDarkMode={setIsDarkMode}
            />
          }
        />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/upload" element={<UploadScreen />} /> {/* ✅ 업로드 페이지 */}
        <Route path="*" element={<div><h1>404 - Page Not Found</h1></div>} />
      </Routes>

    </>
  );
}
