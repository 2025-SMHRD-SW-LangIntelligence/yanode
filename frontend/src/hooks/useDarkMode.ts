import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 다크모드 적용 함수
  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 다크모드 토글 함수
  const toggleDarkMode = (newValue: boolean) => {
    setIsDarkMode(newValue);
    applyDarkMode(newValue);
    localStorage.setItem('darkMode', newValue.toString());
  };

  // 다크모드 초기화 및 설정
  useEffect(() => {
    // 한국어 및 UTF-8 지원을 위한 문서 설정
    document.documentElement.lang = 'ko';
    const metaCharset = document.querySelector('meta[charset]');
    if (!metaCharset) {
      const meta = document.createElement('meta');
      meta.setAttribute('charset', 'UTF-8');
      document.head.insertBefore(meta, document.head.firstChild);
    }

    // 다크모드 초기 설정
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      // localStorage에 저장된 설정이 있으면 사용
      const isDark = savedDarkMode === 'true';
      setIsDarkMode(isDark);
      applyDarkMode(isDark);
    } else {
      // 시스템 테마 설정 확인
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      applyDarkMode(prefersDark);
    }

    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // localStorage에 설정이 없는 경우에만 시스템 테마 따라가기
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkMode(e.matches);
        applyDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  return {
    isDarkMode,
    toggleDarkMode
  };
}