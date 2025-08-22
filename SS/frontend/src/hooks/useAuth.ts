import { useState, useCallback } from 'react';
import type { Screen, AuthHookReturn } from '../types';

export function useAuth(): AuthHookReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
    setCurrentScreen('onboarding');
  }, []);

  const handleSignup = useCallback(() => {
    setIsAuthenticated(true);
    setCurrentScreen('onboarding');
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setHasCompletedOnboarding(true);
    setCurrentScreen('home');
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    setCurrentScreen('login');
  }, []);

  const navigateToScreen = useCallback((screen: Screen) => {
    // 인증 상태 검증
    if (!isAuthenticated && !['login', 'signup'].includes(screen)) {
      console.warn(`Cannot navigate to ${screen} without authentication`);
      return;
    }
    
    // 온보딩 완료 상태 검증
    if (isAuthenticated && !hasCompletedOnboarding && !['onboarding'].includes(screen)) {
      console.warn(`Cannot navigate to ${screen} without completing onboarding`);
      return;
    }
    
    setCurrentScreen(screen);
  }, [isAuthenticated, hasCompletedOnboarding]);

  return {
    isAuthenticated,
    hasCompletedOnboarding,
    currentScreen,
    handleLogin,
    handleSignup,
    handleOnboardingComplete,
    handleLogout,
    navigateToScreen
  };
}