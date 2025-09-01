import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import {
  X,
  Download,
  ExternalLink,
  Share2,
  Star,
  MoreVertical,
  FileText,
  Calendar,
  User,
  Clock,
  Eye,
  Edit,
  Trash2,
  Copy,
  Tag,
  MessageSquare
} from 'lucide-react';
import type { FileItem } from '../../types';
import { findUser } from './utils/findUser';
import { fetchFavoriteFiles } from './utils/fetchFavoriteFiles';

interface FilePreviewDrawerProps {
  file: FileItem;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (fileId: string) => void;
  zIndex?: number;
  onRecentFileSaved?: (fileId: string) => void;
}

export function FilePreviewDrawer({
  file,
  isOpen,
  onClose,
  onToggleFavorite,
  zIndex = 100,
  onRecentFileSaved,
}: FilePreviewDrawerProps) {
  const [showActions, setShowActions] = useState(false);
  const [creator, setCreator] = useState<string>('로딩중...');
  const [lastUpdater, setLastUpdater] = useState<string>('로딩중...');
  const [isFavorite, setIsFavorite] = useState<boolean>(file.isFavorite ?? false);
  const [hasPreview, setHasPreview] = useState(true);

  if (!isOpen) return null;

  const saveRecentFile = async (fileId: string) => {
    try {
      const res = await fetch(`http://localhost:8090/recentFile/save?fileId=${fileId}`, {
        method: "POST",
        credentials: "include"
      })
      if (onRecentFileSaved) {
        onRecentFileSaved(fileId);
      }
    } catch (error) {
      // console.error(error);
      alert("에러");
    }
  };

  useEffect(() => {
    setIsFavorite(file.isFavorite ?? false);
  }, [file]);

  const handleToggleFavorite = async () => {
    try {
      const endpoint = isFavorite ? "off" : "on";
      const res = await fetch(`http://localhost:8090/fav/${endpoint}?favUrl=${file.id}`, {
        method: "POST",
        credentials: "include"
      });
      if (!res.ok) {
        alert("즐겨찾기 저장 실패");
        return;
      }
      setIsFavorite(!isFavorite);
      onToggleFavorite(file.id);
    } catch (e) {
      alert("에러 발생")
    }
  };

  const fetchFavorite = async () => {
    try {
      const res = await fetch(`http://localhost:8090/fav/exist?favUrl=${file.id}`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        setIsFavorite(await res.json());
      }
    } catch (e) {
      alert("에러 발생")
    }
  }
  useEffect(() => {
    fetchFavorite();
  }, [])

  const fileActions = [
    {
      icon: <Download className="w-4 h-4" />, label: '다운로드', action: () => {
        saveRecentFile(file.id);
        downloadFile();
      }
    },
    {
      icon: <ExternalLink className="w-4 h-4" />, label: '열기', action: () => {
        saveRecentFile(file.id)
        window.open(`https://smhrd.dooray.com/preview-pages/drives/${file.id}`)
      }
    },
    {
      icon: <Copy className="w-4 h-4" />, label: '공유', action: () => {
        saveRecentFile(file.id)
        copyLink();
      }
    },
  ];

  const copyLink = () => {
    const fileLink = `https://smhrd.dooray.com/preview-pages/drives/${file.id}`;
    navigator.clipboard.writeText(fileLink)
      .then(() => {
        alert("링크가 복사되었습니다!");
      })
      .catch(() => {
        alert("복사 실패");
      });
  }

  const downloadFile = () => {
    window.open(`https://smhrd.dooray.com/drive/v1/downloads/${file.driveId}/${file.id}?disposition=attachment`);
  }

  useEffect(() => {
    const loadUsers = async () => {
      const creatorName = await findUser(file.creator);
      const updaterName = await findUser(file.lastUpdater);
      setCreator(creatorName);
      setLastUpdater(updaterName);
    };
    loadUsers();
  }, [file]);

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-auto"
      style={{ zIndex }}>
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 드로어 콘텐츠 */}
      <div className="relative ml-auto w-full max-w-2xl h-full bg-background border-l border-border overflow-hidden animate-slide-in shadow-clean-lg">
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{file.icon}</span>
              <div>
                <h2 className="text-lg font-semibold text-foreground truncate max-w-sm">
                  {file.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {file.type} • {(file.size / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* 즐겨찾기 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleToggleFavorite();
                }}
                className={`w-10 h-10 p-0 rounded-xl transition-all ${isFavorite
                  ? 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20'
                  : 'text-muted-foreground hover:bg-accent hover:text-yellow-500'
                  }`}
              >
                <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-500' : ''}`} />
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActions(!showActions)}
                  className="w-10 h-10 p-0 text-muted-foreground hover:bg-accent rounded-xl"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>

                {showActions && (
                  <div className="absolute right-0 top-12 w-48 bg-popover border border-border rounded-xl shadow-lg z-10">
                    <div className="p-2">
                      {fileActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            action.action();
                            setShowActions(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${action.danger
                            ? 'text-destructive hover:bg-destructive/10'
                            : 'text-foreground hover:bg-accent'
                            }`}
                        >
                          {action.icon}
                          <span className="text-sm">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-10 h-10 p-0 text-muted-foreground hover:bg-accent rounded-xl"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-8">
              {/* 파일 미리보기 */}
              <div className="bg-card rounded-xl p-8 border border-border text-center">
                {file.driveId && file.id ? (
                  <>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      파일 미리보기
                    </h3>
                    {hasPreview && (
                      <img
                        src={`https://smhrd.dooray.com/drive/v1/downloads/${file.driveId}/${file.id}/thumbnails/0/large`}
                        className="mx-auto mb-4 rounded-lg max-h-64"
                        onError={() => setHasPreview(false)}
                      />
                    )}
                    {!hasPreview && (
                      <>
                        <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-12 h-12 text-white" />
                        </div>
                        <p className="text-muted-foreground mb-6">
                          이 파일 형식의 미리보기를 지원하지 않습니다.
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* driveId나 id 자체가 없는 경우 */}
                    <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      파일 미리보기
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      이 파일 형식의 미리보기를 지원하지 않습니다.
                    </p>
                  </>
                )}
              </div>



              {/* 파일 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">파일 정보</h3>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">생성자</p>
                          <p className="text-sm text-muted-foreground">{creator}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">생성일</p>
                          <p className="text-sm text-muted-foreground">{file.createdAt ? new Date(file.createdAt).toLocaleString() : '-'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Star className={`w-5 h-5 mr-1 ${isFavorite ? 'fill-yellow-500 stroke-none' : ''}`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">즐겨찾기 상태</p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${isFavorite
                              ? 'text-yellow-500'
                              : 'text-muted-foreground'
                              }`}>
                              {isFavorite ? '즐겨찾기에 추가됨' : '즐겨찾기에 없음'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleToggleFavorite}
                              className={`h-6 px-2 text-xs rounded-md transition-all ${isFavorite
                                ? 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20'
                                : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10'
                                }`}
                            >
                              <Star className={`w-3 h-3 mr-1 ${isFavorite ? 'fill-yellow-500' : ''}`} />
                              {isFavorite ? '제거' : '추가'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Tag className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">수정자</p>
                          <p className="text-sm text-muted-foreground">{lastUpdater}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Eye className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">수정일</p>
                          <p className="text-sm text-muted-foreground">{file.updatedAt ? new Date(file.updatedAt).toLocaleString() : '-'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">파일 크기</p>
                          <p className="text-sm text-muted-foreground truncate">{(file.size / 1024 / 1024).toFixed(1)}MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 액션 바 */}
          <div className="border-t border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleToggleFavorite}
                  className={`font-medium rounded-xl h-10 px-4 transition-all ${isFavorite
                    ? 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20'
                    : 'text-muted-foreground hover:bg-accent hover:text-yellow-500'
                    }`}
                >
                  <Star className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-yellow-500' : ''}`} />
                  {isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                </Button>
                <Button
                  variant="outline"
                  className="font-medium rounded-xl h-10 px-4"
                  onClick={() => {
                    saveRecentFile(file.id)
                    copyLink();
                  }}>
                  <Share2 className="w-4 h-4 mr-2" />
                  공유
                </Button>
              </div>

              <Button
                className="bg-gradient-primary btn-glow text-white font-medium rounded-xl h-10 px-6 border-0"
                onClick={() => {
                  saveRecentFile(file.id)
                  downloadFile();
                }}>
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}