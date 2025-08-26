import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { ApiKeyModal } from '../settings/ApiKeyModal';
import { ApiConnectionStatus } from '../settings/ApiConnectionStatus';
import { HelpModal } from '../../components/common/HelpModal';
import type { ApiKey } from '../../types';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Shield,
  Palette,
  HelpCircle,
  LogOut,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Download,
  Trash2,
  Key,
  Mail,
  Phone,
  Camera,
  Save,
  Edit,
  Plus,
  MoreVertical,
  Eye,
  Copy,
  Unplug,
  Plug,
  CheckCircle,
  XCircle
} from 'lucide-react';

// --- 소셜 로그인 아이콘 컴포넌트 (그대로 유지) ---
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.355-11.113-7.918l-6.522,5.023C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.986,36.681,44,30.986,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>
);
const KakaoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.52 0 10-4.48 10-10S17.52 2 12 2zm1.06 13.44c-.4.23-1.02.5-1.72.58-.02 0-.03 0-.05.01-.13.01-.26.01-.39.01-.68 0-1.33-.12-1.9-.34-.95-.37-1.5-1.12-1.5-2.07 0-1.29 1.12-2.34 2.5-2.34.82 0 1.51.37 1.9.7l-.61.99c-.27-.26-.74-.53-1.29-.53-.69 0-1.25.45-1.25 1.15s.56 1.15 1.25 1.15c.19 0 .38-.02.56-.06l.75 1.22zM17.5 12c0 .96-.54 1.7-1.5 2.07-.57.22-1.23.34-1.9.34-.13 0-.26 0-.39-.01-.02 0-.03 0-.05-.01-.7-.08-1.32-.35-1.72-.58l.75-1.22c.18.04.37.06.56.06.69 0 1.25-.45 1.25-1.15s-.56-1.15-1.25-1.15c-.55 0-1.02.27-1.29.53l-.61-.99c.39-.33 1.08-.7 1.9-.7 1.38 0 2.5 1.05 2.5 2.34z" fill="#3C1E1E" /></svg>
);

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  apiKeys: ApiKey[];
  connectedKeys: ApiKey[];
  onUpdateApiKeys: (newApiKeys: ApiKey[]) => void;
  onDisconnectApiKey: (apiKeyId: string) => void;
  onConnectApiKey: (apiKeyId: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: (value: boolean) => void;
  onApiKeysChange?: (newApiKeys: ApiKey[]) => void;
  initialTab?: 'profile' | 'preferences' | 'security' | 'about';
}

