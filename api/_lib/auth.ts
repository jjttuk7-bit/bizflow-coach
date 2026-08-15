import { createClient } from '@supabase/supabase-js';

/**
 * 이 엔드포인트는 OpenAI 과금을 유발한다. 인증을 걸지 않으면 URL을 아는 누구나
 * 호출해 비용을 태울 수 있으므로, 로그인한 사용자만 통과시킨다.
 *
 * 클라이언트가 Authorization: Bearer <supabase access token>을 보내면
 * Supabase에 토큰 유효성을 확인한다.
 */
export async function requireUser(authHeader: string | undefined): Promise<{ id: string; email: string | null }> {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    throw new UnauthorizedError('로그인이 필요합니다.');
  }

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('SUPABASE_URL / SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.');
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new UnauthorizedError('로그인 정보가 만료되었습니다. 다시 로그인해주세요.');
  }

  return { id: data.user.id, email: data.user.email ?? null };
}

export class UnauthorizedError extends Error {
  readonly status = 401;
}
