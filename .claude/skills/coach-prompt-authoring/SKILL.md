---
name: coach-prompt-authoring
description: "BizFlow Coach의 OpenAI 프롬프트를 api/_prompts/templates.ts에 작성·수정하고 api/_lib/registry.ts에 action으로 등록하는 절차. format*Prompt 템플릿의 5부 구조, MarkdownRenderer 아코디언을 만드는 '### ' 헤딩 계약, 지식 베이스 작성법, callText vs callJson 선택과 JSON Schema, collaborationBlock 로스터 갱신을 다룬다. 코치 프롬프트를 새로 쓰거나, AI 답변이 '너무 피상적'·'일반론만 나온다'·'형식이 이상하다'는 피드백으로 프롬프트를 개선할 때 반드시 사용할 것. templates.ts나 registry.ts를 편집하는 모든 작업에서 발동한다."
---

# 코치 프롬프트 작성

[api/_prompts/templates.ts](../../../api/_prompts/templates.ts)에 신규 코치의 프롬프트와 서비스 함수를 추가하거나, 기존 프롬프트를 개선하는 절차.

이 파일은 1,563줄 전부가 프롬프트다. **프롬프트가 곧 제품**이다. 코치의 품질은 지식 베이스의 밀도와 출력 형식 설계에서 나온다.


> **하위 스킬 안내:** 이 스킬은 `bizflow-coach-builder` 오케스트레이터가 담당 에이전트를 통해 호출하는 하위 스킬이다. 사용자가 코치 추가·수정을 요청했는데 오케스트레이터가 아직 실행되지 않았다면, 이 스킬을 단독으로 쓰지 말고 `bizflow-coach-builder`를 먼저 호출하라. 단독 실행하면 다른 경계면이 어긋난 채로 끝난다.

## 건드릴 파일 3개

프롬프트는 **서버에만** 존재한다. OpenAI 키와 프롬프트 본문이 브라우저 번들에 들어가지 않도록 `/api` 뒤로 옮겼기 때문이다. 코치 하나를 추가하려면 세 파일을 모두 손봐야 한다.

| # | 파일 | 할 일 | 빠뜨리면 |
|---|---|---|---|
| 1 | `api/_prompts/templates.ts` | `format{Name}Prompt()` 추가 + `collaborationBlock` 갱신 | 프롬프트 없음 |
| 2 | `api/_lib/registry.ts` | `actions`에 action 등록 | **400 "알 수 없는 action"** — 등록되지 않은 action은 실행 자체가 차단된다 |
| 3 | `services/coachApi.ts` | 같은 이름의 클라이언트 래퍼 export | UI가 호출할 함수가 없음 |

`templates.ts` 내부 구조:

| 영역 | 라인 | 내용 |
|---|---|---|
| import + `formatConversationHistory` | 1~21 | 서버 전용 타입은 `../_lib/types`에서 온다 |
| `collaborationBlock` | 23~ | **모든 코치가 공유하는 협업 대상 로스터** |
| 프롬프트 템플릿 | 이후 전부 | `export function format*Prompt()` |

신규 프롬프트는 파일 끝에 추가한다. 위치를 못 찾겠으면 `grep -n "formatLocalMarketingPrompt" api/_prompts/templates.ts`로 인접 함수를 찾는다.

> `templates.ts`의 함수는 전부 `export`다. `registry.ts`가 `import * as P`로 가져다 쓰므로 `export`를 빠뜨리면 등록 단계에서 타입 에러가 난다.

## 1. 프롬프트 5부 구조

모든 `format*Prompt` 함수는 이 구조를 따른다. 순서를 바꾸지 않는다 — 모델이 역할을 먼저 읽어야 이후 지시를 그 인격으로 해석한다.

````ts
function format{Name}Prompt(profile: BusinessProfile, data: {...}): string {
    return `
# 역할
당신은 '{코치 이름}', {한 줄 정체성}입니다. 당신의 임무는 ... '${profile.name}' 가게만을 위한 ...를 제안하는 것입니다.

# 핵심 원칙
- **{원칙명}:** {이 코치가 무엇을 우선하는가}
- **{원칙명}:** ...

# {도메인} 지식 베이스 (AXIS OS 제공)
---
<1. {소주제}>
- {구체적 수치·표·사례}
<2. {소주제}>
| 항목 | 방법 | 효과 | 비용 |
|---|---|---|---|
---

# 사장님 요청 정보
- **가게 이름:** ${profile.name}
- **{입력 항목}:** ${data.field}

# 출력 형식
{지시문}

### ### {섹션 1 제목}
- ({이 섹션에 무엇을 쓸지 괄호로 지시})

### ### {섹션 2 제목}
- (...)

${collaborationBlock}
`;
}
````

