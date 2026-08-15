import { createClient } from '@supabase/supabase-js';

/**
 * 브라우저용 Supabase 클라이언트.
 *
 * anon key는 공개되어도 되는 값이다 — 실제 접근 통제는 Postgres의 RLS 정책이 한다
 * (supabase/schema.sql 참조). OpenAI 키처럼 감춰야 하는 값과 혼동하지 말 것.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 환경변수가 없습니다. .env.local을 확인해주세요.',
  );
}

export const supabase = createClient(url, anonKey);

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
};

export const logout = () => supabase.auth.signOut();

/** API 호출에 실을 access token. 로그인 상태가 아니면 null. */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
