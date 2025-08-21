import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  FileText,
  Search,
  Settings,
  MessageSquare,
  User,
  Clock,
  Star,
  Plus,
  Filter,
  Grid,
  List,
  HardDrive,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Upload,
  Unplug,
  AlertCircle,
  CheckCircle,
  ReceiptRussianRuble
} from 'lucide-react';
import Sidebar from '../../imports/Sidebar-2051-288';
import type { FileItem } from '../../types';
import { FileSearchModal } from '../files/FileSearchModal';

interface HomeScreenProps {
  onNavigateToChat: () => void;
  onOpenSettings: () => void;
  hasConnectedApiKeys: boolean;
  files: FileItem[];
  onToggleFavorite: (fileId: string) => void;
  onFileSelect?: (file: FileItem) => void;
  onDisconnectAllApiKeys: () => void;
  apiKeys: ApiKey[];
}

type FileType = {
  id: string;
  name: string;
  type: string;
};

type FolderType = {
  id: string;
  name: string;
  subFolders?: FolderType[];
  files?: FileType[];
};

type DriveType = {
  id: string;
  name: string;
  folders: FolderType[];
};

type ApiDrive = {
  apiTitle: string;
  apiURL: string;
  drives: DriveType[];
};

interface DriveFolder {
  id: string;
  name: string;
  icon: string;
  files: FileItem[];
  isExpanded: boolean;
  subFolders?: DriveFolder[];
}

interface ApiKey {
  apiIdx: number;
  apiTitle: string;
  apiURL: string;
  createdDate?: string;
  lastUsed?: string;
  isConnected?: boolean;
}

