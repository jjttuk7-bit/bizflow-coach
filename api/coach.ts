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

    // 원본 오류는 서버 로그에만 남긴다. OpenAI 오류 메시지에는 조직 ID나
    // 키 일부가 섞일 수 있어 클라이언트로 그대로 흘리지 않는다.
    console.error('[api/coach]', err);
    const message = err instanceof Error ? err.message : '';
    const isConfigError = message.includes('OPENAI_API_KEY') || message.includes('SUPABASE_');
    return res.status(500).json({
      error: isConfigError
        ? '서버 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.'
        : 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    });
  }
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
