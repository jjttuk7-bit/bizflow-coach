import React, { useState, useMemo, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, logout } from './lib/supabase';
import { loadProfile, saveProfile } from './services/db';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import { BusinessProfile, BusinessData, Specialist, DashboardMetrics, ConversationMessage, ChartData } from './types';
import {
  parseBusinessProfile,
  parseBusinessData,
  getInitialCoachingAnalysis,
  getMarketingAnalysis,
  getAdvancedInventoryAnalysis,
  getBusinessIdeaAnalysis,
  getFinancialAnalysis,
  getProfitCoachingAnalysis,
  getDirectAnswer,
  getDashboardMetrics,
  getLegalAnalysis,
  getTaxAnalysis,
  getHrCoaching,
  getCompetitionStrategyAnalysis,
  getShortsScriptAnalysis,
  getPricingStrategyAnalysis,
  getDocumentDraft,
  getFollowUpAnswer,
  routeAndDelegate,
  getDelegatedAnswer,
  getSalesAnalysis,
  getMasterCoachAnswer,
  getArchitectAssistance,
  getCSCoaching,
  getECommerceStrategy,
  getSpaceDirectorAnalysis,
  getStartupMentoring,
  getChefMasterCoaching,
  getBeverageMasterCoaching,
  getLocalMarketingAnalysis,
} from './services/coachApi';
import { SpinnerIcon, SparklesIcon, ArchiveBoxIcon, ChartBarIcon, LightBulbIcon, PencilIcon, ChatBubbleLeftRightIcon, ScaleIcon, CalculatorIcon, UserGroupIcon, MapPinIcon, VideoCameraIcon, TagIcon, FingerPrintIcon, ClipboardListIcon, CubeTransparentIcon, UsersIcon, BuildingStorefrontIcon, AcademicCapIcon, ShieldCheckIcon, BeakerIcon } from './components/icons';
import { INITIAL_BUSINESS_DATA, INITIAL_BAKERY_DESCRIPTION } from './constants';

/**
 * 로그인 전에는 랜딩/로그인 화면만 필요하므로 나머지는 지연 로딩한다.
 * 특히 AnalysisResult는 SalesChart를 거쳐 chart.js를 끌고 오는데,
 * 이걸 첫 화면 번들에 넣으면 아무것도 안 보고 나가는 방문자까지 비용을 치른다.
 */