각 부의 작성 규칙은 [references/prompt-anatomy.md](references/prompt-anatomy.md) 참조.

## 2. `### ` 헤딩 계약 — 가장 중요

**[MarkdownRenderer.tsx:111](../../../components/MarkdownRenderer.tsx)은 `### `로 시작하는 줄을 접이식 아코디언 섹션의 제목으로 분리한다.**

```ts
if (line.startsWith('### ')) {
    currentTitle = line.substring(4).trim();
}
```

이 한 줄이 프롬프트와 UI 사이의 전체 계약이다. 결과는 다음과 같이 갈린다:

| 프롬프트가 출력하는 것 | 렌더 결과 |
|---|---|
| `### ` 헤딩 3~5개 | 접이식 아코디언 3~5개 (첫 섹션만 펼침) |
| `### ` 헤딩 없음 | **통짜 텍스트 한 덩어리** — 스크롤 지옥 |
| `####` 헤딩 | 섹션 분리되지 않고 본문에 남음 (의도된 동작) |

**따라서:**
- 최상위 섹션은 반드시 `### `로 시작한다
- 하위 제목은 `####`를 쓴다. 4번째 문자가 `#`이라 `startsWith('### ')`에 걸리지 않아 본문에 남는다
- 섹션은 3~5개. 2개면 아코디언이 무의미하고 6개 이상이면 사장님이 어디부터 볼지 모른다

> **기존 코드의 `### ###` 표기에 대하여**: 기존 프롬프트들은 `### ### '폴'의 맞춤 홍보 전략`처럼 `###`을 두 번 쓴다. `substring(4)` 이후 제목에 `###`가 남으므로 화면에 그대로 보일 수 있다. 신규 프롬프트는 **`### ` 한 번만** 쓰는 것을 권장하되, 실제 Gemini 출력을 확인하기 전까지는 어느 쪽도 확정하지 말고 QA에 "실행 확인 필요"로 넘긴다. 정적 분석만으로는 모델이 이 표기를 어떻게 정규화하는지 알 수 없다.

`collaborationBlock`은 자체적으로 `### ### 다음 스텝 추천`으로 시작하므로 별도 섹션이 된다. 이것을 본문에 넣고 싶으면 `getSalesAnalysis`가 하듯 `.replace()`로 `####`로 낮춘다 (templates.ts:1005).

## 3. 지식 베이스 작성

**지식 베이스 없는 프롬프트를 만들지 않는다.** 이것이 이 앱의 코치와 범용 챗봇을 가르는 유일한 차이다. `# 역할`과 `# 출력 형식`만 있으면 모델은 검색하면 나오는 일반론을 뱉는다.

| 좋은 지식 베이스 | 나쁜 지식 베이스 |
|---|---|
| "동네 가게 고객의 80% 이상이 5km 이내에서 온다" | "지역 타겟팅이 중요하다" |
| 비용 수준까지 담은 전략 비교 표 | 전략 이름 나열 |
| "리뷰 1개당 방문율 10~20% 상승" | "리뷰 관리를 하라" |

**형식:** `---`로 감싸고 `<1. 소주제>` 태그로 구획한다. 표를 적극적으로 쓴다 — 표는 MarkdownRenderer가 실제 `<table>`로 렌더하므로 사장님에게도 그대로 전달된다.

**출처가 불분명한 수치를 지어내지 않는다.** 사장님이 이걸 보고 실제 사업 결정을 한다. 확실한 것만 쓰고, 부족하면 리더에게 리서치를 요청한다.

## 4. action 등록 + 클라이언트 래퍼

프롬프트를 썼으면 **양쪽에 배선**한다. 하나라도 빠지면 코치가 호출되지 않는다.

### 4-1. `api/_lib/registry.ts` — 서버 등록

마크다운 답변(대부분의 경우):

