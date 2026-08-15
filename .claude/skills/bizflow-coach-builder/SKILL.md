---
name: bizflow-coach-builder
description: "BizFlow Coach에 AI 전문가 코치 모듈을 end-to-end로 추가·수정하는 오케스트레이터. 페르소나 설계 → OpenAI 프롬프트 작성 → App.tsx 배선 → 통합 정합성 검증까지 4개 전문 에이전트를 조율한다. '코치 추가해줘', '전문가 만들어줘', '{분야} 코치가 필요해', 'specialist 추가' 요청 시 반드시 사용할 것. 후속 작업에도 반드시 사용: 코치 다시 만들어줘, 재실행, 프롬프트만 다시, UI만 수정, 업데이트, 보완, 개선, 이전 결과 기반으로 수정, '그 코치 답변이 별로야', '코치가 동작 안 해', '추천에 안 뜬다', '채팅이 무응답이야'. 단순히 코치 목록을 묻는 질문에는 사용하지 않는다."
---

# BizFlow Coach Builder — 코치 모듈 오케스트레이터

BizFlow Coach에 AI 전문가를 추가하거나 기존 코치를 개선하는 통합 워크플로우.

코치 하나를 추가하려면 **페르소나 · 프롬프트 · 배선 · 검증** 네 영역이 서로 맞물려야 한다. 프롬프트의 출력 형식이 UI 렌더링을 결정하고, 폼 필드명이 프롬프트 변수를 결정한다. 혼자 순서대로 하면 앞에서 정한 계약을 뒤에서 잊는다.

## 실행 모드: 서브 에이전트 (리더 중계형)

**이 환경에는 `TeamCreate`/`TeamDelete`가 없다.** 에이전트 팀 모드는 사용할 수 없다. 대신:

- `Agent` 도구로 이름 있는 백그라운드 서브 에이전트를 띄운다
- 서브 에이전트는 `SendMessage({to: "main"})`로 **리더에게만** 보낸다
- **리더가 에이전트 간 메시지를 중계한다.** 이것이 리더의 핵심 역할이다
- 진행 상황은 `TaskCreate`/`TaskUpdate`/`TaskList`로 공유한다
- 산출물은 `_workspace/` 파일로 주고받는다

리더가 중계를 게을리하면 이 하네스는 순차 파이프라인으로 퇴화한다. **완료 알림을 받으면 즉시 관련 에이전트에게 전달한다.**

## 에이전트 구성

| 에이전트 | subagent_type | 스킬 | 산출물 |
|---|---|---|---|
| persona | `coach-persona-designer` | `coach-persona-spec` | `_workspace/01_persona_spec.md` |
| prompt | `coach-prompt-engineer` | `coach-prompt-authoring` | `_workspace/02_prompt_contract.md` + `templates.ts` |
| ui | `coach-ui-integrator` | `coach-ui-wiring` | `_workspace/03_wiring_report.md` + `App.tsx`, `components/` |
| qa | `coach-integration-qa` | `coach-qa-checklist` | `_workspace/04_qa_report.md` |

모든 `Agent` 호출에 **`model: "opus"`**를 명시한다.

---

## 워크플로우

### Phase 0: 컨텍스트 확인

`_workspace/` 존재 여부로 실행 모드를 결정한다.

| 상황 | 모드 | 행동 |
|---|---|---|
| `_workspace/` 없음 | **초기 실행** | Phase 1로 |
| 있음 + 부분 수정 요청 | **부분 재실행** | 해당 에이전트만 재호출. 기존 산출물 경로를 프롬프트에 포함 |
| 있음 + 새 코치 요청 | **새 실행** | `_workspace/`를 `_workspace_{YYYYMMDD_HHMMSS}/`로 이동 후 Phase 1 |

**부분 재실행 매핑** — 사용자 피드백에서 어느 에이전트를 깨울지 판단한다:

| 피드백 | 재호출 |
|---|---|
| "답변이 피상적이다", "일반론만 나온다" | prompt (지식 베이스 보강) |
| "형식이 이상하다", "한 덩어리로 나온다" | prompt + ui (출력 형식 ↔ 렌더러 경계면) |
| "눌러도 아무 일이 없다", "흰 화면" | ui (배선 누락) |
| "채팅이 무응답이다" | ui (아키타입 B dispatch switch) |
| "추천에 안 뜬다" | prompt (`collaborationBlock` 누락) |
| "이름/설명/색상을 바꿔줘" | persona → 확정 후 prompt + ui 중계 |

부분 재실행에서도 **QA는 항상 마지막에 실행한다.** 수정이 다른 경계면을 깨뜨렸을 수 있다.

