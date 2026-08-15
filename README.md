# BizFlow Coach

소상공인·스타트업을 위한 한국어 AI 비즈니스 코칭 웹앱. 상권 분석, 마케팅, 재고, 가격 전략 등을 23명의 AI 전문가 페르소나가 나눠 상담한다.

**스택**: React 19 + Vite + TypeScript / Tailwind CSS v4 / Supabase (Auth + Postgres) / OpenAI (Vercel Functions 경유)

---

## 아키텍처

```
브라우저                    Vercel Functions              외부
────────                    ────────────────              ────
App.tsx                     api/coach.ts
  ↓                           ↓ 1. Supabase 토큰 검증
services/coachApi.ts  ──────→ ↓ 2. actionId → 프롬프트 조립     OpenAI
  (actionId + payload)        ↓ 3. 모델 호출              ──→  gpt-4o-mini
                              api/_prompts/templates.ts
lib/supabase.ts       ─────────────────────────────────→  Supabase
  (Auth + RLS 쿼리)                                        Postgres
```

**API 키는 브라우저에 내려가지 않는다.** 프롬프트 본문도 서버에만 있어서 번들에 포함되지 않고, `api/_lib/registry.ts`에 등록된 action만 실행되므로 임의 프롬프트를 밀어 넣을 수 없다.

---

## 로컬 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 프로젝트 준비

[supabase.com](https://supabase.com)에서 프로젝트를 만든 뒤:

1. **SQL Editor**에 [supabase/schema.sql](supabase/schema.sql)을 붙여넣고 실행한다 (테이블 + RLS + 가입 트리거).
2. **Authentication → Providers → Google**을 활성화하고 Google OAuth 클라이언트 ID/시크릿을 넣는다.
3. **Authentication → URL Configuration**에 리다이렉트 URL을 등록한다:
   - `http://localhost:3000` (로컬)
   - `https://<배포도메인>` (프로덕션)

### 3. 환경변수

[.env.example](.env.example)을 `.env.local`로 복사해 값을 채운다.

```bash
cp .env.example .env.local
```

| 변수 | 어디서 읽나 | 비고 |
|---|---|---|
| `VITE_SUPABASE_URL` | 브라우저 | 공개되어도 되는 값 |
| `VITE_SUPABASE_ANON_KEY` | 브라우저 | 공개 전제. 통제는 RLS가 한다 |
| `OPENAI_API_KEY` | 서버 | **절대 `VITE_` 붙이지 말 것** |
| `OPENAI_MODEL` | 서버 | 기본값 `gpt-4o-mini` |
| `SUPABASE_URL` | 서버 | 토큰 검증용 |
| `SUPABASE_ANON_KEY` | 서버 | 토큰 검증용 |

### 4. 실행

`/api` 함수까지 로컬에서 돌리려면 Vercel CLI를 쓴다:

```bash
npx vercel dev
```

프런트만 볼 때는 `npm run dev`로 충분하다 (이 경우 AI 호출은 실패한다 — `/api`가 뜨지 않으므로).

---

## 배포 (Vercel)

1. GitHub 저장소를 Vercel에 임포트한다. 프레임워크는 Vite로 자동 감지된다.
2. **Settings → Environment Variables**에 위 표의 6개 변수를 모두 등록한다.
3. 배포 후 생성된 도메인을 Supabase의 리다이렉트 URL에 추가한다.

빌드는 `tsc --noEmit && vite build`로, 타입 에러가 있으면 배포가 막힌다.

---

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | Vite 개발 서버 (API 제외) |
| `npm run build` | 타입체크 + 프로덕션 빌드 |
| `npm run typecheck` | 타입체크만 |
| `npm run preview` | 빌드 결과 미리보기 |

---

## 코치 추가하기

신규 AI 코치를 추가할 때는 페르소나·프롬프트·UI 배선·검증이 서로 맞물려야 한다.
`.claude/`의 하네스가 이 과정을 자동화한다 — Claude Code에서 "코치 추가해줘"라고 요청하면
`bizflow-coach-builder` 오케스트레이터가 전담 에이전트 4종을 조율한다.

자세한 내용은 [CLAUDE.md](CLAUDE.md) 참조.
