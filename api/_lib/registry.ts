import * as P from '../_prompts/templates';
import { callText, callJson, stringSchema } from './openai';
import type { BusinessProfile, BusinessData, BusinessStep, SpecialistInfo, WireMessage } from './types';

/**
 * actionId → 프롬프트 생성 + 모델 호출.
 *
 * 클라이언트는 actionId와 payload만 보낸다. 프롬프트 본문은 이 서버에만 존재하므로
 * 번들에 노출되지 않고, 여기 등록되지 않은 임의 프롬프트는 실행될 수 없다.
 */
type Handler = (payload: any) => Promise<unknown>;

const PROFILE_FIELDS = ['name', 'industry', 'product', 'employees'];
/**
 * BusinessData의 키는 한글이지만 JSON Schema 속성 이름으로는 ASCII만 쓴다.
 * Structured Outputs(strict)는 속성 이름에 제약이 있어 비ASCII 키가 거부될 수 있다.
 * 모델에게는 ASCII 키로 받고 서버에서 한글 키로 되돌린다.
 */
const BUSINESS_DATA_KEY_MAP: Record<string, BusinessStep> = {
  marketAnalysis: '상권분석',
  menu: '메뉴',
  price: '가격',
  sales: '판매',
  finance: '재무',
};
const BUSINESS_DATA_FIELDS = Object.keys(BUSINESS_DATA_KEY_MAP);
const METRIC_FIELDS = ['dailyCustomers', 'avgSpend', 'menuItems', 'monthlyRent'];

const delegationSchema = {
  type: 'object',
  properties: {
    isDelegation: { type: 'boolean' },
    targetSpecialistName: {
      type: ['string', 'null'],
      description: '업무를 위임할 전문가의 이름. 위임이 아니면 null.',
    },
    synthesizedPromptForTarget: {
      type: 'string',
      description: '대상 전문가에게 전달할 독립적인 프롬프트. 위임이 아니면 사장님의 원 질문.',
    },
    messageForUser: {
      type: 'string',
      description: '위임이 진행되는 동안 현재 전문가가 사장님에게 건넬 말.',
    },
  },
  required: ['isDelegation', 'targetSpecialistName', 'synthesizedPromptForTarget', 'messageForUser'],
  additionalProperties: false,
};

const copywritingSchema = {
  type: 'object',
  properties: {
    draftA: { type: 'string', description: '따뜻하고 인간적인 스토리를 담은 감성적인 문구 (A안)' },
    draftB: { type: 'string', description: '짧고 위트 있는 문구 (B안)' },
    draftC: { type: 'string', description: '특징과 장점을 솔직하고 명료하게 전달하는 문구 (C안)' },
  },
  required: ['draftA', 'draftB', 'draftC'],
  additionalProperties: false,
};

