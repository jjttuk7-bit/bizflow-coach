import {
  BusinessProfile,
  BusinessData,
  DashboardMetrics,
  Specialist,
  ConversationMessage,
} from '../types';
import { getAccessToken } from '../lib/supabase';

/**
 * 모든 AI 호출은 /api/coach 서버리스 함수를 거친다.
 * OpenAI 키와 프롬프트 본문은 서버에만 존재하므로 이 파일에는 없다.
 */

type WireMessage = { author: string; text: string };
type SpecialistInfo = { name: string; role: string; description: string };

/** Specialist에는 React 컴포넌트(Icon)와 함수(action)가 들어 있어 그대로 직렬화할 수 없다. */
function toInfo(s: Specialist): SpecialistInfo {
  return { name: s.name, role: s.role, description: s.description };
}

/** author가 Specialist 객체일 수 있으므로 전송 전에 이름 문자열로 평탄화한다. */
function toWire(conversation: ConversationMessage[]): WireMessage[] {
  return conversation.map((m) => ({
    author: typeof m.author === 'string' ? m.author : m.author?.name ?? '알 수 없음',
    text: m.text,
  }));
}

async function callCoach<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');

  let res: Response;
  try {
    res = await fetch('/api/coach', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action, payload }),
    });
  } catch {
    throw new Error('네트워크 연결을 확인해주세요.');
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error || 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
  return body.result as T;
}

// ---- 파싱 / 구조화 ----

export const parseBusinessProfile = (description: string) =>
  callCoach<BusinessProfile>('parseBusinessProfile', { description });

export const parseBusinessData = (description: string) =>
  callCoach<BusinessData>('parseBusinessData', { description });

export const getDashboardMetrics = (profile: BusinessProfile, data: BusinessData) =>
  callCoach<DashboardMetrics>('getDashboardMetrics', { profile, data });

export const routeAndDelegate = (
  profile: BusinessProfile,
  data: BusinessData,
  conversationHistory: ConversationMessage[],
  currentSpecialist: Specialist,
  allSpecialists: Specialist[],
  latestQuery: string,
) =>
  callCoach<{
    isDelegation: boolean;
    targetSpecialistName: string | null;
    synthesizedPromptForTarget: string;
    messageForUser: string;
  }>('routeAndDelegate', {
    profile,
    data,
    conversationHistory: toWire(conversationHistory),
    currentSpecialist: toInfo(currentSpecialist),
    allSpecialists: allSpecialists.map(toInfo),
    latestQuery,
  });

// ---- 코칭 분석 ----

export const getInitialCoachingAnalysis = (description: string) =>
  callCoach<string>('getInitialCoachingAnalysis', { description });

export const getMarketingAnalysis = (profile: BusinessProfile, data: BusinessData) =>
  callCoach<string>('getMarketingAnalysis', { profile, data });

export const getAdvancedInventoryAnalysis = (
  profile: BusinessProfile,
  data: { recipes: string; sales: string; currentStock: string; suppliers: string },
) => callCoach<string>('getAdvancedInventoryAnalysis', { profile, data });

export const getBusinessIdeaAnalysis = (profile: BusinessProfile, data: BusinessData) =>
  callCoach<string>('getBusinessIdeaAnalysis', { profile, data });

export const getFinancialAnalysis = (profile: BusinessProfile, data: BusinessData) =>
  callCoach<string>('getFinancialAnalysis', { profile, data });

export const getProfitCoachingAnalysis = (profile: BusinessProfile, data: BusinessData, goal: string) =>
  callCoach<string>('getProfitCoachingAnalysis', { profile, data, goal });

export const getDirectAnswer = (profile: BusinessProfile, data: BusinessData, question: string) =>
  callCoach<string>('getDirectAnswer', { profile, data, question });

export const getLegalAnalysis = (profile: BusinessProfile, data: BusinessData) =>
  callCoach<string>('getLegalAnalysis', { profile, data });

export const getTaxAnalysis = (profile: BusinessProfile, data: BusinessData) =>
  callCoach<string>('getTaxAnalysis', { profile, data });

