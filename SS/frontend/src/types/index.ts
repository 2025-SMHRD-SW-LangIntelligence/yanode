// src/types/index.ts

export type Screen = 'login' | 'signup' | 'onboarding' | 'home' | 'chat' | 'settings';

export interface FileItem {
  id: string;
  name: string;
  type: 'pdf' | 'word' | 'excel' | 'powerpoint' | string;
  size: string;
  modified: string;    // 예: '방금 전', '2시간 전'
  modifiedBy: string;  // 예: '김마케팅'
  path: string;
  icon?: string;       // 이모지/아이콘 (옵션)
  isFavorite?: boolean;
}

export interface DriveFolder {
  id: string;
  name: string;
  driveId?: string;
  isExpanded?: boolean;
  files: FileItem[];
  subFolders?: DriveFolder[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  files?: FileItem[];
  timestamp: Date;
}

export interface ApiKey {
  apiIdx: number;
  userIdx: number;
  apiTitle: string;
  apiURL: string;
  createdDate: string;
  lastUsed: string;
  isConnected: boolean;
}

export interface AppState {
  currentScreen: Screen;
  showPreviewDrawer: boolean;
  selectedFile: FileItem | null;
  hasCompletedOnboarding: boolean;
  isAuthenticated: boolean;
}

/* =============================
   Hook 반환 타입들
   ============================= */

export interface AuthHookReturn {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  currentScreen: Screen;
  handleLogin: () => void;
  handleSignup: () => void;
  handleOnboardingComplete: () => void;
  handleLogout: () => void;
  navigateToScreen: (screen: Screen) => void;
}

export interface FilesHookReturn {
  files: FileItem[];
  showPreviewDrawer: boolean;
  selectedFile: FileItem | null;
  onFileSelect: (file: FileItem) => void;
  onToggleFavorite: (fileId: string) => void;
  handleClosePreview: () => void;
  // stats
  totalFiles: number;
  favoriteFiles: FileItem[];
  recentFiles: FileItem[];
  favoriteCount: number;
}

export interface ApiKeysHookReturn {
  apiKeys: ApiKey[];
  hasConnectedApiKeys: boolean;
  connectedKeys: ApiKey[];
  onUpdateApiKeys: (newApiKeys: ApiKey[]) => void;
  onDisconnectAllApiKeys: () => void;
  onDisconnectApiKey: (apiKeyId: string) => void;
  onConnectApiKey: (apiKeyId: string) => void;
}

export interface DarkModeHookReturn {
  isDarkMode: boolean;
  toggleDarkMode: (value: boolean) => void;
}

export interface MobileHookReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/* =============================
   컴포넌트 Props 타입들
   ============================= */

export interface BaseScreenProps {
  onNavigateToChat: () => void;
  onOpenSettings: () => void;
}

export interface FileManagementProps {
  files: FileItem[];
  onToggleFavorite: (fileId: string) => void;
  onFileSelect: (file: FileItem) => void;
}

export interface ApiKeyManagementProps {
  apiKeys: ApiKey[];
  hasConnectedApiKeys: boolean;
  onUpdateApiKeys?: (newApiKeys: ApiKey[]) => void;
  onDisconnectAllApiKeys?: () => void;
  onDisconnectApiKey?: (apiKeyId: string) => void;
  onConnectApiKey?: (apiKeyId: string) => void;
}

export interface SettingsProps {
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: (value: boolean) => void;
}

/* =============================
   모바일 컴포넌트 Props
   ============================= */

export interface MobileHomeScreenProps
  extends BaseScreenProps,
    FileManagementProps,
    ApiKeyManagementProps {}

export interface MobileChatInterfaceProps extends FileManagementProps {
  onOpenSettings: () => void;
  onBack: () => void;
  initialMessage?: string;
}

export interface MobileSettingsScreenProps
  extends SettingsProps,
    ApiKeyManagementProps {}

export interface MobileNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  hasUnreadMessages?: boolean;
}

/* =============================
   레거시 호환 타입 (선택)
   ============================= */

export interface HomeScreenProps extends MobileHomeScreenProps {}
export interface ChatInterfaceProps extends MobileChatInterfaceProps {}