const BusinessProfileSetup = React.lazy(() => import('./components/BusinessProfileSetup'));
const SpecialistGreeting = React.lazy(() => import('./components/SpecialistGreeting'));
const AnalysisResult = React.lazy(() => import('./components/AnalysisResult'));
const InventoryInput = React.lazy(() => import('./components/InventoryInput'));
const DirectChat = React.lazy(() => import('./components/DirectChat'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const CompetitionStrategyInput = React.lazy(() => import('./components/CompetitionStrategyInput'));
const ShortsScriptInput = React.lazy(() => import('./components/ShortsScriptInput'));
const PricingStrategyInput = React.lazy(() => import('./components/PricingStrategyInput'));
const CopywriterCoach = React.lazy(() => import('./components/CopywriterCoach'));
const BrandCoreCoach = React.lazy(() => import('./components/BrandCoreCoach'));
const DocumentCoach = React.lazy(() => import('./components/DocumentCoach'));
const SalesAnalysisInput = React.lazy(() => import('./components/SalesAnalysisInput'));
const MasterCoachChat = React.lazy(() => import('./components/MasterCoachChat'));
const StrategicPlanningCoach = React.lazy(() => import('./components/StrategicPlanningCoach'));
const CSCoachChat = React.lazy(() => import('./components/CSCoachChat'));
const ECommerceCoachInput = React.lazy(() => import('./components/ECommerceCoachInput'));
const SpaceDirectorInput = React.lazy(() => import('./components/SpaceDirectorInput'));
const StartupMentorCoach = React.lazy(() => import('./components/StartupMentorCoach'));
const LocalMarketingInput = React.lazy(() => import('./components/LocalMarketingInput'));

type AppStage = 'landing' | 'login' | 'profile-setup' | 'dashboard' | 'greeting' | 'inventory-input' | 'competition-input' | 'shorts-script-input' | 'pricing-input' | 'copywriter-coach' | 'brand-core-coach' | 'document-coach' | 'analysis' | 'initial-analysis' | 'direct-chat' | 'sales-analysis-input' | 'master-coach-chat' | 'strategic-planning-coach' | 'cs-coach-chat' | 'ecommerce-coach-input' | 'space-director-input' | 'startup-mentor-coach' | 'hr-coach-chat' | 'chef-master-chat' | 'beverage-master-chat' | 'local-marketing-input';

const INITIAL_COACH_SPECIALIST: Specialist = {
    name: '코치 BizFlow',
    role: '초기 종합 진단',
    description: '초기 비즈니스 분석을 제공합니다.',
    category: 'System',
    Icon: SparklesIcon,
    classes: { border: 'border-gray-500', bg: 'bg-gray-100', text: 'text-gray-600', nameText: 'text-gray-600' },
    action: () => {},
    greeting: ''
};


function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [stage, setStage] = useState<AppStage>('landing');
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [businessData, setBusinessData] = useState<BusinessData>(INITIAL_BUSINESS_DATA);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[] | null>(null);
  const [fullDescription, setFullDescription] = useState<string>(INITIAL_BAKERY_DESCRIPTION);
  const [lastAdvancedInventoryData, setLastAdvancedInventoryData] = useState<{ recipes: string; sales: string; currentStock: string; suppliers: string; } | null>(null);
  const [lastAnalysisType, setLastAnalysisType] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);

    useEffect(() => {
    if ((stage === 'cs-coach-chat' || stage === 'hr-coach-chat' || stage === 'chef-master-chat' || stage === 'beverage-master-chat') && selectedSpecialist) {
      setConversation([{ author: selectedSpecialist, text: selectedSpecialist.greeting }]);
    }
  }, [stage, selectedSpecialist]);

  // Supabase 인증 상태 구독. OAuth 리다이렉트 복귀 시에도 여기서 세션을 잡는다.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoadingAuth(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // 로그인한 사용자의 저장된 프로필을 불러온다.
  useEffect(() => {
    if (loadingAuth) return;

    if (!user) {
      setStage('landing');
      return;
    }

    let cancelled = false;

    const loadUserData = async () => {
      try {
        const stored = await loadProfile(user.id);

        if (cancelled) return;

        if (!stored?.businessProfile) {
          setStage('profile-setup');
          return;
        }

        const description = stored.fullDescription || INITIAL_BAKERY_DESCRIPTION;
        setBusinessProfile(stored.businessProfile);
        setFullDescription(description);

        // 저장된 설명으로 상세 데이터와 대시보드 지표를 다시 계산한다.
        const parsedData = await parseBusinessData(description);
        if (cancelled) return;
        setBusinessData(parsedData);

        const metrics = await getDashboardMetrics(stored.businessProfile, parsedData);
        if (cancelled) return;
        setDashboardMetrics(metrics);

        setStage('dashboard');
      } catch (e) {
        if (cancelled) return;
        console.error('[loadUserData]', e);
        setError(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.');
        setStage('profile-setup');
      }
    };

    loadUserData();
    return () => { cancelled = true; };
  }, [user, loadingAuth]);

  const handleProfileSave = async (description: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setConversation([]);
    setFullDescription(description);
    setStage('initial-analysis');
    setLastAnalysisType('initial');

    try {
        const [profile, data] = await Promise.all([
            parseBusinessProfile(description),
            parseBusinessData(description),
        ]);
        setBusinessProfile(profile);
        setBusinessData(data);
        
        const [metrics, result] = await Promise.all([
            getDashboardMetrics(profile, data),
            getInitialCoachingAnalysis(description)
        ]);
        setDashboardMetrics(metrics);
        setAnalysisResult(result);
        setConversation([{ author: INITIAL_COACH_SPECIALIST, text: result }]);

        // Supabase에 저장. 저장 실패가 분석 결과 표시를 막지 않도록 분리해서 처리한다.
        if (user) {
          try {
            await saveProfile(user.id, user.email ?? null, profile, description);
          } catch (saveErr) {
            console.error('[handleProfileSave]', saveErr);
            setError('분석은 완료했지만 프로필 저장에 실패했습니다. 다시 저장해주세요.');
          }
        }

    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        setStage('profile-setup');
    } finally {
        setIsLoading(false);
    }
  };

  const handleProfitGoalSubmit = async (goal: string) => {
    if (!businessProfile || !businessData || !goal || !selectedSpecialist) return;
    setIsLoading(true);
    setError(null);
    try {
        const result = await getProfitCoachingAnalysis(businessProfile, businessData, goal);
        const newAiMessage: ConversationMessage = { author: selectedSpecialist, text: `### 월 순수익 목표(${goal}) 달성 플랜\n\n${result}` };
        setConversation(prev => [...prev, newAiMessage]);
        setAnalysisResult(prev => prev ? `${prev}\n\n---\n\n${result}` : result);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred during profit coaching analysis.');
    } finally {
        setIsLoading(false);
    }
  };

    const handleDirectQuery = async (question: string) => {
        if (!businessProfile || !businessData || !question.trim()) return;
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null); // This is for the DirectChat component's result prop
        try {
            const result = await getDirectAnswer(businessProfile, businessData, question);
            setAnalysisResult(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFollowUpQuery = async (question: string, currentSpecialist: Specialist) => {
        if (!businessProfile || !businessData || !analysisResult) return;
    
        const userMessage: ConversationMessage = { author: 'user', text: question };
        
        // Use functional updates to prevent race conditions.
        // First, add the user's message for immediate UI feedback.
        setConversation(prevConversation => [...prevConversation, userMessage]);
        setIsFollowUpLoading(true);
        setError(null);
    
        try {
            // Construct the complete conversation history for the API call *after* the state has been updated.
            const conversationForApi = [...conversation, userMessage];

            const delegationResult = await routeAndDelegate(
                businessProfile,
                businessData,
                conversationForApi,
                currentSpecialist,
                specialists,
                question
            );
    
            const aiResponses: ConversationMessage[] = [];
    
            if (delegationResult.isDelegation) {
                // This is a delegation flow
                if (delegationResult.messageForUser) {
                    aiResponses.push({ author: currentSpecialist, text: delegationResult.messageForUser });
                }
    
                const targetSpecialist = specialists.find(s => s.name === delegationResult.targetSpecialistName);
    
                if (targetSpecialist) {
                    // Delegation target is valid, proceed.
                    aiResponses.push({ author: 'system', text: `[${currentSpecialist.name}이(가) ${targetSpecialist.name}에게 업무를 요청합니다...]` });
                    const finalAnswer = await getDelegatedAnswer(targetSpecialist, businessProfile, businessData, delegationResult.synthesizedPromptForTarget);
                    aiResponses.push({ author: targetSpecialist, text: finalAnswer });
                } else {
                    // Delegation was intended, but the target specialist is invalid or not found.
                    const clarificationMsg = `죄송합니다, 어떤 전문가에게 요청할지 명확하지 않네요. 다시 한번 요청해주시겠어요?`;
                    aiResponses.push({ author: currentSpecialist, text: clarificationMsg });
                }
            } else {
                // This is a regular follow-up question
                const finalAnswer = await getFollowUpAnswer(
                    currentSpecialist,
                    businessProfile,
                    businessData,
                    analysisResult,
                    conversationForApi
                );
                aiResponses.push({ author: currentSpecialist, text: finalAnswer });
            }
    
            // Append all new AI/system responses in one go.
            setConversation(prevConversation => [...prevConversation, ...aiResponses]);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
            const errorAuthor = currentSpecialist || INITIAL_COACH_SPECIALIST;
            const errorMessage: ConversationMessage = { author: errorAuthor, text: `죄송합니다. 오류가 발생했습니다: ${errorMsg}` };
            setConversation(prevConversation => [...prevConversation, errorMessage]);
            setError(errorMsg);
        } finally {
            setIsFollowUpLoading(false);
        }
    };
    
    const handleSpecialistChatQuery = async (question: string, currentSpecialist: Specialist) => {
        if (!businessProfile || !businessData) return;

        const userMessage: ConversationMessage = { author: 'user', text: question };
        setConversation(prev => [...prev, userMessage]);
        setIsFollowUpLoading(true);
        setError(null);

        try {
            const conversationForApi = [...conversation, userMessage];

            const delegationResult = await routeAndDelegate(
                businessProfile,
                businessData,
                conversationForApi,
                currentSpecialist,
                specialists,
                question
            );
            
            const aiResponses: ConversationMessage[] = [];
    
            if (delegationResult.isDelegation) {
                if (delegationResult.messageForUser) {
                    aiResponses.push({ author: currentSpecialist, text: delegationResult.messageForUser });
                }
    
                const targetSpecialist = specialists.find(s => s.name === delegationResult.targetSpecialistName);
    
                if (targetSpecialist) {
                    aiResponses.push({ author: 'system', text: `[${currentSpecialist.name}이(가) ${targetSpecialist.name}에게 업무를 요청합니다...]` });
                    const finalAnswer = await getDelegatedAnswer(targetSpecialist, businessProfile, businessData, delegationResult.synthesizedPromptForTarget);
                    aiResponses.push({ author: targetSpecialist, text: finalAnswer });
                } else {
                    const clarificationMsg = `죄송합니다, 어떤 전문가에게 요청할지 명확하지 않네요. 다시 한번 요청해주시겠어요?`;
                    aiResponses.push({ author: currentSpecialist, text: clarificationMsg });
                }
            } else {
                 const formatHistory = (conv: ConversationMessage[]) => conv.map(m => {
                    const author = typeof m.author === 'string' ? m.author : m.author.name;
                    return `${author === 'user' ? '사장님' : author}: ${m.text}`;
                }).join('\n\n');

                let finalAnswer = '';
                const historyString = formatHistory(conversationForApi);

                switch (currentSpecialist.name) {
                    case 'CS 코치 클레어':
                        finalAnswer = await getCSCoaching(businessProfile, businessData, historyString);
                        break;
                    case '인사 코치 헤일리':
                        finalAnswer = await getHrCoaching(businessProfile, businessData, historyString);
                        break;
                    case '셰프 마스터 준':
                        finalAnswer = await getChefMasterCoaching(businessProfile, businessData, historyString);
                        break;
                    case '음료 마스터 린':
                        finalAnswer = await getBeverageMasterCoaching(businessProfile, businessData, historyString);
                        break;
                    case '마스터 코치 소피아':
                        finalAnswer = await getMasterCoachAnswer(businessProfile, businessData, historyString);
                        break;
                    default:
                        finalAnswer = "죄송합니다, 이 질문에 대한 답변을 생성할 수 없습니다. 다른 전문가에게 물어봐주시겠어요?";
                }
                aiResponses.push({ author: currentSpecialist, text: finalAnswer });
            }
    
            setConversation(prev => [...prev, ...aiResponses]);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
            const errorMessage: ConversationMessage = { author: currentSpecialist, text: `죄송합니다. 오류가 발생했습니다: ${errorMsg}` };
            setConversation(prev => [...prev, errorMessage]);
            setError(errorMsg);
        } finally {
            setIsFollowUpLoading(false);
        }
    };

  const specialists: Specialist[] = useMemo(() => [
     {
      name: '창업 멘토 이든',
      role: 'F&B 창업 멘토',
      description: '예비 창업가를 위한 F&B 특화 핵심 컨설팅을 제공하여 성공적인 창업을 돕습니다.',
      category: '성장 & 전략',
      Icon: AcademicCapIcon,
      classes: { border: 'border-amber-500', bg: 'bg-amber-100', text: 'text-amber-600', nameText: 'text-amber-600' },
      action: () => setStage('startup-mentor-coach'),
      greeting: "F&B 창업, 꿈과 현실 사이에서 고민이 많으시죠? 복잡한 첫 걸음을 뗄 수 있도록, 데이터와 전문가의 경험을 바탕으로 만든 10가지 핵심 성공 공식을 알려드릴게요. 저와 함께 성공적인 창업의 문을 열어보시죠!"
    },
    {
      name: '셰프 마스터 준',
      role: 'F&B 메뉴 개발 컨설턴트',
      description: '기존 메뉴의 맛을 개선하고, 트렌드를 반영한 신메뉴 개발을 도와 가게의 시그니처를 만듭니다.',
      category: '성장 & 전략',
      Icon: AcademicCapIcon,
      classes: { border: 'border-rose-500', bg: 'bg-rose-100', text: 'text-rose-600', nameText: 'text-rose-600' },
      action: () => setStage('chef-master-chat'),
      greeting: "사장님, 맛있는 메뉴 하나가 가게의 운명을 바꿀 수 있습니다. 기존 메뉴의 작은 아쉬움부터, 세상을 놀라게 할 새로운 시그니처 메뉴 개발까지. 사장님의 주방에 창의적인 영감을 더해드릴 셰프 마스터, 준입니다. 어떤 메뉴에 대한 고민이 있으신가요?"
    },
    {
        name: '음료 마스터 린',
        role: '음료 & 디저트 페어링 마스터',
        description: '음료는 물론, 음료와 완벽한 조화를 이루는 디저트 메뉴까지 개발하여 가게의 품격을 한 단계 높여드립니다.',
        category: '성장 & 전략',
        Icon: BeakerIcon,
        classes: { border: 'border-fuchsia-500', bg: 'bg-fuchsia-100', text: 'text-fuchsia-600', nameText: 'text-fuchsia-600' },
        action: () => setStage('beverage-master-chat'),
        greeting: "안녕하세요, 사장님. 좋은 음료와 디저트는 고객에게 잊지 못할 경험을 선사하죠. 사장님 가게만의 특별한 음료와, 그 풍미를 극대화할 디저트 페어링까지. 저, 린과 함께라면 완벽한 메뉴를 완성할 수 있습니다. 어떤 고민이 있으신가요?"
    },
     {
      name: '마스터 코치 소피아',
      role: '만능 해결사 & 심리 상담가',
      description: '사업 전략, 고객 스트레스, 운영 문제 등 사장님의 모든 고민을 듣고, 일반적인 답변을 넘어선 깊이 있는 통찰과 해결책을 드려요.',
      category: '성장 & 전략',
      Icon: ChatBubbleLeftRightIcon,
      classes: { border: 'border-indigo-500', bg: 'bg-indigo-100', text: 'text-indigo-600', nameText: 'text-indigo-600' },
      action: () => setStage('master-coach-chat'),
      greeting: "사장님, 비즈니스를 운영하시다 보면 정말 다양한 고민이 생기죠. 사업 문제부터 손님과의 관계, 때로는 지친 마음까지... 어떤 이야기든 편하게 털어놓아 주세요. 제가 귀 기울여 듣고, 함께 해결의 실마리를 찾아 드릴게요."
    },
    {
      name: '전략 기획 아키텍트',
      role: '사업 기획서 & 제안서 설계',
      description: '아이디어를 실행 가능한 사업 기획서 및 제안서로 구조화하여, 비즈니스 확장을 돕습니다.',
      category: '성장 & 전략',
      Icon: CubeTransparentIcon,
      classes: { border: 'border-purple-800', bg: 'bg-purple-100', text: 'text-purple-800', nameText: 'text-purple-800' },
      action: () => setStage('strategic-planning-coach'),
      greeting: "사장님, 머릿속의 위대한 아이디어를 세상을 설득할 강력한 문서로 함께 만들어봅시다. 저는 단순한 작성자가 아닌, 사장님의 전략적 파트너입니다. 어떤 아이디어를 기획하고 싶으신가요?"
    },
     {
      name: '컨설턴트 브랜든',
      role: '브랜드 코어 전략가',
      description: "사장님 비즈니스의 '핵심 가치'와 '철학'을 발견하여, 고객이 사랑할 수 밖에 없는 브랜드 경험(로고, 네이밍 등)으로 연결해드려요.",
      category: '성장 & 전략',
      Icon: FingerPrintIcon,
      classes: { border: 'border-gray-800', bg: 'bg-gray-100', text: 'text-gray-800', nameText: 'text-gray-800' },
      action: () => setStage('brand-core-coach'),
      greeting: "사장님, 안녕하세요. 디자인은 그저 결과물일 뿐입니다. 가장 중요한 것은 그 안에 담길 사장님의 '이유(Why)'입니다. 고객이 사랑할 수밖에 없는 브랜드의 심장을 함께 찾아갈 전략적 파트너, 브랜든입니다."
    },
    {
        name: '로컬 마케터 폴',
        role: '지역 기반 홍보 전문가',
        description: '동네 상권에 최적화된 온/오프라인 홍보 전략을 설계하여, 적은 비용으로 단골을 만드는 비법을 알려드려요.',
        category: '성장 & 전략',
        Icon: MapPinIcon,
        classes: { border: 'border-red-500', bg: 'bg-red-100', text: 'text-red-600', nameText: 'text-red-600' },
        action: () => setStage('local-marketing-input'),
        greeting: "사장님, 우리 동네 1등 가게가 되는 비법! 큰 돈 들이지 않고 동네 주민을 단골로 만드는 현실적인 홍보 전략, 저 폴과 함께 시작해볼까요?"
    },
    {
      name: '크리에이터 켈리',
      role: '바이럴 영상 디렉터',
      description: '단 15초 안에 고객의 시선을 사로잡는 유튜브 쇼츠, 인스타 릴스 대본과 영상 콘티를 만들어 드려요.',
      category: '성장 & 전략',
      Icon: VideoCameraIcon,
      classes: { border: 'border-red-500', bg: 'bg-red-100', text: 'text-red-600', nameText: 'text-red-600' },
      action: () => setStage('shorts-script-input'),
      greeting: "사장님, 요즘 대세는 '숏폼'이죠! 사장님 제품을 주인공으로 만드는 15초의 마법, 저 켈리와 함께라면 어렵지 않아요. 바로 시작해볼까요?"
    },
    {
      name: '전략가 데이빗',
      role: '로컬 경쟁 전략가',
      description: 'SWOT 분석을 통해 경쟁사의 약점을 파고들어 시장의 빈틈을 찾아내고, 우리 가게만의 데이터 기반 승리 공식을 설계해 드려요.',
      category: '성장 & 전략',
      Icon: ShieldCheckIcon,
      classes: { border: 'border-orange-500', bg: 'bg-orange-100', text: 'text-orange-600', nameText: 'text-orange-600' },
      action: () => setStage('competition-input'),
      greeting: "사장님, 비즈니스는 전쟁입니다. 적을 알고 나를 알면 백전백승! SWOT 분석으로 경쟁사의 약점을 파고들어 우리 가게를 상권의 중심으로 만드는 전략, 저 데이빗과 함께 세워보시죠."
    },
    {
      name: '코치 라이언',
      role: '스마트스토어/E-commerce 코치',
      description: '네이버 스마트스토어, 쿠팡 등 온라인 판매 채널을 구축하고, 최소 비용으로 최대 효과를 내는 온라인 광고 및 상세페이지 전략을 알려드려요.',
      category: '성장 & 전략',
      Icon: BuildingStorefrontIcon,
      classes: { border: 'border-lime-500', bg: 'bg-lime-100', text: 'text-lime-600', nameText: 'text-lime-600' },
      action: () => setStage('ecommerce-coach-input'),
      greeting: "사장님, 오프라인 매장을 넘어 온라인으로 비즈니스를 확장할 준비가 되셨나요? 스마트스토어, 저 라이언과 함께라면 어렵지 않습니다. 어떤 상품을 온라인에서 판매하고 싶으신가요?"
    },
    {
      name: '마케터 제인',
      role: '디지털 마케팅 전문가',
      description: '인스타그램, 유튜브 등 SNS 콘텐츠와 이벤트를 결합하여 가게를 알리고 새로운 단골을 만들어요.',
      category: '성장 & 전략',
      Icon: SparklesIcon,
      classes: { border: 'border-pink-500', bg: 'bg-pink-100', text: 'text-pink-600', nameText: 'text-pink-600' },
      action: async () => {
        if (!businessProfile || !businessData) return;
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setConversation([]);
        setStage('analysis');
        setLastAnalysisType('marketing');
        try {
            const result = await getMarketingAnalysis(businessProfile, businessData);
            setAnalysisResult(result);
            setConversation([{ author: selectedSpecialist!, text: result }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
      },
      greeting: "안녕하세요 사장님! 요즘은 인스타그램, 유튜브가 필수인거 아시죠? 사장님 가게의 데이터를 바탕으로, 즉시 실행 가능한 1주일치 통합 마케팅 플랜을 제안해 드릴게요!"
    },
    {
      name: '혁신가 레오',
      role: '비즈니스 아이디어 플래너',
      description: '새로운 메뉴, 서비스, 고객 경험 등 가게를 성장시킬 창의적이고 실용적인 아이디어를 제안해요.',
      category: '성장 & 전략',
      Icon: LightBulbIcon,
      classes: { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600', nameText: 'text-green-600' },
      action: async () => {
        if (!businessProfile || !businessData) return;
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setConversation([]);
        setStage('analysis');
        setLastAnalysisType('idea');
        try {
            const result = await getBusinessIdeaAnalysis(businessProfile, businessData);
            setAnalysisResult(result);
            setConversation([{ author: selectedSpecialist!, text: result }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
      },
      greeting: "사장님, 뭔가 새롭고 재미있는 시도가 필요한 시점인가요? 현재 상황을 바탕으로 우리 가게를 한 단계 성장시킬 반짝이는 아이디어를 함께 찾아봅시다!"
    },
    {
      name: '카피라이터 윤슬',
      role: '가게의 영혼을 담는 카피라이터',
      description: '메뉴 설명, 이벤트 문구 등 가게에 필요한 모든 글에 사장님의 진심과 가게의 영혼을 담아드려요.',
      category: '성장 & 전략',
      Icon: PencilIcon,
      classes: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600', nameText: 'text-purple-600' },
      action: () => setStage('copywriter-coach'),
      greeting: "사장님, 안녕하세요! 가게의 숨은 이야기를 찾아 고객의 마음에 가닿는 언어로 바꾸어 드릴게요. 저와 함께 사장님 가게만의 목소리를 만들어 볼까요?"
    },
     {
      name: '데이터 분석가 앤',
      role: '매출 데이터 분석가',
      description: '일별, 주별, 월별 매출 데이터를 분석하여 어떤 메뉴가 효자 상품인지, 어떤 고객이 우리 가게를 찾는지 알려드려요.',
      category: '운영 & 재무',
      Icon: ChartBarIcon,
      classes: { border: 'border-teal-500', bg: 'bg-teal-100', text: 'text-teal-600', nameText: 'text-teal-600' },
      action: () => setStage('sales-analysis-input'),
      greeting: "사장님, 숫자는 거짓말을 하지 않습니다. 매출 데이터 속에 숨겨진 고객의 마음을 읽어, 더 현명한 비즈니스 결정을 내릴 수 있도록 돕겠습니다."
    },
    {
      name: 'CS 코치 클레어',
      role: '고객 관계 및 단골 관리 전문가',
      description: '악성 리뷰 대응, 단골 만들기, 고객 소통 등 고객 관계(CRM) 전반에 대한 1:1 맞춤 코칭을 제공해요.',
      category: '운영 & 재무',
      Icon: UsersIcon,
      classes: { border: 'border-sky-500', bg: 'bg-sky-100', text: 'text-sky-600', nameText: 'text-sky-600' },
      action: () => {
        setStage('cs-coach-chat');
      },
      greeting: "사장님, 고객의 목소리 속에 성장의 기회가 숨어있습니다. 마음 아픈 리뷰 대응부터, 한 번 온 손님을 평생 단골로 만드는 비법까지. 고객과 관련된 고민이라면 무엇이든 들려주세요. 제가 함께 든든한 해결책을 찾아 드릴게요."
    },
    {
      name: '가격 설계자 필립',
      role: '데이터 기반 가격 전략가',
      description: '비용, 경쟁, 고객 가치를 분석하여 수익을 극대화하는 최적의 가격 전략과 구조를 설계해 드려요.',
      category: '운영 & 재무',
      Icon: TagIcon,
      classes: { border: 'border-cyan-500', bg: 'bg-cyan-100', text: 'text-cyan-600', nameText: 'text-cyan-600' },
      action: () => setStage('pricing-input'),
      greeting: "사장님, 가격은 단순한 숫자가 아니라 가장 강력한 마케팅입니다. 데이터에 기반해 우리 가게의 가치를 제대로 평가받는 가격, 저 필립과 함께 만들어 보시죠."
    },
    {
      name: '매니저 알렉스',
      role: '재고 관리 전문가',
      description: '데이터 기반으로 재고를 분석하고, 재고 부족과 비용 낭비를 막는 스마트 발주 리스트를 만들어요.',
      category: '운영 & 재무',
      Icon: ArchiveBoxIcon,
      classes: { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600', nameText: 'text-blue-600' },
      action: () => setStage('inventory-input'),
      greeting: "사장님, 창고에 잠자고 있는 돈을 깨울 시간입니다. 데이터로 재고를 최적화하고 비용을 절감하는 비법, 저와 함께 시작하시죠!"
    },
    {
      name: '코치 로이',
      role: '수익 관리 코치',
      description: '단순 재무 분석을 넘어, 사장님의 수익 목표 달성을 위한 구체적인 액션 플랜을 함께 만들어요.',
      category: '운영 & 재무',
      Icon: ChartBarIcon,
      classes: { border: 'border-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-600', nameText: 'text-yellow-600' },
      action: async () => {
        if (!businessProfile || !businessData) return;
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setConversation([]);
        setStage('analysis');
        setLastAnalysisType('financial');
        try {
            const result = await getFinancialAnalysis(businessProfile, businessData);
            setAnalysisResult(result);
            setConversation([{ author: selectedSpecialist!, text: result }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
      },
      greeting: "사장님의 지갑을 두둑하게 만들어드릴 수익 관리 코치, 로이입니다! 단순 보고는 이제 그만! 함께 목표를 세우고, 그 목표를 달성할 방법을 찾아봐요."
    },
    {
      name: '절세 전문 코치 김계산',
      role: '절세 전문 코치',
      description: '세금 신고, 비용 처리, 정부 지원금 등 복잡한 세무 회계를 쉽게 풀어내고 절세를 도와드려요.',
      category: '운영 & 재무',
      Icon: CalculatorIcon,
      classes: { border: 'border-slate-500', bg: 'bg-slate-100', text: 'text-slate-600', nameText: 'text-slate-600' },
      action: async () => {
        if (!businessProfile || !businessData) return;
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setConversation([]);
        setStage('analysis');
        setLastAnalysisType('tax');
        try {
            const result = await getTaxAnalysis(businessProfile, businessData);
            setAnalysisResult(result);
            setConversation([{ author: selectedSpecialist!, text: result }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
      },
      greeting: "사장님은 사업에만 집중하세요. 복잡한 세금 문제는 '김계산'에게 맡겨주세요. 숨어있는 1원까지 찾아 아껴드리겠습니다."
    },
    {
      name: '공간 디렉터 노아',
      role: '매장 동선 & VMD 전문가',
      description: 'VMD(Visual Merchandising), 고객 동선 설계, 매대(DP) 구성, 메뉴보드 디자인 등 매장 공간의 가치를 극대화하는 전략을 제안해요.',
      category: '공간 전략 & VMD',
      Icon: CubeTransparentIcon,
      classes: { border: 'border-teal-800', bg: 'bg-teal-100', text: 'text-teal-800', nameText: 'text-teal-800' },
      action: () => setStage('space-director-input'),
      greeting: "사장님, 매장의 공간은 보이지 않는 최고의 영업사원입니다. 고객의 발길을 이끌고, 지갑을 열게 만드는 공간의 마법, 저 노아와 함께 설계해 보시죠."
    },
     {
      name: '계약/노무 코치 솔로몬',
      role: '계약/노무 전문 코치',
      description: '계약서 검토, 노무 분쟁 예방 등 법률 리스크를 관리하고 든든한 방패가 되어 드려요.',
      category: '팀 & 법률',
      Icon: ScaleIcon,
      classes: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600', nameText: 'text-purple-600' },
      action: async () => {
        if (!businessProfile || !businessData) return;
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setConversation([]);
        setStage('analysis');
        setLastAnalysisType('legal');
        try {
            const result = await getLegalAnalysis(businessProfile, businessData);
            setAnalysisResult(result);
            setConversation([{ author: selectedSpecialist!, text: result }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
      },
      greeting: "사장님, 성공적인 비즈니스는 튼튼한 법률적 토대 위에서 시작됩니다. 어려운 법률 문제, 제가 쉽고 명쾌하게 해결해 드릴게요."
    },
    {
      name: '문서 작성 코치 유케이',
      role: 'AI 법률 문서 비서',
      description: '임대차계약서, 근로계약서 등 복잡한 법률 및 계약 문서를 AI와 함께 쉽고 빠르게 작성해요.',
      category: '팀 & 법률',
      Icon: ClipboardListIcon,
      classes: { border: 'border-slate-800', bg: 'bg-slate-100', text: 'text-slate-800', nameText: 'text-slate-800' },
      action: () => setStage('document-coach'),
      greeting: "사장님, 복잡한 계약서 때문에 머리 아프셨죠? 이제 걱정 마세요. 필요한 정보를 알려주시면 AI가 뚝딱! 하고 초안을 만들어 드려요. 저 유케이와 함께라면 문서 작업도 식은 죽 먹기랍니다!"
    },
    {
      name: '인사 코치 헤일리',
      role: '우리 가게 성장 파트너 (HR)',
      description: '채용, 면접, 갈등 관리, 직원 성장 등 인사(HR)와 관련된 모든 문제를 해결하고, 사장님의 가장 든든한 성장 파트너가 되어 드려요.',
      category: '팀 & 법률',
      Icon: UserGroupIcon,
      classes: { border: 'border-teal-500', bg: 'bg-teal-100', text: 'text-teal-600', nameText: 'text-teal-600' },
      action: () => setStage('hr-coach-chat'),
      greeting: "사장님의 가장 큰 자산은 '사람'입니다. 채용부터 직원 성장, 갈등 관리까지... 사람에 대한 모든 고민, 저 헤일리와 함께라면 더 이상 어렵지 않아요. 무엇을 도와드릴까요?"
    },
  ], [businessProfile, businessData, selectedSpecialist]);

  const handleSpecialistSelect = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    setStage('greeting');
  };

  const handleProceedFromGreeting = () => {
    if (selectedSpecialist) {
      selectedSpecialist.action();
    }
  };
  
  const handleAnalyzeInventory = async (data: { recipes: string; sales: string; currentStock: string; suppliers: string; }) => {
    if (!businessProfile || !businessData || !selectedSpecialist) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setConversation([]);
    setStage('analysis');
    setLastAnalysisType('inventory');
    setLastAdvancedInventoryData(data);
    try {
        const result = await getAdvancedInventoryAnalysis(businessProfile, data);
        setAnalysisResult(result);
        setConversation([{ author: selectedSpecialist, text: result }]);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleAnalyzeCompetition = async (data: { ourStore: string, competitorStore: string, areaInfo: string }) => {
    if(!selectedSpecialist) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setConversation([]);
    setStage('analysis');
    setLastAnalysisType('competition');
    try {
        const result = await getCompetitionStrategyAnalysis(data);
        setAnalysisResult(result);
        setConversation([{ author: selectedSpecialist, text: result }]);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleGenerateShortsScript = async (data: { productInfo: string, adTone: '트렌디' | '도발적' | '클래식' }) => {
    if(!selectedSpecialist) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setConversation([]);
    setStage('analysis');
    setLastAnalysisType('shorts-script');
    try {
        const result = await getShortsScriptAnalysis(data);
        setAnalysisResult(result);
        setConversation([{ author: selectedSpecialist, text: result }]);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
    } finally {
        setIsLoading(false);
    }
};

 const handleAnalyzePricing = async (data: { objective: string, cost: string, competition: string, customer: string }) => {
    if(!selectedSpecialist) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setConversation([]);
    setStage('analysis');
    setLastAnalysisType('pricing');
    try {
        const result = await getPricingStrategyAnalysis(data);
        setAnalysisResult(result);
        setConversation([{ author: selectedSpecialist, text: result }]);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleAnalyzeSales = async (salesData: string) => {
    if (!selectedSpecialist) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setChartData(null);
    setConversation([]);
    setStage('analysis');
    setLastAnalysisType('sales');
    try {
        const result = await getSalesAnalysis(salesData);
        setAnalysisResult(result);
        setConversation([{ author: selectedSpecialist, text: result }]);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleAnalyzeECommerce = async (data: { productInfo: string }) => {
    if (!selectedSpecialist) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setConversation([]);
    setStage('analysis');
    setLastAnalysisType('ecommerce');
    try {
        const result = await getECommerceStrategy(data);
        setAnalysisResult(result);
        setConversation([{ author: selectedSpecialist, text: result }]);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleAnalyzeSpace = async (data: { storeSize: string; storeLayout: string; goals: string; }) => {
    if (!selectedSpecialist) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setConversation([]);
    setStage('analysis');
    setLastAnalysisType('space-director');
    try {
        const result = await getSpaceDirectorAnalysis(data);
        setAnalysisResult(result);
        setConversation([{ author: selectedSpecialist, text: result }]);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleAnalyzeLocalMarketing = async (data: { targetArea: string, targetCustomer: string, goal: string, budget: string }) => {
    if (!businessProfile || !selectedSpecialist) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setConversation([]);
    setStage('analysis');
    setLastAnalysisType('local-marketing');
    try {
        const result = await getLocalMarketingAnalysis(businessProfile, data);
        setAnalysisResult(result);
        setConversation([{ author: selectedSpecialist, text: result }]);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
    } finally {
        setIsLoading(false);
    }
  };


  const resetToDashboard = () => {
    setAnalysisResult(null);
    setError(null);
    setSelectedSpecialist(null);
    setLastAnalysisType(null);
    setConversation([]);
    setChartData(null);
    setStage('dashboard');
  }

  const renderContent = () => {
    if (isLoading && (stage === 'profile-setup' || (stage === 'initial-analysis' && !analysisResult))) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <SpinnerIcon className="w-16 h-16 animate-spin text-indigo-600" />
          <p className="mt-4 text-lg text-gray-700">AI가 열심히 작업 중입니다...</p>
        </div>
      );
    }

    switch (stage) {
      case 'landing':
        return <LandingPage onStart={() => setStage('login')} />;
      case 'login':
        return <LoginPage onBack={() => setStage('landing')} />;
      case 'profile-setup':
        return <BusinessProfileSetup onSave={handleProfileSave} initialDescription={fullDescription} />;
      case 'dashboard':
        return (
          <div className="relative">
            <button 
              onClick={logout}
              className="fixed top-4 right-4 z-50 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-slate-600 text-sm font-medium hover:bg-white hover:text-red-600 transition-all shadow-sm"
            >
              로그아웃
            </button>
            <Dashboard 
                businessProfile={businessProfile}
                dashboardMetrics={dashboardMetrics}
                specialists={specialists}
                onSelectSpecialist={handleSpecialistSelect}
                onEditProfile={() => setStage('profile-setup')}
                onDirectChat={() => { setAnalysisResult(null); setStage('direct-chat'); }}
            />
          </div>
        );
    case 'greeting':
        return selectedSpecialist && <SpecialistGreeting specialist={selectedSpecialist} onProceed={handleProceedFromGreeting} onBack={resetToDashboard} />;
    case 'inventory-input':
        return selectedSpecialist && <InventoryInput specialist={selectedSpecialist} onAnalyze={handleAnalyzeInventory} onBack={resetToDashboard} isLoading={isLoading} initialData={lastAdvancedInventoryData} />;
    case 'competition-input':
        return selectedSpecialist && <CompetitionStrategyInput specialist={selectedSpecialist} onAnalyze={handleAnalyzeCompetition} onBack={resetToDashboard} isLoading={isLoading} />;
    case 'shorts-script-input':
        return selectedSpecialist && <ShortsScriptInput specialist={selectedSpecialist} onAnalyze={handleGenerateShortsScript} onBack={resetToDashboard} isLoading={isLoading} />;
    case 'pricing-input':
        return selectedSpecialist && <PricingStrategyInput specialist={selectedSpecialist} onAnalyze={handleAnalyzePricing} onBack={resetToDashboard} isLoading={isLoading} />;
    case 'sales-analysis-input':
        return selectedSpecialist && <SalesAnalysisInput specialist={selectedSpecialist} onAnalyze={handleAnalyzeSales} onBack={resetToDashboard} isLoading={isLoading} />;
    case 'ecommerce-coach-input':
        return selectedSpecialist && <ECommerceCoachInput specialist={selectedSpecialist} onAnalyze={handleAnalyzeECommerce} onBack={resetToDashboard} isLoading={isLoading} />;
    case 'space-director-input':
        return selectedSpecialist && <SpaceDirectorInput specialist={selectedSpecialist} onAnalyze={handleAnalyzeSpace} onBack={resetToDashboard} isLoading={isLoading} />;
    case 'local-marketing-input':
        return selectedSpecialist && businessProfile && <LocalMarketingInput specialist={selectedSpecialist} onAnalyze={handleAnalyzeLocalMarketing} onBack={resetToDashboard} isLoading={isLoading} />;
    case 'startup-mentor-coach':
        return selectedSpecialist && <StartupMentorCoach specialist={selectedSpecialist} onBack={resetToDashboard} specialists={specialists} />;
    case 'copywriter-coach':
        return selectedSpecialist && <CopywriterCoach specialist={selectedSpecialist} onBack={resetToDashboard} businessProfile={businessProfile} />;
    case 'brand-core-coach':
        return selectedSpecialist && <BrandCoreCoach specialist={selectedSpecialist} onBack={resetToDashboard} businessProfile={businessProfile} />;
    case 'document-coach':
        return selectedSpecialist && <DocumentCoach specialist={selectedSpecialist} onBack={resetToDashboard} />;
    case 'strategic-planning-coach':
        return selectedSpecialist && <StrategicPlanningCoach specialist={selectedSpecialist} onBack={resetToDashboard} businessProfile={businessProfile} />;
    case 'master-coach-chat':
        return selectedSpecialist && businessProfile && businessData && <MasterCoachChat specialist={selectedSpecialist} onBack={resetToDashboard} businessProfile={businessProfile} businessData={businessData} />;
    case 'cs-coach-chat':
        return selectedSpecialist && 
            <CSCoachChat 
                specialist={selectedSpecialist} 
                onBack={resetToDashboard} 
                conversation={conversation}
                isLoading={isFollowUpLoading}
                onQuery={(query) => handleSpecialistChatQuery(query, selectedSpecialist)}
                placeholder="단골 만들기, 리뷰 대응 등 무엇이든 물어보세요..."
             />;
    case 'hr-coach-chat':
        return selectedSpecialist && 
            <CSCoachChat 
                specialist={selectedSpecialist} 
                onBack={resetToDashboard} 
                conversation={conversation}
                isLoading={isFollowUpLoading}
                onQuery={(query) => handleSpecialistChatQuery(query, selectedSpecialist)}
                placeholder="채용, 면접, 갈등 관리 등 인사 관련 질문을 해주세요..."
             />;
    case 'chef-master-chat':
        return selectedSpecialist && 
            <CSCoachChat 
                specialist={selectedSpecialist} 
                onBack={resetToDashboard} 
                conversation={conversation}
                isLoading={isFollowUpLoading}
                onQuery={(query) => handleSpecialistChatQuery(query, selectedSpecialist)}
                placeholder="레시피, 소스, 신메뉴 개발 등 무엇이든 물어보세요..."
             />;
    case 'beverage-master-chat':
        return selectedSpecialist && 
            <CSCoachChat 
                specialist={selectedSpecialist} 
                onBack={resetToDashboard} 
                conversation={conversation}
                isLoading={isFollowUpLoading}
                onQuery={(query) => handleSpecialistChatQuery(query, selectedSpecialist)}
                placeholder="커피, 논커피, 디저트 개발 등 무엇이든 물어보세요..."
             />;
    case 'analysis':
        return selectedSpecialist && <AnalysisResult 
          specialist={selectedSpecialist} 
          result={analysisResult} 
          isLoading={isLoading} 
          error={error} 
          onBack={resetToDashboard} 
          showProfitGoalInput={lastAnalysisType === 'financial'}
          onProfitGoalSubmit={handleProfitGoalSubmit}
          charts={chartData}
          conversation={conversation}
          onFollowUpQuery={(q) => handleFollowUpQuery(q, selectedSpecialist)}
          isFollowUpLoading={isFollowUpLoading}
        />;
    case 'initial-analysis':
        return <AnalysisResult 
            specialist={INITIAL_COACH_SPECIALIST} 
            result={analysisResult} 
            isLoading={isLoading} 
            error={error} 
            onBack={resetToDashboard} 
            continueButtonText="컨설팅 대시보드로 이동"
            conversation={conversation}
            onFollowUpQuery={(q) => handleFollowUpQuery(q, INITIAL_COACH_SPECIALIST)}
            isFollowUpLoading={isFollowUpLoading}
        />;
    case 'direct-chat':
        return <DirectChat 
                profile={businessProfile} 
                onQuery={handleDirectQuery} 
                onBack={resetToDashboard} 
                isLoading={isLoading} 
                error={error} 
                result={analysisResult} 
               />

      default:
        return <BusinessProfileSetup onSave={handleProfileSave} initialDescription={fullDescription} />;
    }
  };

  const containerClasses = (stage === 'dashboard' || stage === 'landing')
    ? "min-h-screen bg-slate-50"
    : "min-h-screen bg-slate-50 flex items-center justify-center p-4";

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <SpinnerIcon className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* 지연 로딩된 화면이 도착할 때까지의 폴백. 이미 쓰던 로딩 표현을 그대로 재사용한다. */}
      <React.Suspense
        fallback={
          <div className="flex flex-col items-center justify-center h-screen">
            <SpinnerIcon className="w-16 h-16 animate-spin text-indigo-600" />
          </div>
        }
      >
        {renderContent()}
      </React.Suspense>
    </div>
  );
}

export default App;