import React, { useState } from 'react';
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
import type { FileItem} from '../../types';

interface FilePreviewDrawerProps {
  file: FileItem;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (fileId: string) => void;
}

export function FilePreviewDrawer({ file, isOpen, onClose, onToggleFavorite }: FilePreviewDrawerProps) {
  const [showActions, setShowActions] = useState(false);

  if (!isOpen) return null;

  const handleToggleFavorite = () => {
    onToggleFavorite(file.id);
  };

  const fileActions = [
    { icon: <Download className="w-4 h-4" />, label: '다운로드', action: () => {} },
    { icon: <ExternalLink className="w-4 h-4" />, label: '새 탭에서 열기', action: () => {} },
    { icon: <Share2 className="w-4 h-4" />, label: '공유', action: () => {} },
    { icon: <Copy className="w-4 h-4" />, label: '링크 복사', action: () => {} },
    { icon: <Edit className="w-4 h-4" />, label: '편집', action: () => {} },
    { icon: <Trash2 className="w-4 h-4" />, label: '삭제', action: () => {}, danger: true }
  ];

  const relatedFiles = [
    { name: '관련 문서 1.docx', type: 'Word', modified: '2024-03-10', icon: '📄' },
    { name: '관련 문서 2.pdf', type: 'PDF', modified: '2024-03-08', icon: '📋' },
    { name: '참고 자료.xlsx', type: 'Excel', modified: '2024-03-05', icon: '📊' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
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
                  {file.type} • {file.size}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className={`w-10 h-10 p-0 rounded-xl transition-all ${
                  file.isFavorite 
                    ? 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20' 
                    : 'text-muted-foreground hover:bg-accent hover:text-yellow-500'
                }`}
              >
                <Star className={`w-5 h-5 ${file.isFavorite ? 'fill-current' : ''}`} />
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
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            action.danger
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
                <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  파일 미리보기
                </h3>
                <p className="text-muted-foreground mb-6">
                  이 파일 형식의 미리보기를 지원하지 않습니다.
                </p>
                <div className="flex justify-center space-x-3">
                  <Button className="bg-gradient-primary btn-glow text-white font-medium rounded-xl px-6 h-10 border-0">
                    <Download className="w-4 h-4 mr-2" />
                    다운로드
                  </Button>
                  <Button variant="outline" className="font-medium rounded-xl px-6 h-10">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    열기
                  </Button>
                </div>
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
                          <p className="text-sm font-medium text-foreground">수정일</p>
                          <p className="text-sm text-muted-foreground">{file.modified}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">수정자</p>
                          <p className="text-sm text-muted-foreground">{file.modifiedBy}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Star className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">즐겨찾기 상태</p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${
                              file.isFavorite 
                                ? 'text-yellow-500' 
                                : 'text-muted-foreground'
                            }`}>
                              {file.isFavorite ? '즐겨찾기에 추가됨' : '즐겨찾기에 없음'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleToggleFavorite}
                              className={`h-6 px-2 text-xs rounded-md transition-all ${
                                file.isFavorite 
                                  ? 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20' 
                                  : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10'
                              }`}
                            >
                              <Star className={`w-3 h-3 mr-1 ${file.isFavorite ? 'fill-current' : ''}`} />
                              {file.isFavorite ? '제거' : '추가'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Tag className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">파일 크기</p>
                          <p className="text-sm text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Eye className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">조회수</p>
                          <p className="text-sm text-muted-foreground">127회</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">파일 경로</p>
                          <p className="text-sm text-muted-foreground truncate">{file.path}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 관련 파일 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">관련 파일</h3>
                <div className="space-y-3">
                  {relatedFiles.map((relatedFile, index) => (
                    <div
                      key={index}
                      className="bg-card p-4 rounded-xl border border-border hover:bg-accent transition-all cursor-pointer card-hover"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{relatedFile.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {relatedFile.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {relatedFile.type} • {relatedFile.modified}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground w-8 h-8 p-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                  className={`font-medium rounded-xl h-10 px-4 transition-all ${
                    file.isFavorite 
                      ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20' 
                      : 'hover:text-yellow-500 hover:border-yellow-500/30'
                  }`}
                >
                  <Star className={`w-4 h-4 mr-2 ${file.isFavorite ? 'fill-current' : ''}`} />
                  {file.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                </Button>
                <Button variant="outline" className="font-medium rounded-xl h-10 px-4">
                  <Share2 className="w-4 h-4 mr-2" />
                  공유
                </Button>
                <Button variant="outline" className="font-medium rounded-xl h-10 px-4">
                  <Copy className="w-4 h-4 mr-2" />
                  링크
                </Button>
              </div>
              
              <Button className="bg-gradient-primary btn-glow text-white font-medium rounded-xl h-10 px-6 border-0">
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