export const actions: Record<string, Handler> = {
  // ---- 파싱 / 구조화 (JSON) ----
  parseBusinessProfile: (p: { description: string }) =>
    callJson(P.formatProfileParsingPrompt(p.description), 'business_profile', stringSchema(PROFILE_FIELDS)),

  parseBusinessData: async (p: { description: string }) => {
    const raw = await callJson<Record<string, string>>(
      P.formatBusinessDataParsingPrompt(p.description),
      'business_data',
      stringSchema(BUSINESS_DATA_FIELDS),
    );
    const out = {} as BusinessData;
    for (const [ascii, korean] of Object.entries(BUSINESS_DATA_KEY_MAP)) {
      out[korean] = raw[ascii] ?? '';
    }
    return out;
  },

  getDashboardMetrics: (p: { profile: BusinessProfile; data: BusinessData }) =>
    callJson(P.formatDashboardMetricsPrompt(p.profile, p.data), 'dashboard_metrics', stringSchema(METRIC_FIELDS)),

  routeAndDelegate: (p: {
    profile: BusinessProfile;
    data: BusinessData;
    conversationHistory: WireMessage[];
    currentSpecialist: SpecialistInfo;
    allSpecialists: SpecialistInfo[];
    latestQuery: string;
  }) =>
    callJson(
      P.formatDelegationPrompt(
        p.profile, p.data, p.conversationHistory, p.currentSpecialist, p.allSpecialists, p.latestQuery,
      ),
      'delegation_result',
      delegationSchema,
    ),

  // ---- 코칭 분석 (마크다운 텍스트) ----
  getInitialCoachingAnalysis: (p: { description: string }) =>
    callText(P.formatInitialCoachingPrompt(p.description)),

  getMarketingAnalysis: (p: { profile: BusinessProfile; data: BusinessData }) =>
    callText(P.formatMarketingPrompt(p.profile, p.data)),

  getAdvancedInventoryAnalysis: (p: {
    profile: BusinessProfile;
    data: { recipes: string; sales: string; currentStock: string; suppliers: string };
  }) => callText(P.formatAdvancedInventoryPrompt(p.profile, p.data)),

  getBusinessIdeaAnalysis: (p: { profile: BusinessProfile; data: BusinessData }) =>
    callText(P.formatBusinessIdeaPrompt(p.profile, p.data)),

  getFinancialAnalysis: (p: { profile: BusinessProfile; data: BusinessData }) =>
    callText(P.formatFinancialPrompt(p.profile, p.data)),

  getProfitCoachingAnalysis: (p: { profile: BusinessProfile; data: BusinessData; goal: string }) =>
    callText(P.formatProfitCoachingPrompt(p.profile, p.data, p.goal)),

  getDirectAnswer: (p: { profile: BusinessProfile; data: BusinessData; question: string }) =>
    callText(P.formatDirectQueryPrompt(p.profile, p.data, p.question)),

  getLegalAnalysis: (p: { profile: BusinessProfile; data: BusinessData }) =>
    callText(P.formatLegalPrompt(p.profile, p.data)),

  getTaxAnalysis: (p: { profile: BusinessProfile; data: BusinessData }) =>
    callText(P.formatTaxPrompt(p.profile, p.data)),

  getHrCoaching: (p: { profile: BusinessProfile; data: BusinessData; conversationHistory: string }) =>
    callText(P.formatHrPrompt(p.profile, p.data, p.conversationHistory)),

  getCSCoaching: (p: { profile: BusinessProfile; data: BusinessData; conversationHistory: string }) =>
    callText(P.formatCSCoachPrompt(p.profile, p.data, p.conversationHistory)),

  getMasterCoachAnswer: (p: { profile: BusinessProfile; data: BusinessData; conversationHistory: string }) =>
    callText(P.formatMasterCoachPrompt(p.profile, p.data, p.conversationHistory)),

  getChefMasterCoaching: (p: { profile: BusinessProfile; data: BusinessData; conversationHistory: string }) =>
    callText(P.formatChefMasterPrompt(p.profile, p.data, p.conversationHistory)),

  getBeverageMasterCoaching: (p: { profile: BusinessProfile; data: BusinessData; conversationHistory: string }) =>
    callText(P.formatBeverageMasterPrompt(p.profile, p.data, p.conversationHistory)),

  getDocumentDraft: (p: { contractType: string; formData: Record<string, string> }) =>
    callText(P.formatDocumentDraftPrompt(p.contractType, p.formData)),

  getSalesAnalysis: (p: { salesData: string }) =>
    callText(P.formatSalesAnalysisPrompt(p.salesData)),

  getCompetitionStrategyAnalysis: (p: { data: { ourStore: string; competitorStore: string; areaInfo: string } }) =>
    callText(P.formatCompetitionStrategyPrompt(p.data)),

  getShortsScriptAnalysis: (p: { data: { productInfo: string; adTone: string } }) =>
    callText(P.formatShortsScriptPrompt(p.data)),

  getPricingStrategyAnalysis: (p: {
    data: { objective: string; cost: string; competition: string; customer: string };
  }) => callText(P.formatPricingStrategyPrompt(p.data)),

  getLocalMarketingAnalysis: (p: {
    profile: BusinessProfile;
    data: { targetArea: string; targetCustomer: string; goal: string; budget: string };
  }) => callText(P.formatLocalMarketingPrompt(p.profile, p.data)),

  getECommerceStrategy: (p: { data: { productInfo: string } }) =>
    callText(P.formatECommercePrompt(p.data)),

  getSpaceDirectorAnalysis: (p: { data: { storeSize: string; storeLayout: string; goals: string } }) =>
    callText(P.formatSpaceDirectorPrompt(p.data)),

  getStartupMentoring: (p: { businessPlan: string; allSpecialists: SpecialistInfo[] }) =>
    callText(P.formatStartupMentorPrompt(p.businessPlan, p.allSpecialists)),

  getBrandCoreAssistance: (p: { stage: any; context: Record<string, any> }) =>
    callText(P.formatBrandCorePrompt(p.stage, p.context)),

  getArchitectAssistance: (p: { stage: any; context: Record<string, any> }) =>
    callText(P.formatArchitectPrompt(p.stage, p.context)),

  getFollowUpAnswer: (p: {
    specialist: SpecialistInfo;
    profile: BusinessProfile;
    data: BusinessData;
    initialReport: string;
    conversationHistory: WireMessage[];
  }) =>
    callText(
      P.formatFollowUpQueryPrompt(p.specialist, p.profile, p.data, p.initialReport, p.conversationHistory),
    ),

  getDelegatedAnswer: (p: {
    targetSpecialist: SpecialistInfo;
    profile: BusinessProfile;
    data: BusinessData;
    synthesizedPrompt: string;
  }) => callText(P.formatDelegatedWorkPrompt(p.targetSpecialist, p.profile, p.data, p.synthesizedPrompt)),

  // ---- 단계에 따라 반환 형태가 갈리는 코치 ----
  // 'drafting' 단계만 3안을 구조화해 돌려주고, 나머지 단계는 대화형 텍스트다.
  getCopywritingAssistance: (p: { stage: string; context: Record<string, any> }) => {
    const prompt = P.formatCopywriterPrompt(p.stage as any, p.context);
    return p.stage === 'drafting'
      ? callJson(prompt, 'copywriting_drafts', copywritingSchema)
      : callText(prompt);
  },
};

export type ActionId = keyof typeof actions;
