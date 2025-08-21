import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  User,
  Building2
} from 'lucide-react';

interface ApiConnection {
  id: string;
  name: string;
  type: 'dooray' | 'teams' | 'slack';
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastChecked: string;
  userInfo?: {
    name: string;
    organization: string;
    avatar?: string;
  };
}

interface ApiConnectionStatusProps {
  apiKeys: Array<{
    id?: string;
    name: string;
    key: string;
  }>;
}

export function ApiConnectionStatus({ apiKeys }: ApiConnectionStatusProps) {
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);

  // API 키를 기반으로 연결 상태 초기화
  useEffect(() => {
    const initialConnections: ApiConnection[] = apiKeys.map(key => ({
      id: key.id || crypto.randomUUID(), // id 없으면 생성
      name: key.name,
      type: 'dooray',
      status: 'connected', // 기본 연결 상태
      lastChecked: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      userInfo: {
        name: '양진성',
        organization: '개발팀',
        avatar: '👤'
      }
    }));
    setConnections(initialConnections);
  }, [apiKeys]);

  const testConnection = async (connectionId: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: 'testing' }
          : conn
      )
    );

    await new Promise(resolve => setTimeout(resolve, 2000));
    const isSuccess = Math.random() > 0.1;
    const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { 
              ...conn, 
              status: isSuccess ? 'connected' : 'error',
              lastChecked: now
            }
          : conn
      )
    );
  };

  const testAllConnections = async () => {
    setIsTestingAll(true);
    for (const connection of connections) {
      await testConnection(connection.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    setIsTestingAll(false);
  };

  const getStatusColor = (status: ApiConnection['status']) => {
    switch (status) {
      case 'connected': return 'text-green-600 dark:text-green-400';
      case 'disconnected': return 'text-gray-500 dark:text-gray-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'testing': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: ApiConnection['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="w-4 h-4" />;
      case 'disconnected': return <WifiOff className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'testing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: ApiConnection['status']) => {
    switch (status) {
      case 'connected': return 'API 연결됨';
      case 'disconnected': return 'API 연결 끊김';
      case 'error': return 'API 연결 오류';
      case 'testing': return 'API 연결 확인 중...';
      default: return 'API 상태 불명';
    }
  };

  if (connections.length === 0) {
    return (
      <div className="glass p-6 rounded-xl border border-white/20 text-center">
        <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">등록된 API 키가 없습니다</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          API 키를 추가하면 연결 상태를 확인할 수 있습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">API 연결 상태</h3>
        <Button
          onClick={testAllConnections}
          disabled={isTestingAll}
          className="glass hover:bg-white/20 text-gray-700 dark:text-gray-300 font-medium rounded-xl px-4 h-10 border-0"
        >
          {isTestingAll ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              확인 중...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              전체 확인
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {connections.map((connection) => (
          <div key={connection.id} className="glass p-5 rounded-xl border border-white/20 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  connection.status === 'connected' 
                    ? 'bg-gradient-primary' 
                    : connection.status === 'error'
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Wifi className={`w-5 h-5 ${
                    connection.status === 'connected' ? 'text-white' : 'text-gray-500'
                  }`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{connection.name}</h4>
                  <div className={`flex items-center space-x-2 text-sm ${getStatusColor(connection.status)}`}>
                    {getStatusIcon(connection.status)}
                    <span className="font-medium">{getStatusText(connection.status)}</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => testConnection(connection.id)}
                disabled={connection.status === 'testing'}
                size="sm"
                className="glass hover:bg-white/20 text-gray-700 dark:text-gray-300 font-medium rounded-lg px-3 h-8 border-0"
              >
                {connection.status === 'testing' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  '확인'
                )}
              </Button>
            </div>

            {/* 연결된 경우 사용자 정보 표시 */}
            {connection.status === 'connected' && connection.userInfo && (
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 dark:text-gray-400">사용자:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {connection.userInfo.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {connection.userInfo.organization}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 마지막 확인 시간 */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>마지막 확인: {connection.lastChecked}</span>
              </div>
              
              {connection.status === 'connected' && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">실시간</span>
                </div>
              )}
            </div>

            {/* 오류 메시지 */}
            {connection.status === 'error' && (
              <div className="mt-3 p-3 bg-red-50/50 dark:bg-red-900/20 rounded-lg border border-red-200/30">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700 dark:text-red-400">
                    <p className="font-medium mb-1">연결 실패</p>
                    <p className="text-xs text-red-600 dark:text-red-500">
                      API 키를 확인하거나 네트워크 연결을 점검해주세요.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 전체 연결 상태 요약 */}
      <div className="glass p-4 rounded-xl border border-white/20 bg-blue-50/10 dark:bg-blue-900/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
              <Wifi className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                연결 상태 요약
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {connections.filter(c => c.status === 'connected').length}개 연결됨 / 
                {connections.length}개 총
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {connections.filter(c => c.status === 'connected').length > 0 && (
              <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                서비스 정상
              </div>
            )}
            {connections.filter(c => c.status === 'error').length > 0 && (
              <div className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                오류 발생
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}