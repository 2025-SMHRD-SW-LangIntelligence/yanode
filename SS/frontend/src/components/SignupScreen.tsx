import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Eye, EyeOff, ArrowLeft, Sparkles } from "lucide-react";

interface SignupScreenProps {
  onSignup: () => void;
  onBackToLogin: () => void;
}

export function SignupScreen({ onSignup, onBackToLogin }: SignupScreenProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    try {
      const res = await fetch("http://localhost:8090/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name : formData.name, 
          email : formData.email,
          password : formData.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409){
          alert(data.message);
        } else {
          alert(data.message);
        }
        return;
      }
      if (data.message === "success") {
        onSignup();
      }
    } catch (error) {
      console.error(error);
      alert("이메일 또는 비밀번호를 확인하세요.");
    } finally{
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-96 h-96 bg-gradient-accent opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-12 w-80 h-80 bg-gradient-secondary opacity-20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header with improved back button */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToLogin}
            className="glass-strong border-2 border-border hover:border-border/80 hover:bg-accent transition-all duration-200 w-12 h-12 p-0 rounded-xl shadow-clean card-hover btn-glow"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-foreground">회원가입</h1>
            <p className="text-muted-foreground mt-1">새 계정을 만들어보세요</p>
          </div>
        </div>

        {/* Signup Form */}
        <Card className="glass-strong border-2 border-border p-8 shadow-clean-lg">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Smart Search 시작하기</h2>
            <p className="text-muted-foreground mt-2">필요한 정보를 입력해 주세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">이름</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
                className="w-full h-12 border-2 border-border focus:border-primary focus:ring-2 focus:ring-ring rounded-xl bg-input backdrop-blur-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full h-12 border-2 border-border focus:border-primary focus:ring-2 focus:ring-ring rounded-xl bg-input backdrop-blur-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="8자 이상 입력하세요"
                  className="w-full h-12 border-2 border-border focus:border-primary focus:ring-2 focus:ring-ring rounded-xl bg-input backdrop-blur-sm pr-12 transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">비밀번호 확인</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="w-full h-12 border-2 border-border focus:border-primary focus:ring-2 focus:ring-ring rounded-xl bg-input backdrop-blur-sm pr-12 transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-primary hover:shadow-lg text-white font-semibold rounded-xl transition-all btn-glow border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>계정 생성 중...</span>
                </div>
              ) : (
                "계정 만들기"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <button
                onClick={onBackToLogin}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                로그인하기
              </button>
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            계정을 만들면 서비스 약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}