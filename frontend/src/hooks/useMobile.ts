import { useState, useEffect } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // 모바일: 768px 이하
      setIsMobile(width <= 768);
      
      // 태블릿: 769px ~ 1024px
      setIsTablet(width > 768 && width <= 1024);
    };

    // 초기 체크
    checkDevice();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', checkDevice);
    
    // orientation 변경 감지 (모바일에서 회전 시)
    window.addEventListener('orientationchange', () => {
      setTimeout(checkDevice, 100); // orientation 변경 후 약간의 지연
    });

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet
  };
}