### Phase 1: 준비

1. 사용자 요청에서 코치의 전문 분야와 해결할 문제를 파악한다. 불명확하면 이 시점에 질문한다 — 페르소나가 정해진 뒤에 되돌리면 비싸다
2. `_workspace/` 및 `_workspace/00_input/` 생성
3. 요청 내용을 `_workspace/00_input/request.md`에 저장
4. `TaskCreate`로 작업 목록 등록:

```
1. 페르소나 설계 및 중복 검사
2. 아키타입·네이밍 계약 확정
3. 프롬프트 템플릿 작성
4. 서비스 함수 + collaborationBlock 갱신
5. App.tsx 배선
6. 입력 컴포넌트 작성 (아키타입 A/D만)
7. 경계면 교차 검증
8. 로스터 문서 갱신
```

### Phase 2: 페르소나 설계 (단독 실행)

**병렬화하지 않는다.** 하위 두 에이전트가 이 산출물에 전적으로 의존한다.

```
Agent(
  name: "persona",
  subagent_type: "coach-persona-designer",
  model: "opus",
  run_in_background: false,
  prompt: "`_workspace/00_input/request.md`의 요청에 따라 신규 코치 페르소나를 설계하라.
           반드시 Skill 도구로 `coach-persona-spec` 스킬을 호출하여 절차를 따를 것.
           산출물: `_workspace/01_persona_spec.md`
           완료 시 SendMessage({to:'main'})로 아키타입·네이밍 계약·Specialist 객체·출력 섹션 설계를 보고할 것."
)
```

**중복 판정이 "확장 권고"로 오면** 여기서 멈추고 사용자에게 확인한다. 23명은 이미 많고, 새 얼굴 추가는 정당화가 필요한 결정이다.

### Phase 3: 프롬프트 + 배선 (병렬 실행)

페르소나 스펙 확정 즉시 두 에이전트를 **한 메시지에서 동시에** 띄운다.

```
Agent(name: "prompt", subagent_type: "coach-prompt-engineer",
      model: "opus", run_in_background: true,
      prompt: "`_workspace/01_persona_spec.md`를 읽고 프롬프트와 서비스 함수를 작성하라.
               반드시 Skill 도구로 `coach-prompt-authoring` 스킬을 호출할 것.
               서비스 함수 시그니처가 확정되는 즉시 SendMessage({to:'main'})로 먼저 보고하라 —
               ui 에이전트가 이것을 기다리고 있다. 프롬프트 본문 완성을 기다리지 말 것.
               collaborationBlock 갱신을 잊지 말 것.
               산출물: `_workspace/02_prompt_contract.md`")

Agent(name: "ui", subagent_type: "coach-ui-integrator",
      model: "opus", run_in_background: true,
      prompt: "`_workspace/01_persona_spec.md`를 읽고 App.tsx 배선과 컴포넌트를 작성하라.
               반드시 Skill 도구로 `coach-ui-wiring` 스킬을 호출할 것.
               서비스 함수 시그니처는 리더가 전달할 때까지 추측하지 말고 대기하라.
               그 사이 컴포넌트 작성과 배선 지점 1·2·4를 먼저 진행할 것.
               산출물: `_workspace/03_wiring_report.md`")
```

**리더의 중계 의무 (이 Phase의 핵심):**

| 받은 메시지 | 즉시 할 일 |
|---|---|
| prompt → "시그니처 확정" | ui에게 SendMessage로 시그니처 전달 |
| ui → "폼 필드 확정" | prompt에게 SendMessage로 필드명 전달 |
| 둘 중 하나 → "완료" | qa 에이전트를 띄워 해당 경계면부터 검증 시작 |

### Phase 4: 점진적 검증

**전체 완성을 기다리지 않는다.** 첫 완료 알림이 오면 즉시 QA를 띄운다.

```
Agent(name: "qa", subagent_type: "coach-integration-qa",
      model: "opus", run_in_background: true,
      prompt: "신규 코치 '{이름}'의 통합 정합성을 검증하라.
               반드시 Skill 도구로 `coach-qa-checklist` 스킬을 호출할 것.
               현재 완료된 것: {완료 산출물 목록}
               해당하는 경계면부터 검증하고, 나머지는 완료 알림을 받은 뒤 이어서 검증하라.
               결함은 발견 즉시 SendMessage({to:'main'})로 수신 대상을 명시하여 보고할 것.
               산출물: `_workspace/04_qa_report.md`")
```

**결함 처리 루프 (최대 2회):**
1. QA가 결함 보고 → 리더가 담당 에이전트에게 중계
2. 담당 에이전트가 수정 → 리더에게 완료 보고
3. 리더가 QA에게 재검증 요청
4. 2회 반복해도 미해결이면 루프를 멈추고 사용자에게 보고한다. 무한 루프는 토큰만 태운다

