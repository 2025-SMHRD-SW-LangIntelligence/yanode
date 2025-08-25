import type { FileItem, ApiKey } from '../../types';

export const initialApiKeys: ApiKey[] = [
  {
    apiIdx: 1,
    userIdx: 1,
    apiTitle: '개발팀 Dooray 키',
    apiURL: 'dk_1234567890abcdef...',
    createdDate: '2024-03-15',
    lastUsed: '2시간 전',
    isConnected: true
  },
  {
    apiIdx: 2,
    userIdx: 1,
    apiTitle: '마케팅팀 API 키',
    apiURL: 'dk_abcdef1234567890...',
    createdDate: '2024-03-10',
    lastUsed: '1일 전',
    isConnected: false
  }
];

export const initialFiles: FileItem[] = [
  // 마케팅 관련 문서 5개
  { 
    id: '2', 
    name: '마케팅 전략 문서.docx', 
    type: 'Word', 
    size: '1.8 MB', 
    modified: '5시간 전', 
    modifiedBy: '박부장', 
    path: '/marketing/strategy.docx', 
    icon: '📄', 
    isFavorite: true 
  },
  { 
    id: '10', 
    name: '신제품 마케팅 전략.pptx', 
    type: 'PowerPoint', 
    size: '8.9 MB', 
    modified: '1주 전', 
    modifiedBy: '마케팅팀', 
    path: '/marketing/new_product.pptx', 
    icon: '🚀', 
    isFavorite: false 
  },
  { 
    id: '11', 
    name: '브랜드 포지셔닝 전략.pdf', 
    type: 'PDF', 
    size: '3.4 MB', 
    modified: '3일 전', 
    modifiedBy: '마케팅팀', 
    path: '/marketing/brand_positioning.pdf', 
    icon: '🎯', 
    isFavorite: true 
  },
  { 
    id: '12', 
    name: '소셜미디어 마케팅 가이드.docx', 
    type: 'Word', 
    size: '2.7 MB', 
    modified: '1일 전', 
    modifiedBy: '김마케터', 
    path: '/marketing/social_media_guide.docx', 
    icon: '📱', 
    isFavorite: false 
  },
  { 
    id: '13', 
    name: '고객 세분화 분석 보고서.xlsx', 
    type: 'Excel', 
    size: '4.2 MB', 
    modified: '2일 전', 
    modifiedBy: '데이터팀', 
    path: '/marketing/customer_segmentation.xlsx', 
    icon: '📊', 
    isFavorite: true 
  },
  
  // 기타 문서들
  { 
    id: '1', 
    name: '2024년 분기별 매출 보고서.xlsx', 
    type: 'Excel', 
    size: '2.1 MB', 
    modified: '2시간 전', 
    modifiedBy: '김매니저', 
    path: '/reports/2024_q1_sales.xlsx', 
    icon: '📊', 
    isFavorite: false 
  },
  { 
    id: '3', 
    name: '프로젝트 계획서.pdf', 
    type: 'PDF', 
    size: '3.2 MB', 
    modified: '1일 전', 
    modifiedBy: '최팀장', 
    path: '/projects/plan.pdf', 
    icon: '📋', 
    isFavorite: false 
  },
  { 
    id: '4', 
    name: '고객 피드백 분석.pptx', 
    type: 'PowerPoint', 
    size: '5.8 MB', 
    modified: '2일 전', 
    modifiedBy: '이과장', 
    path: '/analysis/feedback.pptx', 
    icon: '📈', 
    isFavorite: true 
  },
  { 
    id: '5', 
    name: '제품 사양서.pdf', 
    type: 'PDF', 
    size: '1.2 MB', 
    modified: '3일 전', 
    modifiedBy: '정대리', 
    path: '/products/spec.pdf', 
    icon: '🔧', 
    isFavorite: false 
  },
  { 
    id: '6', 
    name: '회의록 템플릿.docx', 
    type: 'Word', 
    size: '856 KB', 
    modified: '1주 전', 
    modifiedBy: '김대리', 
    path: '/templates/meeting.docx', 
    icon: '📝', 
    isFavorite: false 
  },
  { 
    id: '7', 
    name: '회사 규정집.pdf', 
    type: 'PDF', 
    size: '4.1 MB', 
    modified: '1개월 전', 
    modifiedBy: '인사팀', 
    path: '/hr/regulations.pdf', 
    icon: '📚', 
    isFavorite: true 
  },
  { 
    id: '8', 
    name: '브랜드 가이드라인.pdf', 
    type: 'PDF', 
    size: '12.5 MB', 
    modified: '2개월 전', 
    modifiedBy: '디자인팀', 
    path: '/brand/guidelines.pdf', 
    icon: '🎨', 
    isFavorite: true 
  },
  { 
    id: '9', 
    name: '직원 명단.xlsx', 
    type: 'Excel', 
    size: '2.8 MB', 
    modified: '3개월 전', 
    modifiedBy: '인사팀', 
    path: '/hr/employees.xlsx', 
    icon: '👥', 
    isFavorite: false 
  }
];