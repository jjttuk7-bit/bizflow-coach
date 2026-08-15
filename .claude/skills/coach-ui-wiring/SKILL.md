---
name: coach-ui-wiring
description: "BizFlow Coach의 신규 코치를 App.tsx에 배선하는 절차. AppStage 유니온 타입, specialists 배열, 분석 핸들러, renderContent switch case, import 3종, 채팅 greeting useEffect와 handleSpecialistChatQuery dispatch switch까지 아키타입별 배선 지점을 빠짐없이 처리하고, 입력 컴포넌트를 기존 컴포넌트 복제로 작성한다. 코치를 프론트에 연결하거나, '코치를 눌러도 아무 일이 없다'·'채팅이 무응답이다'·'흰 화면이 뜬다' 같은 배선 누락 증상을 고칠 때 반드시 사용할 것. App.tsx나 components/를 편집하는 코치 관련 작업에서 발동한다."
---

# 코치 UI 배선

신규 코치를 [App.tsx](../../../App.tsx)에 연결하는 절차.

App.tsx는 1,047줄 단일 컴포넌트이고 코치 하나가 **최대 7곳**에 흩어져 배선된다. 이 프로젝트에서 가장 흔한 결함은 코드가 틀린 게 아니라 **지점 하나를 빠뜨리는 것**이다. 타입 체크도 빌드도 통과하는데 런타임에 코치가 죽는다.


> **하위 스킬 안내:** 이 스킬은 `bizflow-coach-builder` 오케스트레이터가 담당 에이전트를 통해 호출하는 하위 스킬이다. 사용자가 코치 추가·수정을 요청했는데 오케스트레이터가 아직 실행되지 않았다면, 이 스킬을 단독으로 쓰지 말고 `bizflow-coach-builder`를 먼저 호출하라. 단독 실행하면 다른 경계면이 어긋난 채로 끝난다.

## 배선 지점 지도

| # | 지점 | 위치 | A | B | C | D |
|---|---|---|---|---|---|---|
| 1 | `AppStage` 유니온 타입 | App.tsx:63 | ✅ | ✅ | — | ✅ |
| 2 | `specialists` 배열 | App.tsx:386~ | ✅ | ✅ | ✅ | ✅ |
| 3 | 분석 핸들러 `handleAnalyze*` | App.tsx:717~ | ✅ | — | 인라인 | — |
| 4 | `renderContent()` switch case | App.tsx:882~ | ✅ | ✅ | — | ✅ |
| 5 | import — 서비스 함수 | App.tsx:9~38 | ✅ | ✅ | ✅ | — |
| 6 | import — 컴포넌트 + 아이콘 | App.tsx:39~59 | ✅ | 아이콘만 | 아이콘만 | ✅ |
| 7 | 채팅 useEffect + dispatch switch | App.tsx:96, 335 | — | ✅ | — | — |

**아키타입 C는 stage를 추가하지 않는다.** `action`이 인라인에서 분석을 실행하고 `setStage('analysis')`로 공용 결과 화면에 간다.

**아키타입 B가 배선 지점이 가장 많다(7곳).** 코드량은 가장 적어서 방심하기 쉽다. 지점 7을 빠뜨리면 코치가 "죄송합니다, 이 질문에 대한 답변을 생성할 수 없습니다"만 반복한다.

아키타입별 정확한 코드는 [references/archetype-recipes.md](references/archetype-recipes.md) 참조.

## 절차

### 1. 아키타입 확인

`_workspace/01_persona_spec.md`에서 아키타입과 네이밍 계약을 읽는다. 추측하지 않는다.

### 2. 서비스 시그니처 확보

`_workspace/02_prompt_contract.md`에서 `get*` 함수의 정확한 파라미터를 읽는다. 아직 없으면 `coach-prompt-engineer`에게 SendMessage로 요청한다.

**시그니처를 추측해서 쓰지 않는다.** 인자 순서가 틀려도 둘 다 `string`이면 컴파일은 통과하고 런타임에 엉뚱한 값이 프롬프트에 들어간다.