```ts
get{Name}: (p: { profile: BusinessProfile; data: {...} }) =>
  callText(P.format{Name}Prompt(p.profile, p.data)),
```

구조화된 값이 필요할 때만:

```ts
get{Name}: (p: {...}) =>
  callJson(P.format{Name}Prompt(p.data), '{snake_case_이름}', {
    type: 'object',
    properties: { field: { type: 'string', description: '...' } },
    required: ['field'],
    additionalProperties: false,
  }),
```

**Structured Outputs는 strict 모드로 동작한다.** 그래서 스키마에 두 가지 제약이 있다:
- 모든 속성을 `required`에 넣어야 한다 — 선택 필드를 만들려면 `type: ['string', 'null']`로 nullable하게 선언한다
- `additionalProperties: false`가 필수다

전부 문자열 필드라면 `stringSchema(['a','b'])` 헬퍼로 줄일 수 있다.

### 4-2. `services/coachApi.ts` — 클라이언트 래퍼

```ts
export const get{Name} = (profile: BusinessProfile, data: {...}) =>
  callCoach<string>('get{Name}', { profile, data });
```

**action 문자열은 registry의 키와 글자 하나까지 같아야 한다.** 문자열 비교라서 컴파일러가 오타를 잡지 못하고, 런타임에 400 "알 수 없는 action"으로만 드러난다.

`Specialist`나 `ConversationMessage`를 넘겨야 하면 `toInfo()` / `toWire()`로 변환한다. `Specialist`에는 React 컴포넌트(`Icon`)와 함수(`action`)가 들어 있어 그대로 `JSON.stringify`하면 서버에서 사라진다.

### 4-3. JSON을 쓸 자리 판단

**코칭 답변에는 JSON을 쓰지 않는다.** 코칭 결과는 마크다운 문자열이어야 `MarkdownRenderer`가 아코디언·표로 렌더한다. JSON은 파싱(`parseBusinessProfile`), 대시보드 지표(`getDashboardMetrics`), 라우팅(`routeAndDelegate`)처럼 **코드가 소비하는 값**에만 쓴다.

## 5. collaborationBlock 갱신 — 빠뜨리기 쉬움

`collaborationBlock`(templates.ts:23)은 **19명의 코치 목록이 하드코딩된 문자열**이며 13개 프롬프트에 삽입된다. 다른 코치가 "다음 스텝"으로 누구를 추천할지 여기서 고른다.

신규 코치를 추가하면 여기에 한 줄을 넣는다:

```
- **{이름} ({역할}):** {한 줄 설명}
```

**넣지 않으면**: 신규 코치는 어떤 코치로부터도 추천받지 못한다. 프롬프트에 "목록에 없는 이름은 절대로 생성하지 마세요"라고 명시되어 있어 모델이 의도적으로 배제한다. 기능은 정상인데 아무도 도달하지 못하는 코치가 된다.

## 6. 아키타입 B(채팅형) 추가 규칙

채팅형 코치의 프롬프트는 대화 이력을 받는다:

```ts
export const get{Name}Coaching = async (
    profile: BusinessProfile,
    data: BusinessData,
    conversationHistory: string
): Promise<string> => { ... }
```

프롬프트에 `# 이전 대화` 섹션을 넣고 `${conversationHistory}`를 바인딩한다. 채팅 응답은 아코디언보다 대화체가 자연스러우므로 `### ` 섹션을 강제하지 않아도 된다 — 다만 긴 분석을 낼 때는 섹션을 쓴다.

## 흔한 실수

| 실수 | 결과 |
|---|---|
| `## `나 `**굵게**`로 섹션 구분 | 아코디언 없이 통짜 텍스트 |
| collaborationBlock 갱신 누락 | 신규 코치가 어디서도 추천되지 않음 |
| 지식 베이스 없이 역할+출력형식만 작성 | 검색하면 나오는 일반론만 출력 |
| 코칭 답변을 JSON으로 반환 | MarkdownRenderer가 파싱 못 함 |
| 프롬프트의 `${data.x}`와 폼 필드명 불일치 | 프롬프트에 `undefined` 문자열 삽입 |
| 페르소나 이름을 프롬프트에 안 넣음 | 코치 인격이 사라지고 범용 어시스턴트 톤 |
| "고객님" 등 다른 호칭 사용 | 앱 전체 톤 붕괴 (전 코치가 "사장님") |
