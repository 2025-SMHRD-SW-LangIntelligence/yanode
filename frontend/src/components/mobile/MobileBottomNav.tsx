import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Home, 
  MessageCircle, 
  Settings
} from 'lucide-react';
import type { MobileNavProps } from '../../types';

const NAV_ITEMS = [
  {
    id: 'home' as const,
    label: '홈',
    icon: Home,
    badge: null
  },
  {
    id: 'chat' as const,
    label: '채팅',
    icon: MessageCircle,
    badge: null
  },
  {
    id: 'settings' as const,
    label: '설정',
    icon: Settings,
    badge: null
  }
] as const;

const MobileBottomNav: React.FC<MobileNavProps> = ({ 
  currentScreen, 
  onNavigate,
  hasUnreadMessages = false
}) => {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/50"
      role="navigation"
      aria-label="하단 네비게이션"
    >
      <div className="flex items-center justify-around py-3 px-6 safe-area-bottom">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          const showBadge = item.id === 'chat' && hasUnreadMessages;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center h-16 px-4 relative min-w-16 transition-all duration-200 touch-feedback ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={`${item.label}${isActive ? ' (현재 페이지)' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative mb-1">
                <Icon className={`w-6 h-6 transition-all duration-200 ${
                  isActive ? 'text-primary scale-110' : 'text-muted-foreground'
                }`} />
                
                {/* 뱃지 표시 */}
                {showBadge && (
                  <Badge 
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-4 h-4 p-0 text-xs flex items-center justify-center min-w-4 animate-pulse"
                    aria-label="읽지 않은 메시지"
                  >
                    !
                  </Badge>
                )}
              </div>
              
              <span className={`text-xs font-medium transition-all duration-200 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
              
              {/* 활성 상태 표시 */}
              {isActive && (
                <div 
                  className="absolute bottom-0 w-8 h-1 bg-primary rounded-full animate-slide-up"
                  aria-hidden="true"
                />
              )}
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

MobileBottomNav.displayName = 'MobileBottomNav';

export default MobileBottomNav;