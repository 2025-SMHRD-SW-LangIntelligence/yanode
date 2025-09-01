import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Upload, Settings, User, FileText, Folder, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "../../components/ui/button";
import type { DriveFolder } from "../files/hooks/useDriveFolders";

interface UploadedFile {
  file: File;
  preview?: string;
}

export default function UploadScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const driveFolders: DriveFolder[] = location.state?.driveFolders || [];
  const apiIdx: number = location.state?.apiIdx;
  const apiURL: string = location.state?.apiURL;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles: UploadedFile[] = Array.from(files).map((file) => {
      if (file.type.startsWith("image/")) {
        return { file, preview: URL.createObjectURL(file) };
      } else {
        return { file };
      }
    });
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const toggleFolder = (id: string) => {
    const newSet = new Set(expandedFolders);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedFolders(newSet);
  };

  // 🔹 폴더 트리 렌더링
  const renderFolders = (folders: DriveFolder[], depth = 0) => {
    return folders.map((folder) => {
      const isExpanded = expandedFolders.has(folder.id);
      return (
        <div key={folder.id} style={{ marginLeft: depth * 16 }} className="mb-1">
          <div
            className={`flex items-center p-1 rounded cursor-pointer hover:bg-accent ${selectedFolder === folder.id ? "bg-blue-100" : ""
              }`}
            onClick={() => setSelectedFolder(folder.id)}
          >
            {folder.folders && folder.folders.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
                className="mr-1"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            ) : (
              <span className="w-4 mr-1" />
            )}
            <Folder className="w-4 h-4 text-yellow-500 mr-2" />
            <span className="text-sm">{folder.name}</span>
          </div>

          {isExpanded && folder.folders && (
            <div className="ml-4">{renderFolders(folder.folders, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  const uploadFileToDrive = async (file: File, parentId: string | null, apiURL: string) => {
    const folder = driveFolders.find(f => f.id === parentId);
    const driveId = folder?.driveId || driveFolders[0].driveId;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("driveId", driveId);
    if (parentId) formData.append("parentId", parentId);
    formData.append("apiURL", apiURL);

    // 🔹 Spring 서버에 업로드 요청
    const response = await fetch("http://localhost:8090/api/dooray/uploadFile", {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    if (!response.ok) throw new Error(`업로드 실패: ${response.status}`);
    return await response.json();
  };

  const handleUpload = async () => {
    if (!selectedFolder) return alert("업로드할 폴더를 선택하세요!");
    if (uploadedFiles.length === 0) return alert("업로드할 파일을 선택하세요!");

    try {
      for (const f of uploadedFiles) {
        const result = await uploadFileToDrive(f.file, selectedFolder || null, apiURL);
      }
      alert("업로드 완료!");
      setUploadedFiles([]);
    } catch (error) {
      alert("중복된 파일은 업로드 불가합니다!");
    }
  };


  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 🔹 상단 헤더바 */}
      <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-accent"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">파일 업로드</h1>
              <p className="text-sm text-muted-foreground">
                새 파일을 업로드하여 관리할 수 있습니다
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent rounded-full"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button>

          <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center border border-border">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </header>

      {/* 🔹 메인 콘텐츠 */}
      <main className="flex-1 p-6 flex flex-col items-center text-center">
        {/* 📂 왼쪽: 폴더 트리 */}
        <div className="w-64 border-r pr-4 overflow-y-auto">
          <h2 className="font-semibold mb-2">폴더 선택</h2>
          {renderFolders(driveFolders)}
        </div>

        <div className="flex-1 flex flex-col items-center text-center">
          <div className={`border-2 border-dashed rounded-2xl p-12 w-full max-w-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground">파일을 끌어다 놓으세요</h2>
            <p className="text-sm text-muted-foreground mt-2">
              또는 아래 버튼을 클릭하여 파일을 선택하세요
            </p>
            <Button
              className="mt-6 bg-gradient-primary text-white rounded-xl px-6 py-2"
            >
              파일 선택하기
            </Button>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          {/* 🔹 업로드 미리보기 */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6 w-full max-w-xl grid grid-cols-3 gap-4">
              {uploadedFiles.map((f, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-2 flex flex-col items-center justify-center text-center bg-white"
                >
                  {f.preview ? (
                    <img
                      src={f.preview}
                      alt={f.file.name}
                      className="w-full h-24 object-cover rounded-md mb-2"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-gray-400 mb-2" />
                  )}
                  <p className="text-sm truncate">{f.file.name}</p>
                  <p className="text-xs text-muted-foreground">{f.file.type || "unknown"}</p>
                </div>
              ))}
            </div>
          )}
          {/* 🔹 업로드 버튼 */}
          {uploadedFiles.length > 0 && (
            <Button
              className="mt-6 bg-green-600 text-white rounded-xl px-6 py-2"
              onClick={handleUpload}
            >
              선택한 폴더에 업로드
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
