import type { VercelRequest, VercelResponse } from '@vercel/node';
import { actions } from './_lib/registry';
import { requireUser, UnauthorizedError } from './_lib/auth';

/**
 * 모든 AI 코칭 호출의 단일 진입점.
 *
 * Vercel Hobby 플랜은 서버리스 함수 개수에 제한이 있어 코치별로 엔드포인트를
 * 쪼개지 않고 actionId 라우팅으로 통합했다.
 *
 * POST /api/coach
 *   헤더: Authorization: Bearer <supabase access token>
 *   본문: { action: string, payload: object }
 *   응답: { result: string | object }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'POST 요청만 지원합니다.' });
  }

  try {
    await requireUser(req.headers.authorization);

    // Vercel은 content-type이 application/json이면 req.body를 이미 파싱해 둔다.
    const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as
      | { action?: string; payload?: unknown }
      | null;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: '요청 본문이 올바른 JSON이 아닙니다.' });
    }

    const { action, payload } = body;
    if (!action || typeof action !== 'string') {
      return res.status(400).json({ error: 'action이 필요합니다.' });
    }

    const run = actions[action];
    if (!run) {
      // 등록되지 않은 action은 실행하지 않는다 — 임의 프롬프트 주입 차단.
      return res.status(400).json({ error: `알 수 없는 action입니다: ${action}` });
    }

    const result = await run(payload ?? {});
    return res.status(200).json({ result });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return res.status(401).json({ error: err.message });
    }

    // 원본 오류는 서버 로그에만 남긴다 — OpenAI 오류 메시지에는 조직 ID나 키 일부가
    // 섞일 수 있다. 다만 "무엇을 고쳐야 하는지"까지 감추면 진단이 불가능해지므로,
    // 비밀이 아닌 범위(어떤 환경변수가 비었는지, 어떤 상태코드인지)는 알려준다.
    console.error('[api/coach]', err);
    return res.status(500).json({ error: describeFailure(err) });
  }
}

/** 원인을 짚어주되 비밀은 흘리지 않는 메시지로 바꾼다. */
function describeFailure(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  const status = (err as { status?: number })?.status;

  if (raw.includes('OPENAI_API_KEY')) {
    return '서버에 OPENAI_API_KEY가 설정되지 않았습니다. Vercel 환경변수를 확인해주세요.';
  }
  if (raw.includes('SUPABASE_URL') || raw.includes('SUPABASE_ANON_KEY')) {
    return '서버에 SUPABASE_URL / SUPABASE_ANON_KEY가 설정되지 않았습니다. (VITE_ 접두사 없는 쪽입니다)';
  }
  if (status === 401) {
    return 'OpenAI가 키를 거부했습니다(401). OPENAI_API_KEY 값이 올바른지 확인해주세요.';
  }
  if (status === 429) {
    return 'OpenAI 사용량 한도에 걸렸습니다(429). 결제 수단과 잔액을 확인해주세요.';
  }
  if (status === 404 || raw.includes('does not exist') || raw.includes('model_not_found')) {
    return '지정한 OpenAI 모델을 찾을 수 없습니다. OPENAI_MODEL 값을 확인해주세요.';
  }
  if (raw.includes('ENOTFOUND') || raw.includes('ETIMEDOUT') || raw.includes('fetch failed')) {
    return '외부 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.';
  }
  return 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
