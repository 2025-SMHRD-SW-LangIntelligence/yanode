import { useState, useCallback, useMemo } from 'react';
import type { ApiKey, ApiKeysHookReturn } from '../../types';
import { initialApiKeys } from '../files/mockData';

export function useApiKeys(): ApiKeysHookReturn {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);

  const hasConnectedApiKeys = useMemo(() => 
    apiKeys.some(key => key.isConnected), 
    [apiKeys]
  );

  const connectedKeys = useMemo(() => 
    apiKeys.filter(key => key.isConnected), 
    [apiKeys]
  );

  const handleUpdateApiKeys = useCallback((newApiKeys: ApiKey[]) => {
    setApiKeys(newApiKeys);
  }, []);

  const handleDisconnectAllApiKeys = useCallback(() => {
    setApiKeys(prevKeys => 
      prevKeys.map(key => ({
        ...key,
        isConnected: false,
        lastUsed: key.isConnected ? '방금 연결 해제됨' : key.lastUsed
      }))
    );
  }, []);

  const handleDisconnectApiKey = useCallback((apiKeyId: string) => {
    setApiKeys(prevKeys => 
      prevKeys.map(key => 
        key.id === apiKeyId 
          ? { ...key, isConnected: false, lastUsed: '방금 연결 해제됨' }
          : key
      )
    );
  }, []);

  const handleConnectApiKey = useCallback((apiKeyId: string) => {
    setApiKeys(prevKeys => 
      prevKeys.map(key => 
        key.id === apiKeyId 
          ? { ...key, isConnected: true, lastUsed: '방금 전' }
          : key
      )
    );
  }, []);

  return {
    apiKeys,
    hasConnectedApiKeys,
    connectedKeys,
    onUpdateApiKeys: handleUpdateApiKeys,
    onDisconnectAllApiKeys: handleDisconnectAllApiKeys,
    onDisconnectApiKey: handleDisconnectApiKey,
    onConnectApiKey: handleConnectApiKey
  };
}