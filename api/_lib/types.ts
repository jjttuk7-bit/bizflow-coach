// 서버 전용 타입. 클라이언트의 types.ts와 달리 React 타입(Icon, action)에 의존하지 않는다.
// 프롬프트는 Specialist의 name/role/description만 사용하므로 그 셋만 전송받는다.

export interface BusinessProfile {
  name: string;
  industry: string;
  product: string;
  employees: string;
}

export type BusinessStep = '상권분석' | '메뉴' | '가격' | '판매' | '재무';

export type BusinessData = {
  [key in BusinessStep]: string;
};

export const BUSINESS_STEPS: BusinessStep[] = ['상권분석', '메뉴', '가격', '판매', '재무'];

/** 프롬프트가 실제로 참조하는 코치 정보만 담은 경량 타입. */
export interface SpecialistInfo {
  name: string;
  role: string;
  description: string;
}

/**
 * 네트워크로 오가는 대화 메시지. 클라이언트의 ConversationMessage는
 * author가 Specialist 객체일 수 있지만, 전송 시에는 항상 문자열
 * ('user' | 'system' | 코치 이름)로 평탄화한다.
 */
export interface WireMessage {
  author: string;
  text: string;
}

export interface DashboardMetrics {
  dailyCustomers: string;
  avgSpend: string;
  menuItems: string;
  monthlyRent: string;
}

export interface DelegationResult {
  isDelegation: boolean;
  targetSpecialistName: string | null;
  synthesizedPromptForTarget: string;
  messageForUser: string;
}
