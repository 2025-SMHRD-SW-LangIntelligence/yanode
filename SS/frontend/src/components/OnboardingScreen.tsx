import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Search,
  FileText,
  MessageSquare,
  Shield,
  Zap,
  Users,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Smart Search에 오신 것을 환영합니다!",
      description:
        "AI 기반 파일 검색으로 업무 효율성을 높여보세요",
      icon: <Sparkles className="w-16 h-16 text-white" />,
      features: [
        "지능형 문서 검색",
        "자연어 쿼리 지원",
        "실시간 채팅 인터페이스",
      ],
    },
    {
      title: "강력한 AI 검색 엔진",
      description:
        "문서의 내용을 이해하고 정확한 결과를 제공합니다",
      icon: <Search className="w-16 h-16 text-white" />,
      features: [
        "의미 기반 검색",
        "다양한 파일 형식 지원",
        "빠른 검색 결과",
      ],
    },
    {
      title: "스마트 채팅 인터페이스",
      description: "AI 어시스턴트와 대화하듯 파일을 찾아보세요",
      icon: <MessageSquare className="w-16 h-16 text-white" />,
      features: ["자연어 대화", "상황별 추천", "학습하는 AI"],
    },
    {
      title: "보안과 개인정보 보호",
      description:
        "기업급 보안으로 데이터를 안전하게 보호합니다",
      icon: <Shield className="w-16 h-16 text-white" />,
      features: [
        "엔드투엔드 암호화",
        "접근 권한 관리",
        "GDPR 준수",
      ],
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-8 -left-8 w-96 h-96 bg-gradient-secondary opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-1/4 -right-12 w-80 h-80 bg-gradient-accent opacity-15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="w-full max-w-4xl relative z-10 animate-fade-in">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* 좌측 - 아이콘과 일러스트레이션 */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-8">
              <div className="w-32 h-32 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-2xl">
                {steps[currentStep].icon}
              </div>
            </div>

            {/* 개선된 features 목록 */}
            <div className="space-y-4">
              {steps[currentStep].features.map(
                (feature, index) => (
                  <div
                    key={index}
                    className="glass-strong p-4 rounded-xl border border-border animate-slide-in card-hover shadow-clean"
                    style={{
                      animationDelay: `${index * 0.2}s`,
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg font-medium text-foreground">
                        {feature}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* 우측 - 메인 콘텐츠 */}
          <div className="flex-1">
            <Card className="glass-strong border-2 border-border p-8 shadow-clean-lg">
              {/* Progress indicator */}
              <div className="flex justify-center mb-8">
                <div className="flex space-x-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? "bg-gradient-primary scale-125 shadow-lg"
                          : index < currentStep
                            ? "bg-primary"
                            : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {steps[currentStep].description}
                  </p>
                </div>

                {/* 추가 설명 카드들 */}
                <div className="grid gap-4 mt-8">
                  {currentStep === 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="glass-strong border border-border p-4 rounded-xl text-center card-hover shadow-clean">
                        <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">
                          문서
                        </p>
                      </div>
                      <div className="glass-strong border border-border p-4 rounded-xl text-center card-hover shadow-clean">
                        <Search className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">
                          검색
                        </p>
                      </div>
                      <div className="glass-strong border border-border p-4 rounded-xl text-center card-hover shadow-clean">
                        <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">
                          효율성
                        </p>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="glass-strong border border-border p-6 rounded-xl shadow-clean">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg">
                          <Search className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            예시 검색
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            "지난달 매출 보고서를 찾아줘"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="glass-strong border border-border p-6 rounded-xl shadow-clean">
                      <div className="space-y-3">
                        <div className="flex justify-end">
                          <div className="bg-gradient-primary text-white px-4 py-2 rounded-2xl rounded-br-md max-w-xs shadow-lg">
                            "프로젝트 관련 문서를 찾아줘"
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="glass-strong border border-border px-4 py-2 rounded-2xl rounded-bl-md max-w-xs">
                            <span className="text-foreground">"5개의 프로젝트 문서를 찾았습니다 ✨"</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass-strong border border-border p-4 rounded-xl text-center card-hover shadow-clean">
                        <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">
                          보안
                        </p>
                      </div>
                      <div className="glass-strong border border-border p-4 rounded-xl text-center card-hover shadow-clean">
                        <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">
                          협업
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 버튼 영역 */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button
                    variant="ghost"
                    onClick={skipOnboarding}
                    className="flex-1 text-muted-foreground hover:text-foreground hover:bg-accent border border-border rounded-xl h-12"
                  >
                    건너뛰기
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="flex-1 bg-gradient-primary hover:shadow-lg btn-glow text-white font-semibold h-12 rounded-xl border-0"
                  >
                    <span>
                      {currentStep === steps.length - 1
                        ? "시작하기"
                        : "다음"}
                    </span>
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="flex justify-center mt-8">
          <div className="glass-strong border border-border px-6 py-3 rounded-full shadow-clean">
            <p className="text-sm text-muted-foreground font-medium">
              {currentStep + 1} / {steps.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}