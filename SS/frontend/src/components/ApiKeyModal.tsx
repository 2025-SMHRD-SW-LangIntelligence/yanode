import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Key, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, name: string) => void;
  editingKey?: { id: string; name: string; key: string } | null;
}

export function ApiKeyModal({ isOpen, onClose, onSave, editingKey }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(editingKey?.key || '');
  const [keyName, setKeyName] = useState(editingKey?.name || '');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!apiKey.trim() || !keyName.trim()) return;

    setIsLoading(true);
    setValidationStatus('validating');

    try {
      const res = await fetch('http://localhost:8090/api/auth/addApi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
          apiTitle: keyName,
          apiURL: apiKey
        }),
      });
      
      const result = await res.json();

      if (res.ok) {
        setValidationStatus('valid');

        const newApi = {
          id : crypto.randomUUID,
          apiTitle: keyName,
          apiURL: apiKey,
          createdDate: result.createdDate,
          lastUsed: null,
          isConnected: false
        };

        setTimeout(() => {
          onSave(newApi);
          handleClose();
          alert(result.message || 'API가 저장되었습니다.');
        }, 100);
      } else {
        setValidationStatus('invalid')
        setIsLoading(false);
        alert(result.message || 'API 저장 실패');
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setValidationStatus('invalid')
      alert('API 저장 중 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    setApiKey('');
    setKeyName('');
    setShowKey(false);
    setValidationStatus('idle');
    setIsLoading(false);
    onClose();
  };

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    setValidationStatus('idle');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 모달 콘텐츠 */}
      <div className="relative w-full max-w-md mx-4 glass-strong border border-white/20 rounded-2xl shadow-2xl animate-fade-in">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingKey ? 'API 키 수정' : 'Dooray API 키 설정'}
              </h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="w-8 h-8 p-0 text-gray-500 hover:bg-white/10 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Dooray 드라이브에서 파일을 검색하려면 API 키가 필요합니다.
              키는 안전하게 암호화되어 저장됩니다.
            </p>
          </div>

          {/* API 키 이름 */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">API 키 이름</Label>
            <Input
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="예: 개발팀 Dooray 키"
              className="glass border-white/20 bg-white/50 dark:bg-gray-800/50 h-12"
            />
          </div>

          {/* API 키 입력 */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Dooray API 키</Label>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="Dooray API 키를 입력하세요"
                className={`glass border-white/20 bg-white/50 dark:bg-gray-800/50 h-12 pr-20 ${validationStatus === 'valid' ? 'border-green-300 dark:border-green-600' :
                    validationStatus === 'invalid' ? 'border-red-300 dark:border-red-600' : ''
                  }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                {validationStatus === 'validating' && (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                )}
                {validationStatus === 'valid' && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                {validationStatus === 'invalid' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {validationStatus === 'invalid' && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>유효하지 않은 API 키입니다. 다시 확인해주세요.</span>
              </p>
            )}

            {validationStatus === 'valid' && (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>API 키가 확인되었습니다.</span>
              </p>
            )}
          </div>

          {/* API 키 가이드 */}
          <div className="glass p-4 rounded-xl border border-blue-200/30 bg-blue-50/20 dark:bg-blue-900/20">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">API 키를 찾는 방법:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Dooray 설정 → API → 개인 API 키 생성</li>
                  <li>권한: 드라이브 읽기 권한 필요</li>
                  <li>생성된 키를 복사하여 입력</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex space-x-3 p-6 border-t border-white/20">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 text-gray-600 dark:text-gray-400 hover:bg-white/10 font-medium rounded-xl h-12"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={!apiKey.trim() || !keyName.trim() || isLoading}
            className="flex-1 bg-gradient-primary btn-glow text-white font-medium rounded-xl h-12 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>검증 중...</span>
              </div>
            ) : (
              '설정 완료'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}