import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Card } from '../../components/ui/card';
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  FileText,
  File,
  FileSpreadsheet,
  ExternalLink,
  Star
} from 'lucide-react';
import type { FileItem } from '../../types';
import { findUser } from './utils/findUser';

interface FileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: FileItem) => void;
  files: FileItem[];
  onToggleFavorite: (fileId: string) => void;
  zIndex?: number;
}

export function FileSearchModal({
  isOpen,
  onClose,
  onFileSelect,
  files,
  onToggleFavorite,
  zIndex = 50,
  disableBackdropClick = false,
}: FileSearchModalProps & { disableBackdropClick?: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fileType, setFileType] = useState('all');
  const [owner, setOwner] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentQueries');
    return saved ? JSON.parse(saved) : [];
  });
  const [uniqueAuthors, setUniqueAuthors] = useState<{ id: string; name: string; }[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchUniqueAuthors = async () => {
      // files에서 lastUpdater(ID)만 뽑아서 중복 제거
      const uniqueIds = Array.from(new Set(files.map(f => f.lastUpdater)));

      // 각 ID를 findUser로 조회
      const names = await Promise.all(
        uniqueIds.map(async (id) => {
          if (!id) return { id: "-", name: "-" };
          const name = await findUser(id);
          return { id, name };
        })
      );
      if (isMounted) {
        setUniqueAuthors(names); // 중복 제거는 이미 ID 기준으로 했으므로 names 그대로
      }
    };
    fetchUniqueAuthors();
    return () => {
      isMounted = false;
    };
  }, [files]);

  const getFileIcon = (icon: string | undefined, type: string) => {
    if (icon && icon !== type) {
      return <span className="text-lg">{icon}</span>;
    }
    switch (type.toLowerCase()) {
      case 'pdf':
        return <File className="w-4 h-4 text-red-500" />;
      case 'powerpoint':
      case 'pptx':
        return <FileSpreadsheet className="w-4 h-4 text-orange-500" />;
      case 'word':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'excel':
      case 'xlsx':
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleSearch = async (queryParam?: string) => {
    const query = String(queryParam ?? searchQuery);
    if (!query.trim()) return;
    setIsSearching(true);

    setTimeout(() => {
      let filtered = files.filter(f =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.type.toLowerCase().includes(query.toLowerCase()) ||
        f.lastUpdater?.toLowerCase().includes(query.toLowerCase())
      );

      if (fileType !== 'all') {
        const typeMap: Record<string, string[]> = {
          pdf: ['pdf'],
          word: ['doc', 'docx'],
          powerpoint: ['ppt', 'pptx'],
          excel: ['xls', 'xlsx'],
          hwp: ['hwp'],
          txt: ['txt'],
        };
        filtered = filtered.filter(f => {
          const type = f.type.toLowerCase();
          return typeMap[fileType.toLowerCase()]?.includes(type);
      })};
      if (owner !== 'all') {
        filtered = filtered.filter(f => f.lastUpdater === owner);
      }
      if (dateRange.from || dateRange.to) {
        filtered = filtered.filter(f => {
          if (!f.updatedAt) return false;
          const updatedAt = new Date(f.updatedAt);
          const fromOk = dateRange.from ? updatedAt >= dateRange.from : true;
          const toOk = dateRange.to ? updatedAt <= new Date(new Date(dateRange.to).setHours(23, 59, 59, 999)) : true;
          return fromOk && toOk;
        });
      }

      setSearchResults(filtered);
      setIsSearching(false);

      setRecentQueries(prev => {
        const updated = [query, ...prev.filter(q => q !== query)]; // 중복 제거 후 앞에 추가
        const sliced = updated.slice(0, 10); // 최대 10개
        localStorage.setItem('recentQueries', JSON.stringify(sliced)); // localStorage에 저장
        return sliced;
      });
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleQuerySelect = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const clearFilters = () => {
    setFileType('all');
    setOwner('all');
    setDateRange({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !disableBackdropClick) onClose(); }}>
      <DialogContent
        className="max-w-4xl h-[80vh] flex flex-col glass-strong border border-white/20"
        style={{ zIndex }}
        onClick={(e) => {
          if (disableBackdropClick) e.stopPropagation();
        }}>
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">파일 검색</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            파일명, 타입, 작성자를 기준으로 파일을 검색하고 필터를 적용할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="예: 2023년 발표자료, 송무 관련 PDF, 회의록 요약본"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-white/80 dark:bg-gray-800/80 border border-white/20"
            />
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleSearch(); // queryParam 없이 호출
              }}
              disabled={!searchQuery.trim() || isSearching}
              className="bg-gradient-primary hover:shadow-lg btn-glow text-white border-0"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(s => !s)}
              className="border-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/10"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Recent Queries */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">최근 검색어</p>
            <div className="flex flex-wrap gap-2">
              {recentQueries.map((q, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="cursor-pointer hover:bg-white/20 bg-white/10 text-gray-700 dark:text-gray-300 card-hover"
                  onClick={() => handleQuerySelect(q)}
                >
                  {q}
                </Badge>
              ))}
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="p-4 glass border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">파일 형식</label>
                  <Select value={fileType} onValueChange={setFileType}>
                    <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 border border-white/20">
                      <SelectValue placeholder="모든 형식" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border border-white/20">
                      <SelectItem value="all">모든 형식</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="word">Word</SelectItem>
                      <SelectItem value="powerpoint">PowerPoint</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="hwp">Hwp</SelectItem>
                      <SelectItem value="txt">TxT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">작성자</label>
                  <Select value={owner} onValueChange={setOwner}>
                    <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 border border-white/20">
                      <SelectValue placeholder="모든 사용자" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border border-white/20">
                      <SelectItem value="all">모든 사용자</SelectItem>
                      {uniqueAuthors.map((author) => (
                        <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">수정 날짜</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white/80 dark:bg-gray-800/80 border border-white/20"
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {dateRange.from ? '선택됨' : '날짜 선택'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 glass-strong border border-white/20">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(v) => setDateRange(v as any)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/10"
                >
                  필터 초기화
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Search Results */}
        <ScrollArea className="flex-1 overflow-auto" style={{maxHeight: '60vh'}}>
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                <span className="text-gray-600 dark:text-gray-400">검색 중...</span>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">{searchResults.length}개의 결과</p>
              {searchResults.map((file) => (
                <Card
                  key={file.id}
                  className="p-4 glass hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all border border-white/20 card-hover group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.icon, file.type)}
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">{file.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{file.type}</span>
                          <span>•</span>
                          <span>{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                          <span>•</span>
                          <span>{file.updatedAt ? new Date(file.updatedAt).toLocaleString() : '-'}</span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{file.path}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(file.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0 hover:bg-white/20"
                      >
                        <Star
                          className={`w-4 h-4 ${file.isFavorite
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-400 hover:text-yellow-500'
                            }`}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onFileSelect(file)}
                        className="text-gray-700 dark:text-gray-300 border-white/20 hover:bg-white/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        열기
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">검색 결과가 없습니다</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">다른 검색어로 시도해보세요</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-400 dark:text-gray-500">검색어를 입력하세요</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