> **import 경로 주의:** 서비스 함수는 이제 `services/coachApi.ts`에서 온다 (`services/geminiService.ts`는 없다). AI 호출은 전부 `/api/coach` 서버리스 함수를 거치므로, 컴포넌트가 OpenAI SDK를 직접 import하는 일은 절대 없어야 한다 — 그러면 키가 브라우저 번들로 새어 나간다.

### 3. 배선 지점 순서대로 처리

지도의 순서대로 처리한다. 순서가 중요한 이유: 1(타입) → 2(specialist) → 3(핸들러) → 4(render) 순으로 하면 각 단계에서 TypeScript가 다음 단계의 누락을 알려준다. 반대로 하면 에러가 뭉쳐서 나온다.

### 4. 입력 컴포넌트 작성 (A/D만)

**반드시 기존 컴포넌트를 복제해서 시작한다.** 폼 필드 수가 가장 비슷한 것을 고른다:

| 필드 수 | 복제 원본 |
|---|---|
| 1개 | `ECommerceCoachInput.tsx` |
| 2개 | `ShortsScriptInput.tsx` |
| 3개 | `SpaceDirectorInput.tsx` |
| 4개 | `LocalMarketingInput.tsx` |

**아키타입 A 컴포넌트의 표준 props 계약:**
```ts
interface Props {
  specialist: Specialist;
  onAnalyze: (data: {...}) => void;
  onBack: () => void;
  isLoading: boolean;
}
```

이 4개를 지킨다. 새 props를 발명하면 App.tsx의 render case가 기존 패턴에서 벗어난다.


### 5. 폼 필드명을 프롬프트와 맞춘다

컴포넌트의 state 필드명이 프롬프트의 `${data.x}` 바인딩과 **정확히** 일치해야 한다. 어긋나면 프롬프트에 `undefined` 문자열이 들어가고 Gemini는 그걸 정보로 취급한다.

필드 구성이 확정되면 `coach-prompt-engineer`에게 SendMessage로 알린다.

### 6. 배선 검증

체크리스트를 코드에서 직접 재확인한다. "작성했다"는 기억이 아니라 grep으로 확인한다:

```bash
grep -n "{stage-value}\|{ServiceFn}\|{코치 이름}" App.tsx
```

아키타입 B는 결과가 최소 5곳(타입, specialist, render case, useEffect, dispatch switch)에서 나와야 한다.

## 스타일 규약

- **Tailwind만 사용.** 이 프로젝트는 CSS 파일이 없다. `index.html`의 CDN Tailwind로 동작한다
- 버튼·입력창·로딩 스피너는 복제 원본의 클래스를 그대로 쓴다. 새 스타일을 발명하면 앱의 시각적 일관성이 깨진다
- 코치별 색상은 `specialist.classes`에서 꺼내 쓴다. 하드코딩하지 않는다
- 로딩 중에는 `SpinnerIcon`에 `animate-spin`을 적용한다

## 흔한 실수

| 실수 | 증상 |
|---|---|
| 지점 1 누락 (AppStage 타입) | TypeScript 에러 — 그나마 즉시 발견됨 |
| 지점 4 누락 (render case) | 코치를 눌러도 흰 화면 또는 프로필 설정 화면(default)으로 튐 |
| 지점 7 누락 (dispatch switch) | 채팅형 코치가 "답변을 생성할 수 없습니다"만 반복 |
| 지점 7 중 useEffect만 누락 | greeting 없이 빈 채팅창으로 시작 |
| import 누락 | 빌드 에러 또는 런타임 `undefined is not a function` |
| 서비스 시그니처 추측 | 컴파일 통과 + 런타임에 엉뚱한 값 전달 |
| `any`로 타입 에러 우회 | 지금 조용하고 나중에 터진다. 절대 하지 않는다 |
| 폼 필드명 ≠ 프롬프트 변수명 | 프롬프트에 `undefined` 삽입, 답변 품질 붕괴 |
