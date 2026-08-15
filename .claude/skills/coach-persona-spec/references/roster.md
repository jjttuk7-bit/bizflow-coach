# 기존 코치 로스터 (23명 + 시스템 코치 1명)

> 이 파일은 `App.tsx`의 `specialists` 배열에서 추출한 스냅샷이다. 코치를 추가·수정한 뒤에는 이 파일도 함께 갱신한다. 갱신하지 않으면 다음 세션의 중복 검사가 잘못된 전제로 실행된다.

## 목차

1. [전체 로스터](#전체-로스터)
2. [카테고리별 분포](#카테고리별-분포)
3. [아이콘 점유 현황](#아이콘-점유-현황)
4. [색상 점유 현황](#색상-점유-현황)
5. [아키타입별 분류](#아키타입별-분류)
6. [greeting 샘플](#greeting-샘플)

---

## 전체 로스터

| # | 이름 | 역할 | 카테고리 | Icon | 색상 |
|---|---|---|---|---|---|
| 0 | 코치 BizFlow | 초기 종합 진단 | System | SparklesIcon | gray-500 |
| 1 | 창업 멘토 이든 | F&B 창업 멘토 | 성장 & 전략 | AcademicCapIcon | amber-500 |
| 2 | 셰프 마스터 준 | F&B 메뉴 개발 컨설턴트 | 성장 & 전략 | AcademicCapIcon | rose-500 |
| 3 | 음료 마스터 린 | 음료 & 디저트 페어링 마스터 | 성장 & 전략 | BeakerIcon | fuchsia-500 |
| 4 | 마스터 코치 소피아 | 만능 해결사 & 심리 상담가 | 성장 & 전략 | ChatBubbleLeftRightIcon | indigo-500 |
| 5 | 전략 기획 아키텍트 | 사업 기획서 & 제안서 설계 | 성장 & 전략 | CubeTransparentIcon | purple-800 |
| 6 | 컨설턴트 브랜든 | 브랜드 코어 전략가 | 성장 & 전략 | FingerPrintIcon | gray-800 |
| 7 | 로컬 마케터 폴 | 지역 기반 홍보 전문가 | 성장 & 전략 | MapPinIcon | red-500 |
| 8 | 크리에이터 켈리 | 바이럴 영상 디렉터 | 성장 & 전략 | VideoCameraIcon | red-500 |
| 9 | 전략가 데이빗 | 로컬 경쟁 전략가 | 성장 & 전략 | ShieldCheckIcon | orange-500 |
| 10 | 코치 라이언 | 스마트스토어/E-commerce 코치 | 성장 & 전략 | BuildingStorefrontIcon | lime-500 |
| 11 | 마케터 제인 | 디지털 마케팅 전문가 | 성장 & 전략 | SparklesIcon | pink-500 |
| 12 | 혁신가 레오 | 비즈니스 아이디어 플래너 | 성장 & 전략 | LightBulbIcon | green-500 |
| 13 | 카피라이터 윤슬 | 가게의 영혼을 담는 카피라이터 | 성장 & 전략 | PencilIcon | purple-500 |
| 14 | 데이터 분석가 앤 | 매출 데이터 분석가 | 운영 & 재무 | ChartBarIcon | teal-500 |
| 15 | CS 코치 클레어 | 고객 관계 및 단골 관리 전문가 | 운영 & 재무 | UsersIcon | sky-500 |
| 16 | 가격 설계자 필립 | 데이터 기반 가격 전략가 | 운영 & 재무 | TagIcon | cyan-500 |
| 17 | 매니저 알렉스 | 재고 관리 전문가 | 운영 & 재무 | ArchiveBoxIcon | blue-500 |
| 18 | 코치 로이 | 수익 관리 코치 | 운영 & 재무 | ChartBarIcon | yellow-500 |
| 19 | 절세 전문 코치 김계산 | 절세 전문 코치 | 운영 & 재무 | CalculatorIcon | slate-500 |
| 20 | 공간 디렉터 노아 | 매장 동선 & VMD 전문가 | 공간 전략 & VMD | CubeTransparentIcon | teal-800 |
| 21 | 계약/노무 코치 솔로몬 | 계약/노무 전문 코치 | 팀 & 법률 | ScaleIcon | purple-500 |
| 22 | 문서 작성 코치 유케이 | AI 법률 문서 비서 | 팀 & 법률 | ClipboardListIcon | slate-800 |
| 23 | 인사 코치 헤일리 | 우리 가게 성장 파트너 (HR) | 팀 & 법률 | UserGroupIcon | teal-500 |

> `코치 BizFlow`(#0)는 `specialists` 배열이 아니라 `INITIAL_COACH_SPECIALIST` 상수로 별도 정의되어 있다 (App.tsx:65). 대시보드에 노출되지 않으며 초기 진단 전용이다.

## 카테고리별 분포

| 카테고리 | 인원 | 포화도 |
|---|---|---|
| 성장 & 전략 | 13 | **포화** — 신규 추가 시 중복 검사를 특히 엄격히 |
| 운영 & 재무 | 6 | 여유 |
| 팀 & 법률 | 3 | 여유 |
| 공간 전략 & VMD | 1 | 여유 |
| System | 1 | 확장하지 않음 |

## 아이콘 점유 현황

**중복 사용 중 (같은 아이콘을 2명이 공유):**
- `AcademicCapIcon` — 창업 멘토 이든, 셰프 마스터 준
- `SparklesIcon` — 코치 BizFlow, 마케터 제인
- `ChartBarIcon` — 데이터 분석가 앤, 코치 로이
- `CubeTransparentIcon` — 전략 기획 아키텍트, 공간 디렉터 노아

**미사용 (신규 코치에 우선 배정):**
- `CurrencyWonIcon` — 금액·수익 관련 코치에 적합

**UI 전용 (코치에 쓰지 않음):**
`ArrowLeftIcon`, `SpinnerIcon`, `PaperAirplaneIcon`, `ChevronDownIcon`, `ArrowPathIcon`

## 색상 점유 현황

**사용 중:** gray-500, gray-800, amber-500, rose-500, fuchsia-500, indigo-500, purple-500(2명), purple-800, red-500(2명), orange-500, lime-500, pink-500, green-500, teal-500(2명), teal-800, sky-500, cyan-500, blue-500, yellow-500, slate-500, slate-800

**여유 있는 색상:** `emerald`, `violet`, `stone`, `zinc`, `neutral`

## 아키타입별 분류

기존 코치가 어떤 아키타입인지 알면 신규 코치의 복제 원본을 고를 수 있다.

### A. 폼 입력형 (전용 `*Input.tsx` → `AnalysisResult`)
| 코치 | stage | 컴포넌트 | 폼 필드 수 |
|---|---|---|---|
| 매니저 알렉스 | `inventory-input` | `InventoryInput.tsx` | 4 |
| 전략가 데이빗 | `competition-input` | `CompetitionStrategyInput.tsx` | 3 |
| 크리에이터 켈리 | `shorts-script-input` | `ShortsScriptInput.tsx` | 2 |
| 가격 설계자 필립 | `pricing-input` | `PricingStrategyInput.tsx` | 4 |
| 데이터 분석가 앤 | `sales-analysis-input` | `SalesAnalysisInput.tsx` | 1 |
| 코치 라이언 | `ecommerce-coach-input` | `ECommerceCoachInput.tsx` | 1 |
| 공간 디렉터 노아 | `space-director-input` | `SpaceDirectorInput.tsx` | 3 |
| 로컬 마케터 폴 | `local-marketing-input` | `LocalMarketingInput.tsx` | 4 |

### B. 채팅형 (`CSCoachChat` 재사용)
| 코치 | stage | 서비스 함수 |
|---|---|---|
| CS 코치 클레어 | `cs-coach-chat` | `getCSCoaching` |
| 인사 코치 헤일리 | `hr-coach-chat` | `getHrCoaching` |
| 셰프 마스터 준 | `chef-master-chat` | `getChefMasterCoaching` |
| 음료 마스터 린 | `beverage-master-chat` | `getBeverageMasterCoaching` |

> 마스터 코치 소피아는 `getMasterCoachAnswer`로 dispatch switch에 등록되어 있으나, 전용 `MasterCoachChat.tsx` 컴포넌트를 쓰므로 실질적으로 아키타입 D에 가깝다.

### C. 즉시 분석형 (입력 없이 `action` 인라인에서 바로 호출)
| 코치 | 서비스 함수 |
|---|---|
| 마케터 제인 | `getMarketingAnalysis` |
| 혁신가 레오 | `getBusinessIdeaAnalysis` |
| 코치 로이 | `getFinancialAnalysis` |
| 계약/노무 코치 솔로몬 | `getLegalAnalysis` |
| 절세 전문 코치 김계산 | `getTaxAnalysis` |

### D. 자체 완결형 (컴포넌트가 직접 geminiService 호출)
| 코치 | stage | 컴포넌트 |
|---|---|---|
| 카피라이터 윤슬 | `copywriter-coach` | `CopywriterCoach.tsx` |
| 컨설턴트 브랜든 | `brand-core-coach` | `BrandCoreCoach.tsx` |
| 문서 작성 코치 유케이 | `document-coach` | `DocumentCoach.tsx` |
| 전략 기획 아키텍트 | `strategic-planning-coach` | `StrategicPlanningCoach.tsx` |
| 마스터 코치 소피아 | `master-coach-chat` | `MasterCoachChat.tsx` |
| 창업 멘토 이든 | `startup-mentor-coach` | `StartupMentorCoach.tsx` |

## greeting 샘플

톤을 익히기 위한 참고. 공감 → 전문성 → 행동 유도 구조를 확인한다.

**로컬 마케터 폴 (짧은 형)**
> 사장님, 우리 동네 1등 가게가 되는 비법! 큰 돈 들이지 않고 동네 주민을 단골로 만드는 현실적인 홍보 전략, 저 폴과 함께 시작해볼까요?

**컨설턴트 브랜든 (철학 제시형)**
> 사장님, 안녕하세요. 디자인은 그저 결과물일 뿐입니다. 가장 중요한 것은 그 안에 담길 사장님의 '이유(Why)'입니다. 고객이 사랑할 수밖에 없는 브랜드의 심장을 함께 찾아갈 전략적 파트너, 브랜든입니다.

**마스터 코치 소피아 (정서적 공감형)**
> 사장님, 비즈니스를 운영하시다 보면 정말 다양한 고민이 생기죠. 사업 문제부터 손님과의 관계, 때로는 지친 마음까지... 어떤 이야기든 편하게 털어놓아 주세요. 제가 귀 기울여 듣고, 함께 해결의 실마리를 찾아 드릴게요.

**전략가 데이빗 (강한 캐릭터형)**
> 사장님, 비즈니스는 전쟁입니다. 적을 알고 나를 알면 백전백승! SWOT 분석으로 경쟁사의 약점을 파고들어 우리 가게를 상권의 중심으로 만드는 전략, 저 데이빗과 함께 세워보시죠.

공통 요소: "사장님" 호칭 · 존댓말 · 1인칭 자기소개 · 물음표로 끝맺어 행동 유도.