export function SettingsScreen({
  onBack,
  onLogout,
  onUpdateApiKeys,
  isDarkMode,
  onToggleDarkMode,
  onApiKeysChange,
}: SettingsScreenProps) {
  const [profileData, setProfileData] = useState({
    name: '-',
    email: '-',
    oAuth: 0,
    depart: '-',
    phone: '-',
    level: '-',
    lastPwChgAt: '-'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState<{ id: string; name: string; key: string } | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const location = useLocation();
  const initialTab = location.state?.initialTab || 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'about'>(initialTab);

  const navigate = useNavigate();

  const tabs = [
    { id: 'profile', label: '프로필', icon: <User className="w-4 h-4" /> },
    { id: 'preferences', label: '환경설정', icon: <Palette className="w-4 h-4" /> },
    { id: 'security', label: '보안', icon: <Shield className="w-4 h-4" /> },
    { id: 'about', label: '정보', icon: <HelpCircle className="w-4 h-4" /> }
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8090/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("로그아웃 실패");
      }

      onLogout();
    } catch (e) {
      console.error("로그아웃 중 오류 발생", e);
      alert("로그아웃 실패. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:8090/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setProfileData({
            name: data.name,
            email: data.email,
            oAuth: data.oauth,
            depart: data.depart || '',
            phone: data.phone || '',
            level: data.level || '',
            lastPwChgAt: data.lastPwChgAt || '',
          });
        }
      } catch (err) {
        console.error('유저 정보 불러오기 실패', err);
      }
    };

    fetchUser();
  }, []);

  const fetchUserApis = async () => {
    try {
      const res = await fetch('http://localhost:8090/api/auth/myApis', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setApiKeys(data);
        onApiKeysChange?.(data);
      } else {
        console.error('API 키 로드 실패', data);
        navigate('/login');
      }
    } catch (err) {
      console.error('API 키 불러오기 오류', err);
    }
  };

  useEffect(() => {
    fetchUserApis();
  }, []);


  const handleSaveProfile = async () => {
    setIsEditing(false);
    try {
      const res = await fetch('http://localhost:8090/api/auth/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message || '프로필이 수정되었습니다.');
      } else {
        alert(result.message || '수정 실패');
      }
    } catch (err) {
      console.error('프로필 수정 오류', err);
    }
  };

  const handleAddApiKey = () => {
    setEditingApiKey(null);
    setShowApiKeyModal(true);
  };

  const handleSaveApiKey = async (newApi: ApiKey) => {
    setApiKeys((prev) => [...prev, newApi]);
  };

  const handleDeleteApiKey = async (apiIdx: number) => {
    if (!confirm('정말 이 API 키를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`http://localhost:8090/api/auth/deleteApi?apiIdx=${apiIdx}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await res.json();

      if (res.ok) {
        // 프론트 상태에서 삭제
        setApiKeys((prev) => prev.filter((api) => api.apiIdx !== apiIdx));
        alert(result.message || 'API 키가 삭제되었습니다.');
      } else {
        alert(result.message || 'API 키 삭제 실패');
      }
    } catch (err) {
      console.error(err);
      alert('API 키 삭제 중 오류가 발생했습니다.');
    }
  };

  const changePassword = async () => {
    if (!prompt('현재 비밀번호', '')) return;
  }

  const onConnectApiKey = async (apiIdx: number) => {
    try {
      const res = await fetch(`http://localhost:8090/api/dooray/driveConnect?apiIdx=${apiIdx}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Dooray API 연결 실패');

      const drives = await res.json();
      console.log(drives);

      setApiKeys(prev =>
        prev.map(api => api.apiIdx === apiIdx ? { ...api, isConnected: true } : api)
      );
      alert("연결 성공!");
    } catch (err) {
      alert('연결 실패!');
    }
  };

  const onDisconnectApiKey = async (apiIdx: number) => {
    if (!confirm('연결 해제 하시겠습니까?')) return;
    try {
      await fetch(`http://localhost:8090/api/dooray/driveDisconnect?apiIdx=${apiIdx}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      setApiKeys(prev =>
        prev.map(api => api.apiIdx === apiIdx ? { ...api, isConnected: false } : api)
      );
    } catch (err) {
      console.log("실패")
    }
  };

  const userDelete = async () => {
    let userInput = prompt(`회원 탈퇴 하시겠습니까? \n (${profileData.name}/탈퇴한다)`, `${profileData.name}/탈퇴한다`)
    if (userInput === `${profileData.name}/탈퇴한다`) {
      try {
        const res = await fetch('http://localhost:8090/api/auth/userDelete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        console.log("성공적으로 탈퇴되었습니다.")
        navigate('/login');
      } catch (err) {
        console.log("실패")
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-96 h-96 bg-gradient-accent opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-12 w-80 h-80 bg-gradient-secondary opacity-15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-foreground hover:bg-accent rounded-xl w-12 h-12 p-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">설정</h1>
                <p className="text-muted-foreground">계정 및 앱 설정을 관리하세요</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 사이드바 탭 */}
          <div className="lg:w-80">
            <Card className="glass-strong border border-border p-2">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id
                      ? 'bg-gradient-primary text-white shadow-lg'
                      : 'text-foreground hover:bg-accent'
                      }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            <Card className="glass-strong border border-border p-8">
              {/* 프로필 탭 */}
              {activeTab === 'profile' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">프로필 정보</h2>
                    <Button
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      className={`${isEditing
                        ? 'bg-gradient-primary btn-glow text-white'
                        : 'glass hover:bg-accent text-foreground'
                        } font-medium rounded-xl h-10 px-4 border-0`}
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          저장
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          편집
                        </>
                      )}
                    </Button>
                  </div>

                  {/* 프로필 이미지 */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-secondary rounded-full flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                      </div>
                      {isEditing && (
                        <Button
                          size="sm"
                          className="absolute -bottom-2 -right-2 w-8 h-8 p-0 bg-gradient-primary text-white rounded-full shadow-lg"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-foreground">
                        {profileData.oAuth === 1 && <GoogleIcon></GoogleIcon>}
                        {profileData.oAuth === 2 && <KakaoIcon></KakaoIcon>}
                        {profileData.name}
                      </h3>
                      <p className="text-muted-foreground">{profileData.depart} • {profileData.level}</p>
                    </div>
                  </div>

                  {/* 프로필 폼 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-foreground">이름</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="glass border-border bg-input h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">부서</Label>
                      <Input
                        value={profileData.depart}
                        onChange={(e) => setProfileData(prev => ({ ...prev, depart: e.target.value }))}
                        disabled={!isEditing}
                        className="glass border-border bg-input h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">이메일</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={true}
                          className="glass border-border bg-input h-12 pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">전화번호</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                          className="glass border-border bg-input h-12 pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-foreground">직급</Label>
                      <Input
                        value={profileData.level}
                        onChange={(e) => setProfileData(prev => ({ ...prev, level: e.target.value }))}
                        disabled={!isEditing}
                        className="glass border-border bg-input h-12"
                      />
                    </div>
                  </div>

                  {/* API 연결 상태 간단 표시 */}
                  <div className="glass p-6 rounded-xl border border-border">
                    <h3 className="font-medium text-foreground mb-4">서비스 연결</h3>
                    <div className="space-y-3">
                      {apiKeys.length > 0 ? (
                        apiKeys.slice(0, 2).map(key => (
                          <div key={key.apiIdx} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                                <Key className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{key.apiTitle}</p>
                                <div className="flex items-center space-x-2 text-xs">
                                  <div className={`w-2 h-2 rounded-full ${key.isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                  <span className={`font-medium ${key.isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                                    {key.isConnected ? 'API 연결됨' : 'API 연결 안됨'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">{profileData.name}</span>
                              <div className="w-6 h-6 bg-gradient-secondary rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Key className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">연결된 서비스가 없습니다</p>
                          <Button
                            onClick={() => setActiveTab('security')}
                            className="text-xs bg-gradient-primary btn-glow text-white font-medium rounded-lg px-3 h-7 border-0"
                          >
                            API 키 설정
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 환경설정 탭 - 언어 설정 제거하고 테마만 유지 */}
              {activeTab === 'preferences' && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-xl font-semibold text-foreground">환경설정</h2>

                  {/* 테마 설정만 유지 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground">테마</h3>
                    <div className="glass p-6 rounded-xl border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {isDarkMode ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
                          <div>
                            <p className="font-medium text-foreground">다크 모드</p>
                            <p className="text-sm text-muted-foreground">
                              {isDarkMode ? '어두운 테마가 활성화되어 있습니다' : '밝은 테마가 활성화되어 있습니다'}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={isDarkMode}
                          onCheckedChange={onToggleDarkMode}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 보안 탭 */}
              {activeTab === 'security' && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-xl font-semibold text-foreground">보안</h2>

                  <div className="space-y-6">
                    {/* 비밀번호 변경 */}
                    <div className="glass p-6 rounded-xl border border-border card-hover">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Key className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">비밀번호 변경</p>
                            <p className="text-sm text-muted-foreground">마지막 변경: {profileData.lastPwChgAt ? new Date(profileData.lastPwChgAt).toLocaleString() : '-'}</p>
                          </div>
                        </div>
                        <Button
                          onClick={changePassword}
                          className="glass hover:bg-accent text-foreground font-medium rounded-xl border-0">
                          변경
                        </Button>
                      </div>
                    </div>

                    {/* API 키 관리 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Key className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">API 키 관리</p>
                            <p className="text-sm text-muted-foreground">외부 서비스 연동을 위한 API 키</p>
                          </div>
                        </div>
                        <Button
                          onClick={handleAddApiKey}
                          className="bg-gradient-primary btn-glow text-white font-medium rounded-xl px-4 h-10 border-0"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          추가
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {apiKeys.map((api, idx) => (
                          <div key={`${api.apiURL}-${idx}`} className="glass p-4 rounded-xl border border-border card-hover">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                                    <Key className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground">{api.apiTitle}</p>
                                    <p className="text-sm text-muted-foreground font-mono">{api.apiURL ? `${api.apiURL.slice(0, 3)}${'*'.repeat(api.apiURL.length - 3)}` : ''}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${api.isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                    <span className={`text-xs font-medium ${api.isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                                      {api.isConnected ? '연결됨' : '연결 안됨'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <span>생성: {api.createdDate ? new Date(api.createdDate).toLocaleString() : '-'}</span>
                                  <span>마지막 사용: {api.lastUsed ? new Date(api.lastUsed).toLocaleString() : '-'}</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => api.isConnected ? onDisconnectApiKey(api.apiIdx) : onConnectApiKey(api.apiIdx)}
                                  className={`w-8 h-8 p-0 rounded-lg ${api.isConnected
                                    ? 'text-red-500 hover:text-red-700 hover:bg-red-100/20'
                                    : 'text-green-500 hover:text-green-700 hover:bg-green-100/20'
                                    }`}
                                >
                                  {api.isConnected ? <Unplug className="w-4 h-4" /> : <Plug className="w-4 h-4" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteApiKey(api.apiIdx)}
                                  className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100/20 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {apiKeys.length === 0 && (
                          <div className="glass p-8 rounded-xl border border-border text-center">
                            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                              <Key className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground mb-4">등록된 API 키가 없습니다</p>
                            <Button
                              onClick={handleAddApiKey}
                              className="bg-gradient-primary btn-glow text-white font-medium rounded-xl px-6 h-10 border-0"
                            >
                              첫 번째 API 키 추가
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 정보 탭 */}
              {activeTab === 'about' && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-xl font-semibold text-foreground">앱 정보</h2>

                  <div className="space-y-6">
                    {/* 앱 버전 */}
                    <div className="glass p-6 rounded-xl border border-border">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
                          <SettingsIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Smart Search</h3>
                          <p className="text-muted-foreground">버전 1.0.0</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-border">
                          <span className="text-sm text-muted-foreground">빌드</span>
                          <span className="text-sm font-medium text-foreground">2024.03.15</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border">
                          <span className="text-sm text-muted-foreground">플랫폼</span>
                          <span className="text-sm font-medium text-foreground">Web</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-muted-foreground">개발자</span>
                          <span className="text-sm font-medium text-foreground">Dooray Team</span>
                        </div>
                      </div>
                    </div>

                    {/* 도움말 */}
                    <div className="glass p-6 rounded-xl border border-border card-hover">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <HelpCircle className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">도움말 센터</p>
                            <p className="text-sm text-muted-foreground">사용법과 문제 해결 방법을 확인하세요</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setShowHelpModal(true)}
                          className="glass hover:bg-accent text-foreground font-medium rounded-xl border-0"
                        >
                          열기
                        </Button>
                      </div>
                    </div>

                    {/* 개인정보 처리방침 */}
                    <div className="glass p-6 rounded-xl border border-border card-hover">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">개인정보 처리방침</p>
                            <p className="text-sm text-muted-foreground">데이터 보호 정책을 확인하세요</p>
                          </div>
                        </div>
                        <Button className="glass hover:bg-accent text-foreground font-medium rounded-xl border-0">
                          보기
                        </Button>
                      </div>
                    </div>

                    {/* 로그아웃 */}
                    <div className="glass p-6 rounded-xl border border-red-200/20 bg-red-50/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <LogOut className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="font-medium text-red-700">로그아웃</p>
                            <p className="text-sm text-red-600">계정에서 로그아웃합니다</p>
                          </div>
                        </div>
                        <Button
                          onClick={handleLogout}
                          variant="destructive"
                          className="font-medium rounded-xl px-4 h-10 border-0"
                        >
                          로그아웃
                        </Button>
                      </div>
                      {/* --- 👇 회원탈퇴 버튼 추가 --- */}
                      <div className="text-center mt-4">
                        <button
                          // onClick 핸들러는 추후 실제 탈퇴 로직으로 연결
                          onClick={userDelete}
                          className="text-sm text-muted-foreground hover:text-destructive hover:underline transition-colors"
                        >
                          회원 탈퇴
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      {showApiKeyModal && (
        <ApiKeyModal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
          onSave={handleSaveApiKey}
          refetchApis={fetchUserApis}
        />
      )}

      {showHelpModal && (
        <HelpModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
        />
      )}
    </div>
  );
}