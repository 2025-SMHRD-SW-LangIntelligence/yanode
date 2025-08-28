import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Settings, User } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function UploadScreen() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 🔹 상단 헤더바 */}
      <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        {/* 좌측: 뒤로가기 + 타이틀 */}
        <div className="flex items-center space-x-3">
          {/* 뒤로가기 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-accent"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Button>

          {/* 업로드 아이콘 + 타이틀 */}
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

        {/* 우측: 설정 아이콘 + 프로필 */}
        <div className="flex items-center space-x-4">
          {/* 톱니바퀴 → 환경설정 이동 */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent rounded-full"
            onClick={() => navigate("/settings")} // ✅ 설정 페이지로 이동
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button>

          {/* 인물 아이콘 (원형 배경) */}
          <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center border border-border">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </header>

      {/* 🔹 메인 콘텐츠 */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 w-full max-w-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
          <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground">파일을 끌어다 놓으세요</h2>
          <p className="text-sm text-muted-foreground mt-2">
            또는 아래 버튼을 클릭하여 파일을 선택하세요
          </p>
          <Button className="mt-6 bg-gradient-primary text-white rounded-xl px-6 py-2">
            파일 선택하기
          </Button>
        </div>
      </main>
    </div>
  );
}