### Phase 5: 마무리

1. `_workspace/04_qa_report.md`의 판정 확인
2. **로스터 갱신** — `.claude/skills/coach-persona-spec/references/roster.md`에 신규 코치를 추가한다. 갱신하지 않으면 다음 세션의 중복 검사가 잘못된 전제로 실행된다
3. **CLAUDE.md 변경 이력**에 한 줄 추가
4. `_workspace/` 보존 (삭제하지 않는다 — 후속 재실행의 입력이다)
5. 사용자에게 보고:
   - 추가된 코치와 아키타입
   - 변경된 파일 목록
   - **QA 판정과 미검증 항목** — 특히 "실제 모델 응답 확인 필요" 항목을 반드시 전달한다
   - 확인 방법: `npm run dev` 실행 → 대시보드에서 코치 카드 클릭

---

## 데이터 흐름

```
사용자 요청 → _workspace/00_input/request.md
                      ↓
              [persona] (단독)
                      ↓
             01_persona_spec.md
                ↙          ↘
        [prompt]  ←─리더 중계─→  [ui]
             ↓                    ↓
    02_prompt_contract.md  03_wiring_report.md
    templates.ts        App.tsx, components/
                ↘          ↙
                   [qa] (점진적)
                      ↓
              04_qa_report.md
                      ↓
          roster.md + CLAUDE.md 갱신
```

## 에러 핸들링

| 상황 | 전략 |
|---|---|
| persona가 "확장 권고" 판정 | Phase 2에서 중단하고 사용자에게 확인. 임의로 강행하지 않는다 |
| prompt/ui 중 하나 실패 | 1회 재시도. 재실패 시 나머지 산출물로 진행하고 최종 보고에 누락을 명시 |
| 둘 다 실패 | 사용자에게 알리고 진행 여부를 확인 |
| 시그니처 중계 누락으로 ui가 대기 | 리더가 `TaskList`로 정체를 감지하면 `02_prompt_contract.md`를 직접 읽어 전달 |
| QA 결함 루프가 2회 초과 | 루프 중단. 미해결 결함을 리포트에 남기고 사용자에게 판단을 요청 |
| 지식 베이스 근거 부족 | 추측으로 채우지 않는다. 사장님이 실제 사업 결정에 쓰는 수치다. 리더가 리서치를 수행하거나 사용자에게 자료를 요청 |
| 에이전트 산출물 파일 누락 | 해당 에이전트에게 상태 확인. 없는 것을 "실패"로 단정하지 않는다 |

## 테스트 시나리오

### 정상 흐름 — 아키타입 A 코치 추가
1. 사용자: "포장·배달 최적화 코치를 추가해줘"
2. Phase 1: `_workspace/` 생성, 작업 8개 등록
3. Phase 2: persona가 중복 검사 → 기존 23명과 30% 미만 → 아키타입 A 확정, `PackagingInput.tsx` / `getPackagingAnalysis` 네이밍 계약 확정
4. Phase 3: prompt와 ui 병렬 실행. prompt가 시그니처를 먼저 보고 → 리더가 ui에 중계 → ui가 핸들러 작성
5. Phase 4: qa가 경계면 5종 검증 → 경계면 3(폼 필드 `deliveryArea` vs 프롬프트 `${data.area}`) 불일치 발견 → 양쪽에 중계 → 수정 → 재검증 통과
6. Phase 5: roster.md에 24번째 코치 추가, CLAUDE.md 이력 기록
7. 예상 결과: 코치가 대시보드에 노출되고, 클릭 → greeting → 폼 → 아코디언 분석 결과까지 동작

### 에러 흐름 — 중복 코치 요청
1. 사용자: "SNS 마케팅 코치를 추가해줘"
2. Phase 2: persona가 `마케터 제인 (디지털 마케팅 전문가)`과 중복도 75% 판정
3. persona가 리더에게 "확장 권고" 보고
4. 리더가 Phase 3으로 넘어가지 않고 사용자에게 확인: "마케터 제인과 역할이 75% 겹칩니다. 신규 코치 대신 제인의 프롬프트에 SNS 심화 섹션을 추가하는 편이 낫습니다. 어떻게 할까요?"
5. 사용자가 "그래도 신규로" 선택 시 → 차별점을 `description`에 명시하도록 지시하고 Phase 3 진행
6. 사용자가 "확장으로" 선택 시 → prompt만 부분 실행 (ui·persona 건너뜀), QA는 경계면 1·4만 검증
