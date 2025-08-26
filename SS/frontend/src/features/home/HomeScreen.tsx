// C:\Users\smhrd\Desktop\front_f\SS\frontend\src\features\home\HomeScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  FileText,
  Search,
  Settings,
  MessageSquare,
  User,
  Star,
  Plus,
  Filter,
  Grid,
  List,
  ChevronDown,
  Unplug,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import type { FileItem } from '../../types';
import { FileSearchModal } from '../files/FileSearchModal';
import ExplorerSidebar from '../../components/layout/ExplorerSidebar';
import { useNavigate } from 'react-router-dom';

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
  apiKeys,
}: HomeScreenProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFileModal, setShowFileModal] = useState(false);
  const [showApiDropdown, setShowApiDropdown] = useState(false);
  const apiDropdownRef = useRef<HTMLDivElement>(null);
  const [apis, setApis] = useState<ApiKey[]>([]);

  // 정렬 상태
  const [sortOption, setSortOption] = useState<'recent' | 'oldest' | 'name' | 'favorite'>('recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // ✅ 최근/즐겨찾기 파일 (사이드바 vs 메인 화면 구분)
  const recentFilesForSidebar = files.slice(0, 12); // 사이드바: 12개
  const recentFilesForMain = files.slice(0, 8);     // 메인 화면: 8개
  const favoriteFiles = files.filter((file) => file.isFavorite);

  // 안전한 날짜 변환 함수
  const getTime = (d?: string) => (d ? new Date(d).getTime() : 0);

  // ✅ 메인 화면 정렬 로직
  const sortedFiles = [...recentFilesForMain].sort((a, b) => {
    switch (sortOption) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'oldest':
        return getTime(a.modified) - getTime(b.modified);
      case 'favorite':
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
      case 'recent':
      default:
        return getTime(b.modified) - getTime(a.modified);
    }
  });

  // 드롭다운 외부 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (apiDropdownRef.current && !apiDropdownRef.current.contains(event.target as Node)) {
        setShowApiDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // API 키 목록 로딩
  useEffect(() => {
    const apiLoading = async () => {
      try {
        const res = await fetch('http://localhost:8090/api/dooray/apiLoading', {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('API 요청 실패');
        const data = await res.json();
        setApis(data);
      } catch (err) {
        console.error(err);
      }
    };
    apiLoading();
  }, []);

  const handleDisconnectApi = () => {
    onDisconnectAllApiKeys();
    setShowApiDropdown(false);
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* 공통 사이드바 */}
      <div
        className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <ExplorerSidebar
          recentFiles={recentFilesForSidebar} // ✅ 12개 제한
          favoriteFiles={favoriteFiles}
          onFileSelect={(f) => onFileSelect?.(f)}
          activeTabDefault="drive"
          onClose={() => setSidebarOpen(false)}
        />
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
              {/* API 연결 상태 드롭다운 */}
              <div className="relative" ref={apiDropdownRef}>
                <button
                  onClick={() =>
                    hasConnectedApiKeys ? setShowApiDropdown(!showApiDropdown) : onOpenSettings()
                  }
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:shadow-lg border-2 ${
                    hasConnectedApiKeys
                      ? 'bg-blue-500 text-white hover:bg-blue-600 border-blue-600'
                      : 'bg-muted text-muted-foreground hover:bg-accent border-border'
                  } card-hover`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      hasConnectedApiKeys ? 'bg-white' : 'bg-muted-foreground'
                    }`}
                  ></div>
                  {hasConnectedApiKeys ? 'API 연결됨' : 'API 연결 안됨'}
                  {hasConnectedApiKeys && <ChevronDown className="w-3 h-3 ml-1" />}
                </button>

                {showApiDropdown && hasConnectedApiKeys && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-background border-2 border-border rounded-lg shadow-clean-lg z-50 animate-fade-in">
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-foreground">연결된 API 키</span>
                      </div>
                      <div className="space-y-2">
                        {apis.length === 0 ? (
                          <p className="text-xs text-muted-foreground">연결된 API 키가 없습니다.</p>
                        ) : (
                          apis.map((api) => (
                            <div
                              key={api.apiIdx}
                              className="text-xs text-muted-foreground bg-muted rounded-md p-2"
                            >
                              <div className="font-medium">{api.apiTitle}</div>
                              <div className="text-muted-foreground">
                                {api.apiURL
                                  ? `${api.apiURL.slice(0, 3)}${'*'.repeat(api.apiURL.length - 3)}`
                                  : ''}
                              </div>
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
              <h2 className="text-4xl font-bold text-foreground mb-4">안녕하세요! 👋</h2>
              <p className="text-xl text-muted-foreground mb-8">무엇을 찾고 계신가요?</p>
            </div>

            {/* 🔍 검색 바 */}
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

            {/* ⚡ 빠른 액션 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <Button
                onClick={onNavigateToChat}
                className="bg-background border-2 border-border p-6 h-auto flex flex-col items-center space-y-3 hover:bg-accent text-foreground card-hover shadow-clean-md"
                variant="ghost"
              >
                <MessageSquare className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">AI 채팅</h3>
                  <p className="text-sm text-muted-foreground mt-1">AI와 대화하며 파일 검색</p>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/upload')}
                className="bg-background border-2 border-border p-6 h-auto flex flex-col items-center space-y-3 hover:bg-accent text-foreground card-hover shadow-clean-md"
                variant="ghost"
              >
                <Plus className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">파일 업로드</h3>
                  <p className="text-sm text-muted-foreground mt-1">새 파일 추가하기</p>
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
                  <p className="text-sm text-muted-foreground mt-1">필터와 함께 검색</p>
                </div>
              </Button>
            </div>

            {/* ⚠️ API 연결 안내 */}
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
                      AI 기반 검색 기능을 사용하려면 API 키를 설정해야 합니다. 설정에서 API 키를 추가해 주세요.
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

            {/* 📂 최근 파일 */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-foreground">최근 파일</h3>
                <div className="flex items-center space-x-2">
                  {/* 뷰모드 토글 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="border border-border hover:bg-accent"
                  >
                    {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                  </Button>

                  {/* 정렬 드롭다운 */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="border border-border hover:bg-accent"
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                    >
                      <Filter className="w-4 h-4" />
                    </Button>

                    {showSortDropdown && (
                      <div className="absolute right-0 mt-2 w-40 bg-background border border-border rounded-lg shadow-md z-10">
                        <button onClick={() => { setSortOption('recent'); setShowSortDropdown(false); }}
                          className="block w-full text-left px-4 py-2 hover:bg-accent">최신순</button>
                        <button onClick={() => { setSortOption('oldest'); setShowSortDropdown(false); }}
                          className="block w-full text-left px-4 py-2 hover:bg-accent">오래된순</button>
                        <button onClick={() => { setSortOption('name'); setShowSortDropdown(false); }}
                          className="block w-full text-left px-4 py-2 hover:bg-accent">이름순</button>
                        <button onClick={() => { setSortOption('favorite'); setShowSortDropdown(false); }}
                          className="block w-full text-left px-4 py-2 hover:bg-accent">즐겨찾기 우선</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`grid gap-4 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                {sortedFiles.map((file) => (
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
                          className={`w-4 h-4 ${
                            file.isFavorite
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
          files={files}
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
