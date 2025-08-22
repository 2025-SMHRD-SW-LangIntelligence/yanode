import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  X, 
  ChevronRight, 
  User, 
  Palette, 
  Shield, 
  Database, 
  HelpCircle,
  Key,
  Settings,
  Bell,
  Globe,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Search,
  Wifi
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const helpSections: HelpSection[] = [
    {
      id: 'overview',
      title: '설정 개요',
      icon: <Settings className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Smart Search 설정</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              설정 페이지에서는 프로필 정보, 환경 설정, 보안 설정, 데이터 관리 등 
              앱의 모든 기능을 사용자의 필요에 맞게 조정할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass p-4 rounded-xl border border-white/20">
              <div className="flex items-center space-x-3 mb-2">
                <User className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">프로필</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                개인 정보 및 계정 설정을 관리합니다.
              </p>
            </div>

            <div className="glass p-4 rounded-xl border border-white/20">
              <div className="flex items-center space-x-3 mb-2">
                <Palette className="w-5 h-5 text-purple-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">환경설정</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                테마, 언어, 알림 등 앱 환경을 설정합니다.
              </p>
            </div>

            <div className="glass p-4 rounded-xl border border-white/20">
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="w-5 h-5 text-green-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">보안</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                API 키 관리 및 보안 설정을 구성합니다.
              </p>
            </div>

            <div className="glass p-4 rounded-xl border border-white/20">
              <div className="flex items-center space-x-3 mb-2">
                <Database className="w-5 h-5 text-orange-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">데이터</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                데이터 백업 및 계정 관리를 수행합니다.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'profile',
      title: '프로필 설정',
      icon: <User className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">프로필 정보 관리</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              프로필 탭에서는 개인 정보를 수정하고 서비스 연결 상태를 확인할 수 있습니다.
            </p>
          </div>

          <div className="space-y-4">
            <div className="glass p-4 rounded-xl border border-blue-200/30 bg-blue-50/20 dark:bg-blue-900/20">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">프로필 편집 방법</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-600 dark:text-blue-400">
                    <li>우측 상단의 "편집" 버튼을 클릭합니다</li>
                    <li>수정하고 싶은 정보를 입력합니다</li>
                    <li>"저장" 버튼을 클릭하여 변경사항을 저장합니다</li>
                  </ol>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">설정 가능한 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">이름</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">부서</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">이메일</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">전화번호</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">직급</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">서비스 연결 상태</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                프로필 하단에서 연결된 외부 서비스의 상태를 확인할 수 있습니다.
              </p>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 dark:text-green-400 font-medium">API 연결됨</span>
                <span className="text-gray-500 dark:text-gray-400">- 정상 작동</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'preferences',
      title: '환경설정',
      icon: <Palette className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">앱 환경 맞춤 설정</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              환경설정에서는 앱의 모양과 동작을 개인의 선호에 맞게 조정할 수 있습니다.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Palette className="w-3 h-3 text-white" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">테마 설정</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                라이트 모드와 다크 모드를 전환할 수 있습니다.
              </p>
              <div className="glass p-3 rounded-lg border border-white/20">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 다크 모드는 눈의 피로를 줄이고 배터리 수명을 연장할 수 있습니다.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-gradient-secondary rounded-lg flex items-center justify-center">
                  <Globe className="w-3 h-3 text-white" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">언어 설정</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                지원되는 언어로 인터페이스를 변경할 수 있습니다.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="glass p-2 rounded text-center">🇰🇷 한국어</div>
                <div className="glass p-2 rounded text-center">🇺🇸 English</div>
                <div className="glass p-2 rounded text-center">🇯🇵 日本語</div>
                <div className="glass p-2 rounded text-center">🇨🇳 中文</div>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-gradient-accent rounded-lg flex items-center justify-center">
                  <Bell className="w-3 h-3 text-white" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">알림 설정</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                받고 싶은 알림 유형을 선택할 수 있습니다.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">이메일 알림</span>
                  <span className="text-gray-500 dark:text-gray-400">검색 결과, 업데이트</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">푸시 알림</span>
                  <span className="text-gray-500 dark:text-gray-400">즉시 알림</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">데스크톱 알림</span>
                  <span className="text-gray-500 dark:text-gray-400">브라우저 알림</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: '보안 설정',
      icon: <Shield className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">보안 및 API 관리</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              계정 보안을 강화하고 외부 서비스 연동을 위한 API 키를 안전하게 관리합니다.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Key className="w-3 h-3 text-white" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">API 키 관리</h4>
              </div>
              
              <div className="glass p-4 rounded-xl border border-green-200/30 bg-green-50/20 dark:bg-green-900/20 mb-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-green-700 dark:text-green-300 mb-2">API 키 추가 방법</h5>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-green-600 dark:text-green-400">
                      <li>Dooray 설정 → API → 개인 API 키 생성</li>
                      <li>드라이브 읽기 권한을 포함하여 키 생성</li>
                      <li>"추가" 버튼을 클릭하여 키 등록</li>
                      <li>키 이름과 API 키를 입력 후 저장</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-900 dark:text-white">API 키 기능</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">키 추가/편집/삭제</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">연결 상태 실시간 확인</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">키 복사 및 공유</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">암호화된 안전한 저장</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-gradient-accent rounded-lg flex items-center justify-center">
                  <Wifi className="w-3 h-3 text-white" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">연결 상태 확인</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                등록된 API 키의 연결 상태를 실시간으로 모니터링합니다.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 dark:text-green-400 font-medium">API 연결됨</span>
                  <span className="text-gray-500 dark:text-gray-400">- 정상 작동</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 dark:text-red-400 font-medium">API 연결 오류</span>
                  <span className="text-gray-500 dark:text-gray-400">- 키 확인 필요</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">API 연결 확인 중</span>
                  <span className="text-gray-500 dark:text-gray-400">- 잠시 기다려주세요</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'data',
      title: '데이터 관리',
      icon: <Database className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">데이터 백업 및 계정 관리</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              개인 데이터를 안전하게 백업하고 필요시 계정을 삭제할 수 있습니다.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Download className="w-3 h-3 text-white" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">데이터 내보내기</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                계정 정보, 설정 데이터, 검색 기록 등을 JSON 형태로 다운로드할 수 있습니다.
              </p>
              <div className="glass p-3 rounded-lg border border-white/20">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">포함되는 데이터</h5>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• 프로필 정보 (이름, 이메일, 부서 등)</li>
                  <li>• 환경 설정 (테마, 언어, 알림 설정)</li>
                  <li>• API 키 정보 (키 이름, 생성일 - 키 값 제외)</li>
                  <li>• 검색 기록 및 즐겨찾기</li>
                </ul>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-3 h-3 text-white" />
                </div>
                <h4 className="font-medium text-red-600 dark:text-red-400">계정 삭제</h4>
              </div>
              
              <div className="glass p-4 rounded-xl border border-red-200/30 bg-red-50/20 dark:bg-red-900/20">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-red-700 dark:text-red-300 mb-2">⚠️ 주의사항</h5>
                    <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
                      <li>• 계정 삭제는 되돌릴 수 없습니다</li>
                      <li>• 모든 개인 데이터가 영구적으로 삭제됩니다</li>
                      <li>• API 키와 연결 정보도 함께 삭제됩니다</li>
                      <li>• 삭제 전 데이터 내보내기를 권장합니다</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: '문제해결',
      icon: <HelpCircle className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">자주 묻는 질문 및 문제해결</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Smart Search 사용 중 발생할 수 있는 문제들과 해결 방법을 안내합니다.
            </p>
          </div>

          <div className="space-y-4">
            <div className="glass p-4 rounded-xl border border-white/20">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">🔧 API 연결 문제</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Q: API 키를 입력했는데 연결되지 않아요</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    A: 다음을 확인해보세요: ①API 키가 정확한지 ②드라이브 권한이 포함되었는지 ③네트워크 연결 상태
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Q: 연결이 자주 끊어져요</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    A: API 키의 유효기간을 확인하고, Dooray 계정의 상태를 점검해보세요.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass p-4 rounded-xl border border-white/20">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">⚙️ 설정 관련 문제</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Q: 설정이 저장되지 않아요</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    A: 브라우저의 로컬 스토리지가 활성화되어 있는지 확인하고, 시크릿 모드가 아닌지 확인하세요.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Q: 다크 모드가 적용되지 않아요</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    A: 페이지를 새로고침하거나 브라우저 캐시를 삭제해보세요.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass p-4 rounded-xl border border-white/20">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">📧 계정 문제</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Q: 프로필 정보를 수정할 수 없어요</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    A: "편집" 버튼을 먼저 클릭한 후 정보를 수정하고 "저장" 버튼을 눌러주세요.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Q: 알림이 오지 않아요</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    A: 환경설정에서 알림 설정을 확인하고, 브라우저의 알림 권한을 허용했는지 확인하세요.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass p-4 rounded-xl border border-blue-200/30 bg-blue-50/20 dark:bg-blue-900/20">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">💡 추가 도움이 필요하세요?</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                    위의 해결 방법으로도 문제가 해결되지 않는다면:
                  </p>
                  <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
                    <li>• 정보 탭의 "문의하기"를 통해 연락하세요</li>
                    <li>• 오류 메시지와 함께 상세한 상황을 알려주세요</li>
                    <li>• 브라우저 정보와 사용 환경을 포함해주세요</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = helpSections.filter(section =>
    searchQuery === '' || 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 콘텐츠 */}
      <div className="relative w-full max-w-6xl h-[85vh] mx-4 glass-strong border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">설정 도움말</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Smart Search 설정 가이드</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 text-gray-500 hover:bg-white/10 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex h-[calc(100%-80px)]">
          {/* 사이드바 */}
          <div className="w-80 border-r border-white/20 p-6 overflow-auto">
            {/* 검색 */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="도움말 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass border border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-500 bg-white/50 dark:bg-gray-800/50"
              />
            </div>

            {/* 섹션 목록 */}
            <div className="space-y-2">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeSection === section.id
                      ? 'bg-gradient-primary text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20'
                  }`}
                >
                  {section.icon}
                  <span className="font-medium">{section.title}</span>
                  <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                    activeSection === section.id ? 'rotate-90' : ''
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1 p-6 overflow-auto">
            {filteredSections.find(section => section.id === activeSection)?.content}
          </div>
        </div>
      </div>
    </div>
  );
}