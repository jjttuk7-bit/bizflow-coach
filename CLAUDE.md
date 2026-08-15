# BizFlow Coach

소상공인·스타트업용 한국어 AI 비즈니스 코칭 웹앱.
React 19 + Vite + Tailwind v4 + Supabase(Auth/Postgres) + OpenAI(Vercel Functions 경유).

## 아키텍처 불변조건

**AI 키와 프롬프트는 서버에만 둔다.** 클라이언트는 `services/coachApi.ts` → `/api/coach`로 `{action, payload}`만 보낸다. 컴포넌트에서 `openai`를 직접 import하거나 `OPENAI_API_KEY`를 `VITE_` 접두사로 노출하면 키가 브라우저 번들에 실려 과금을 도난당한다.

**Supabase anon key는 공개 전제 값이다.** 접근 통제는 `supabase/schema.sql`의 RLS 정책이 한다.

## 하네스: AI 코치 모듈 개발

**목표:** 신규 AI 전문가 코치를 페르소나 설계부터 프롬프트·API 등록·UI 배선·통합 검증까지 end-to-end로 추가한다.

**트리거:** 코치·전문가·specialist의 추가·수정·개선 요청 시 `bizflow-coach-builder` 스킬을 사용하라. "코치 추가", "전문가 만들어줘", "그 코치 답변이 별로야", "코치가 동작 안 해" 등이 해당한다. 단순히 코치 목록을 묻는 질문에는 사용하지 않는다.

**실행 모드:** 서브 에이전트 (리더 중계형). 이 환경에는 `TeamCreate`가 없으므로 에이전트 팀 모드를 사용하지 않는다.

**변경 이력:**

| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-08-15 | 초기 구성 — 에이전트 4종, 스킬 5종 | 전체 | 코치 모듈 추가가 반복 작업이며 배선 지점 누락이 잦음 |
| 2026-08-15 | Gemini → OpenAI 전환, 프롬프트를 `api/_prompts/`로 이전 | 스킬 전체 | 클라이언트 번들에 API 키가 노출되던 구조 제거 |
| 2026-08-15 | Firebase → Supabase 전면 교체 | `lib/`, `services/db.ts` | Vercel 배포 및 Postgres 이전 |
| 2026-08-15 | 경계면 0(action 문자열 3중 일치) 추가 + 검증 스크립트 번들링 | `coach-qa-checklist` | 프롬프트 서버 이전으로 배선 지점이 2곳 늘어남. 문자열 비교라 컴파일러가 못 잡음 |