export function HomeScreen({
  onNavigateToChat,
  onOpenSettings,
  hasConnectedApiKeys,
  files,
  onToggleFavorite,
  onFileSelect,
  onDisconnectAllApiKeys,
  apiKeys
}: HomeScreenProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites' | 'drive'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFileModal, setShowFileModal] = useState(false);
  const [showApiDropdown, setShowApiDropdown] = useState(false);
  const apiDropdownRef = useRef<HTMLDivElement>(null);
  const [apis, setApis] = useState<ApiKey[]>([]);
  const [selectedApi, setSelectedApi] = useState<string>("");
  const [driveData, setDriveData] = useState<ApiDrive[]>([]);
  const [driveLoading, setDriveLoading] = useState<boolean>(true);

  // 드라이브 파일 평탄화
  const getAllDriveFiles = (drives: ApiDrive[]): FileItem[] => {
    const result: FileItem[] = [];
    const traverseFolder = (folder: FolderType) => {
      if (folder.files) result.push(...folder.files);
      folder.subFolders?.forEach(traverseFolder);
    };
    drives.forEach(api => {
      api.drives.forEach(drive => {
        drive.folders.forEach(traverseFolder);
      });
    });
    return result;
  };

  const allFiles = [...files, ...getAllDriveFiles(driveData)];

  // 실제 파일 데이터에서 최근 파일과 즐겨찾기 파일 필터링
  const recentFiles = allFiles.slice().sort((a, b) => {
    // 실제로는 날짜 비교를 해야 하지만, 여기서는 순서대로 표시
    const timeOrder = ['2시간 전', '5시간 전', '1일 전', '2일 전', '3일 전', '1주 전'];
    return timeOrder.indexOf(a.modified) - timeOrder.indexOf(b.modified);
  });
  const favoriteFiles = allFiles.filter(file => file.isFavorite);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (apiDropdownRef.current && !apiDropdownRef.current.contains(event.target as Node)) {
        setShowApiDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // API 드롭아웃에 설정에 저장된 API 불러오기
  useEffect(() => {
    const apiLoading = async () => {
      try {
        const res = await fetch('http://localhost:8090/api/dooray/apiLoading', {
          method: 'POST',
          credentials: 'include'
        });
        if (!res.ok) throw new Error('API 요청 실패');
        const data = await res.json();
        setApis(data);
        if (data.length > 0) {
          setSelectedApi(data[0].apiKey);
        }
      } catch (err) {
        console.error(err);
      }
    };
    apiLoading();
  }, []);

  // 드라이브 불러오기
  useEffect(() => {
    const driveLoading = async () => {
      try {
        const res = await fetch("http://localhost:8090/api/dooray/driveLoading", {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("API 요청 실패");
        const data = await res.json();
        console.log(data) 
        setDriveData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setDriveLoading(false);
      }
    };
    driveLoading();
  }, []);

  // API 연결해제 핸들러
  const handleDisconnectApi = () => {
    onDisconnectAllApiKeys();
    setShowApiDropdown(false);
  };

  // 현재 탭에 따른 콘텐츠
  const getCurrentTabContent = () => {
    switch (activeTab) {
      case 'recent':
        return recentFiles.slice(0, 8);
      case 'favorites':
        return favoriteFiles.slice(0, 8);
      case 'drive':
        return null; // 드라이브는 별도 렌더링
      default:
        return recentFiles.slice(0, 8);
    }
  };

  const currentFiles = getCurrentTabContent();

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* 확장 사이드바 - 높이 최대화 */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden`}>
        <div className="w-80 h-full bg-muted border-r-2 border-border flex flex-col animate-slide-in">
          {/* 사이드바 헤더 - 축소된 패딩 */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">탐색</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg w-8 h-8 p-0"
            >
              ×
            </Button>
          </div>

          {/* 메인 콘텐츠 영역 - flex-1로 남은 공간 모두 사용 */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* 3개 탭 네비게이션 */}
            <div className="flex space-x-1 bg-accent rounded-lg p-1 border border-border mb-4">
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${activeTab === 'recent'
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Clock className="w-3 h-3" />
                <span>최근</span>
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${activeTab === 'favorites'
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Star className="w-3 h-3" />
                <span>즐겨찾기</span>
              </button>
              <button
                onClick={() => setActiveTab('drive')}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${activeTab === 'drive'
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <HardDrive className="w-3 h-3" />
                <span>드라이브</span>
              </button>
            </div>

            {/* 드라이브 탭 콘텐츠 */}
            {activeTab === 'drive' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {driveLoading ? (
                  <div className="text-center text-sm text-muted-foreground p-4">드라이브 로딩 중...</div>
                ) : driveData.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4">
                    연결된 드라이브가 없습니다.
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {driveData.map((api) => (
                      <div key={api.apiIdx} className="mb-4">
                        <h3 className="text-sm font-semibold text-foreground mb-2">{api.apiTitle}</h3>

                        {api.drives
                          .filter((drive) => !['root', 'trash'].includes(drive.name))
                          .map((drive) => (
                            <div key={drive.id} className="ml-2 mb-2">
                              <div className="flex items-center space-x-2 p-2 bg-background rounded-md shadow-sm">
                                <HardDrive className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">{drive.name}</span>
                              </div>

                              {/* 폴더 트리 */}
                              <div className="ml-4 space-y-1 mt-1">
                                {drive.folders
                                  .filter((folder) => !['root', 'trash'].includes(folder.name))
                                  .map((folder) => (
                                    <FolderNode
                                      key={folder.id}
                                      folder={folder}
                                      onFileSelect={onFileSelect}
                                      onToggleFavorite={onToggleFavorite}
                                    />
                                  ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* 최근 / 즐겨찾기 파일 섹션 - 한 줄 리스트 */}
            {activeTab !== 'drive' && (
              <div className="flex flex-col space-y-2">
                {currentFiles?.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => onFileSelect?.(file)}
                    className="group flex items-center justify-between bg-background border-2 border-border rounded-xl p-3 cursor-pointer hover:bg-accent transition-all"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <span className="text-2xl flex-shrink-0">{file.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate group-hover:text-primary text-sm">
                          {file.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {file.type} • {file.modifiedBy} • {file.modified}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(file.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0 hover:bg-accent flex-shrink-0"
                    >
                      <Star
                        className={`w-4 h-4 ${file.isFavorite
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground hover:text-yellow-500'
                          }`}
                      />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 헤더 */}
        <header className="bg-background border-b-2 border-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 hover:bg-accent rounded-xl border border-border"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <div className="w-5 h-5 text-muted-foreground">
                  <Sidebar />
                </div>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center border border-border">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Smart Search</h1>
                  <p className="text-sm text-muted-foreground">AI 파워드 파일 검색</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* API 연결 상태 배지 with 드롭다운 */}
              <div className="relative" ref={apiDropdownRef}>
                <button
                  onClick={() => hasConnectedApiKeys ? setShowApiDropdown(!showApiDropdown) : onOpenSettings()}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:shadow-lg border-2 ${hasConnectedApiKeys
                    ? 'bg-blue-500 text-white hover:bg-blue-600 border-blue-600'
                    : 'bg-muted text-muted-foreground hover:bg-accent border-border'
                    } card-hover`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${hasConnectedApiKeys ? 'bg-white' : 'bg-muted-foreground'
                    }`}></div>
                  {hasConnectedApiKeys ? 'API 연결됨' : 'API 연결 안됨'}
                  {hasConnectedApiKeys && (
                    <ChevronDown className="w-3 h-3 ml-1" />
                  )}
                </button>

                {/* API 드롭다운 메뉴 */}
                {showApiDropdown && hasConnectedApiKeys && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-background border-2 border-border rounded-lg shadow-clean-lg z-50 animate-fade-in">
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-foreground">연결된 API 키</span>
                      </div>
                      <div className="space-y-2">
                        {apis.length === 0 ? (
                          <p className='text-xs text-muted-foreground'> 연결된 API 키가 없습니다. </p>
                        ) : (
                          apis.map((api) => (
                            <div key={api.apiIdx} className="text-xs text-muted-foreground bg-muted rounded-md p-2">
                              <div className="font-medium">{api.apiTitle}</div>
                              <div className="text-muted-foreground">{api.apiURL ? `${api.apiURL.slice(0, 3)}${'*'.repeat(api.apiURL.length - 3)}` : ''}</div>
                            </div>
                          ))
                        )}

                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={handleDisconnectApi}
                        className="w-full flex items-center space-x-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-all"
                      >
                        <Unplug className="w-4 h-4" />
                        <span>모든 API 연결해제</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowApiDropdown(false);
                          onOpenSettings();
                        }}
                        className="w-full flex items-center space-x-2 p-2 text-sm text-muted-foreground hover:bg-accent rounded-md transition-all mt-1"
                      >
                        <Settings className="w-4 h-4" />
                        <span>API 설정 관리</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 hover:bg-accent rounded-xl border border-border"
                onClick={onOpenSettings}
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </Button>
              <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center border border-border">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* 메인 영역 */}
        <main className="flex-1 p-8 overflow-auto bg-background">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* 환영 섹션 */}
            <div className="text-center space-y-4 py-8">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                안녕하세요! 👋
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                무엇을 찾고 계신가요?
              </p>
            </div>

            {/* 검색 바 - 더 진한 테두리와 그림자 */}
            <div className="relative w-full">
              <div className="bg-background border-2 border-border p-2 rounded-2xl shadow-clean-md">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-muted-foreground ml-4" />
                  <Input
                    type="text"
                    placeholder="파일, 문서, 또는 내용을 검색하세요..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 bg-transparent text-lg placeholder:text-muted-foreground focus:ring-0 h-14"
                  />
                  <Button
                    onClick={onNavigateToChat}
                    className="bg-gradient-primary hover:shadow-lg btn-glow text-white font-semibold px-6 h-12 rounded-xl border border-blue-600"
                  >
                    검색
                  </Button>
                </div>
              </div>
            </div>

            {/* 빠른 액션 - 더 진한 테두리와 그림자 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <Button
                onClick={onNavigateToChat}
                className="bg-background border-2 border-border p-6 h-auto flex flex-col items-center space-y-3 hover:bg-accent text-foreground card-hover shadow-clean-md"
                variant="ghost"
              >
                <MessageSquare className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">AI 채팅</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI와 대화하며 파일 검색
                  </p>
                </div>
              </Button>

              <Button
                className="bg-background border-2 border-border p-6 h-auto flex flex-col items-center space-y-3 hover:bg-accent text-foreground card-hover shadow-clean-md"
                variant="ghost"
              >
                <Plus className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">파일 업로드</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    새 파일 추가하기
                  </p>
                </div>
              </Button>

              <Button
                onClick={() => setShowFileModal(true)}
                className="bg-background border-2 border-border p-6 h-auto flex flex-col items-center space-y-3 hover:bg-accent text-foreground card-hover shadow-clean-md"
                variant="ghost"
              >
                <Search className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">고급 검색</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    필터와 함께 검색
                  </p>
                </div>
              </Button>
            </div>

            {/* API 연결 상태 카드 - 대시보드 스타일 */}
            {!hasConnectedApiKeys && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      API 키 설정이 필요합니다
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      AI 기반 검색 기능을 사용하려면 API 키를 설정해야 합니다.
                      설정에서 API 키를 추가해 주세요.
                    </p>
                    <Button
                      onClick={onOpenSettings}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      설정으로 이동
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 파일 미리보기 섹션 */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-foreground">최근 파일</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="border border-border hover:bg-accent"
                  >
                    {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border border-border hover:bg-accent"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className={`grid gap-4 ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
                }`}>
                {recentFiles.slice(0, 8).map((file) => (
                  <div
                    key={file.id}
                    onClick={() => onFileSelect?.(file)}
                    className="group bg-background border-2 border-border rounded-xl p-4 cursor-pointer transition-all hover:bg-accent card-hover shadow-clean overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <span className="text-2xl flex-shrink-0">{file.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors text-sm leading-5">
                            {file.name}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">{file.type}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(file.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0 hover:bg-accent flex-shrink-0"
                      >
                        <Star
                          className={`w-4 h-4 ${file.isFavorite
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-muted-foreground hover:text-yellow-500'
                            }`}
                        />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                      <span className="truncate flex-1">{file.modifiedBy}</span>
                      <span className="flex-shrink-0">{file.modified}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 파일 검색 모달 */}
      {showFileModal && (
        <FileSearchModal
          isOpen={showFileModal}
          onClose={() => setShowFileModal(false)}
          files={allFiles}
          onFileSelect={(file) => {
            onFileSelect?.(file);
            setShowFileModal(false);
          }}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  );
}
// 폴더 재귀 컴포넌트
function FolderNode({ folder, onFileSelect, onToggleFavorite }: any) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="space-y-1">
      <div
        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-lg cursor-pointer group transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-1">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-blue-500" />
          ) : (
            <Folder className="w-4 h-4 text-blue-500" />
          )}
        </div>
        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
          {folder.name}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">{folder.files.length}</span>
      </div>

      {isExpanded && (
        <div className="ml-6 space-y-1">
          {/* 서브폴더 */}
          {folder.subFolders?.map((sub: any) => (
            <FolderNode
              key={sub.id}
              folder={sub}
              onFileSelect={onFileSelect}
              onToggleFavorite={onToggleFavorite}
            />
          ))}

          {/* 파일 */}
          {folder.files?.map((file: any) => (
            <div
              key={file.id}
              className="group p-2 rounded-lg bg-background hover:bg-accent transition-all cursor-pointer border border-border overflow-hidden"
              onClick={() => onFileSelect?.(file)}
            >
              <div className="flex items-center space-x-2 gap-1">
                <span className="text-sm flex-shrink-0">{file.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{file.type}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0 hover:bg-accent flex-shrink-0"
                >
                  <Star className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}