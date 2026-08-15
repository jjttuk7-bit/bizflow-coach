# 아키타입별 배선 레시피

App.tsx에 삽입할 정확한 코드. SKILL.md의 보충 레퍼런스.

> 라인 번호는 코치를 추가할 때마다 밀린다. 삽입 위치는 라인 번호가 아니라 **인접 코드 패턴**으로 찾는다. 예: `grep -n "case 'space-director-input':" App.tsx`

## 목차

1. [아키타입 A — 폼 입력형](#아키타입-a--폼-입력형)
2. [아키타입 B — 채팅형](#아키타입-b--채팅형)
3. [아키타입 C — 즉시 분석형](#아키타입-c--즉시-분석형)
4. [아키타입 D — 자체 완결형](#아키타입-d--자체-완결형)
5. [공통 — Specialist 객체](#공통--specialist-객체)

---

## 아키타입 A — 폼 입력형

전용 폼 → 1회 분석 → 공용 `AnalysisResult` 화면. 배선 6곳.

### 1. AppStage 타입 (App.tsx:63)
유니온 끝에 추가:
```ts
| 'local-marketing-input' | '{new-stage}-input';
```

### 2. specialists 배열
```ts
{
  name: '{이름}',
  role: '{역할}',
  description: '{설명}',
  category: '{카테고리}',
  Icon: {Icon},
  classes: { border: 'border-{c}-500', bg: 'bg-{c}-100', text: 'text-{c}-600', nameText: 'text-{c}-600' },
  action: () => setStage('{new-stage}-input'),
  greeting: "{greeting}"
},
```

### 3. 분석 핸들러
기존 `handleAnalyzeSpace` 바로 뒤에 삽입. 이 8줄 시퀀스를 그대로 지킨다 — 순서가 바뀌면 이전 결과가 잠깐 노출되거나 로딩이 안 끝난다.

```ts
const handleAnalyze{Name} = async (data: { field1: string; field2: string; }) => {
  if (!businessProfile || !selectedSpecialist) return;
  setIsLoading(true);
  setError(null);
  setAnalysisResult(null);
  setConversation([]);
  setStage('analysis');
  setLastAnalysisType('{kebab-name}');
  try {
      const result = await get{Name}(businessProfile, data);
      setAnalysisResult(result);
      setConversation([{ author: selectedSpecialist, text: result }]);
  } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
  } finally {
      setIsLoading(false);
  }
};
```

> `businessProfile`을 쓰지 않는 코치라면 가드에서 빼되 `selectedSpecialist` 가드는 반드시 남긴다. 없으면 `setConversation`에서 `author: null`이 들어가고 `formatConversationHistory`가 "[알 수 없는 작성자]"를 출력한다.

> `setConversation([{ author: selectedSpecialist, text: result }])`가 후속 질문(follow-up) 기능의 시작점이다. 빠뜨리면 사장님이 결과에 이어 질문할 수 없다.

### 4. renderContent case
```ts
case '{new-stage}-input':
    return selectedSpecialist && <{Name}Input specialist={selectedSpecialist} onAnalyze={handleAnalyze{Name}} onBack={resetToDashboard} isLoading={isLoading} />;
```

### 5~6. import
```ts
// 서비스 (App.tsx:9~38 블록 안)
get{Name},
// 컴포넌트 (App.tsx:39~59 블록 끝)
import {Name}Input from './components/{Name}Input';
// 아이콘 (App.tsx:39 한 줄 import에 추가)
{Icon},
```

---

## 아키타입 B — 채팅형

`CSCoachChat` 재사용. **배선 7곳으로 가장 많다.** 코드량이 적어 방심하기 쉬우니 체크리스트를 끝까지 소진한다.

### 1. AppStage 타입
```ts
| '{new-stage}-chat';
```

### 2. specialists 배열
`action: () => setStage('{new-stage}-chat'),`

### 3. 핸들러 — 없음
`handleSpecialistChatQuery`를 공유한다.

### 4. renderContent case
```ts
case '{new-stage}-chat':
    return selectedSpecialist &&
        <CSCoachChat
            specialist={selectedSpecialist}
            onBack={resetToDashboard}
            conversation={conversation}
            isLoading={isFollowUpLoading}
            onQuery={(query) => handleSpecialistChatQuery(query, selectedSpecialist)}
            placeholder="{입력창 안내 문구}"
         />;
```

### 5. import — 서비스 함수
```ts
get{Name}Coaching,
```

### 7-a. greeting useEffect (App.tsx:96) — 빠뜨리기 쉬움
stage 목록에 OR 조건을 추가한다:
```ts
useEffect(() => {
  if ((stage === 'cs-coach-chat' || stage === 'hr-coach-chat' || stage === 'chef-master-chat'
       || stage === 'beverage-master-chat' || stage === '{new-stage}-chat') && selectedSpecialist) {
    setConversation([{ author: selectedSpecialist, text: selectedSpecialist.greeting }]);
  }
}, [stage, selectedSpecialist]);
```
**누락 시**: 채팅창이 인사말 없이 비어서 시작한다.

### 7-b. dispatch switch (App.tsx:353) — 가장 치명적
`handleSpecialistChatQuery` 안의 **이름 기반** switch에 case를 추가한다:
```ts
switch (currentSpecialist.name) {
    case 'CS 코치 클레어': ...
    case '{코치 이름}':
        finalAnswer = await get{Name}Coaching(businessProfile, businessData, historyString);
        break;
    default:
        finalAnswer = "죄송합니다, 이 질문에 대한 답변을 생성할 수 없습니다. 다른 전문가에게 물어봐주시겠어요?";
}
```

**누락 시**: 사장님이 무엇을 물어도 default 문구만 반복한다. 컴파일러가 절대 못 잡는다 — 문자열 비교이기 때문이다.

**case의 문자열은 `specialists` 배열의 `name`과 글자 하나까지 일치해야 한다.** 공백, 슬래시(`계약/노무 코치 솔로몬`), 괄호까지 그대로 복사한다.

---

## 아키타입 C — 즉시 분석형

입력 없이 클릭 즉시 분석. stage를 추가하지 않고 공용 `'analysis'`를 쓴다. 배선 5곳.

### 2. specialists 배열 — `action`에 로직을 인라인으로 넣는다
```ts
{
  name: '{이름}',
  // ... 나머지 필드
  action: async () => {
    if (!businessProfile || !businessData) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setConversation([]);
    setStage('analysis');
    setLastAnalysisType('{kebab-name}');
    try {
        const result = await get{Name}(businessProfile, businessData);
        setAnalysisResult(result);
        setConversation([{ author: /* 이 객체 자신 */, text: result }]);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  },
  greeting: "{greeting}"
},
```

> `action` 내부에서 자기 자신(Specialist 객체)을 참조할 수 없다. 기존 코치들은 `selectedSpecialist`를 쓴다 — `handleSpecialistSelect`가 `action` 호출 전에 이미 세팅해두기 때문이다 (App.tsx:706, 693). 따라서 `setConversation([{ author: selectedSpecialist!, text: result }])` 형태로 쓰거나, 기존 코치(마케터 제인)의 구현을 그대로 따른다.

### 1, 4. AppStage 타입 / render case — 추가하지 않음
공용 `'analysis'` stage와 `AnalysisResult` 화면을 그대로 쓴다.

### 5~6. import
서비스 함수와 아이콘만 추가.

---

## 아키타입 D — 자체 완결형

컴포넌트가 직접 coachApi를 호출하고 자체 상태를 관리한다. App.tsx는 stage 분기만 한다. 배선 4곳.

### 1. AppStage 타입
```ts
| '{new-stage}-coach';
```

### 2. specialists 배열
`action: () => setStage('{new-stage}-coach'),`

### 4. renderContent case
```ts
case '{new-stage}-coach':
    return selectedSpecialist && <{Name}Coach specialist={selectedSpecialist} onBack={resetToDashboard} businessProfile={businessProfile} />;
```

### 6. import — 컴포넌트 + 아이콘
서비스 함수는 App.tsx가 아니라 **컴포넌트 안에서** import한다.

### 컴포넌트 작성
`CopywriterCoach.tsx`(214줄) 또는 `StrategicPlanningCoach.tsx`(202줄)를 복제 원본으로 쓴다. 이 컴포넌트들은 자체적으로 `useState`로 로딩·에러·결과를 관리하고 `MarkdownRenderer`로 결과를 렌더한다.

---

## 공통 — Specialist 객체

`types.ts`의 정의 (변경하지 않는다):
```ts
export interface Specialist {
    name: string;
    role: string;
    description: string;
    category: string;
    Icon: React.FC<{ className?: string }>;
    classes: { border: string; bg: string; text: string; nameText: string; };
    action: () => void | Promise<void>;
    greeting: string;
}
```

### 사용자 흐름 (모든 아키타입 공통)
```
Dashboard 카드 클릭
  → handleSpecialistSelect (App.tsx:706)
      setSelectedSpecialist(specialist) + setStage('greeting')
  → SpecialistGreeting 화면 (greeting 전문 노출)
  → "시작하기" 클릭
  → handleProceedFromGreeting (App.tsx:711)
      selectedSpecialist.action() 호출
  → 아키타입별 분기
```

**모든 코치는 greeting 화면을 반드시 거친다.** `action`은 greeting 이후에 호출되므로, `action` 안에서는 `selectedSpecialist`가 이미 세팅되어 있다고 가정해도 안전하다.