export const getHrCoaching = (profile: BusinessProfile, data: BusinessData, conversationHistory: string) =>
  callCoach<string>('getHrCoaching', { profile, data, conversationHistory });

export const getCSCoaching = (profile: BusinessProfile, data: BusinessData, conversationHistory: string) =>
  callCoach<string>('getCSCoaching', { profile, data, conversationHistory });

export const getMasterCoachAnswer = (profile: BusinessProfile, data: BusinessData, conversationHistory: string) =>
  callCoach<string>('getMasterCoachAnswer', { profile, data, conversationHistory });

export const getChefMasterCoaching = (profile: BusinessProfile, data: BusinessData, conversationHistory: string) =>
  callCoach<string>('getChefMasterCoaching', { profile, data, conversationHistory });

export const getBeverageMasterCoaching = (profile: BusinessProfile, data: BusinessData, conversationHistory: string) =>
  callCoach<string>('getBeverageMasterCoaching', { profile, data, conversationHistory });

export const getDocumentDraft = (contractType: string, formData: Record<string, string>) =>
  callCoach<string>('getDocumentDraft', { contractType, formData });

export const getSalesAnalysis = (salesData: string) =>
  callCoach<string>('getSalesAnalysis', { salesData });

export const getCompetitionStrategyAnalysis = (data: {
  ourStore: string;
  competitorStore: string;
  areaInfo: string;
}) => callCoach<string>('getCompetitionStrategyAnalysis', { data });

export const getShortsScriptAnalysis = (data: { productInfo: string; adTone: string }) =>
  callCoach<string>('getShortsScriptAnalysis', { data });

export const getPricingStrategyAnalysis = (data: {
  objective: string;
  cost: string;
  competition: string;
  customer: string;
}) => callCoach<string>('getPricingStrategyAnalysis', { data });

export const getLocalMarketingAnalysis = (
  profile: BusinessProfile,
  data: { targetArea: string; targetCustomer: string; goal: string; budget: string },
) => callCoach<string>('getLocalMarketingAnalysis', { profile, data });

export const getECommerceStrategy = (data: { productInfo: string }) =>
  callCoach<string>('getECommerceStrategy', { data });

export const getSpaceDirectorAnalysis = (data: { storeSize: string; storeLayout: string; goals: string }) =>
  callCoach<string>('getSpaceDirectorAnalysis', { data });

export const getStartupMentoring = (businessPlan: string, allSpecialists: Specialist[]) =>
  callCoach<string>('getStartupMentoring', { businessPlan, allSpecialists: allSpecialists.map(toInfo) });

export const getBrandCoreAssistance = (
  stage: 'initial_question' | 'define_identity' | 'full_strategy_proposal' | 'refine_identity',
  context: Record<string, any>,
) => callCoach<string>('getBrandCoreAssistance', { stage, context });

export const getArchitectAssistance = (
  stage: 'initial_questions' | 'positioning_choice' | 'structure_development' | 'refinement',
  context: Record<string, any>,
) => callCoach<string>('getArchitectAssistance', { stage, context });

export const getCopywritingAssistance = (
  stage: 'initial_question' | 'sensory_question' | 'drafting' | 'refining_question' | 'finalize',
  context: Record<string, any>,
) => callCoach<any>('getCopywritingAssistance', { stage, context });

export const getFollowUpAnswer = (
  specialist: Specialist,
  profile: BusinessProfile,
  data: BusinessData,
  initialReport: string,
  conversationHistory: ConversationMessage[],
) =>
  callCoach<string>('getFollowUpAnswer', {
    specialist: toInfo(specialist),
    profile,
    data,
    initialReport,
    conversationHistory: toWire(conversationHistory),
  });

export const getDelegatedAnswer = (
  targetSpecialist: Specialist,
  profile: BusinessProfile,
  data: BusinessData,
  synthesizedPrompt: string,
) =>
  callCoach<string>('getDelegatedAnswer', {
    targetSpecialist: toInfo(targetSpecialist),
    profile,
    data,
    synthesizedPrompt,
  });
