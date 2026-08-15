import { createClient } from '@supabase/supabase-js';

/**
 * 브라우저용 Supabase 클라이언트.
 *
 * anon key는 공개되어도 되는 값이다 — 실제 접근 통제는 Postgres의 RLS 정책이 한다
 * (supabase/schema.sql 참조). OpenAI 키처럼 감춰야 하는 값과 혼동하지 말 것.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * 설정 누락을 여기서 throw하면 모듈 로드 단계에서 앱이 죽어 흰 화면만 남는다.
 * 무엇이 잘못됐는지 화면에 띄울 수 있도록 값으로 넘긴다.
 *
 * VITE_ 변수는 런타임이 아니라 빌드 타임에 번들로 인라인된다. 배포 환경에
 * 값을 넣었더라도 그 이후 다시 빌드하지 않았다면 여전히 비어 있다.
 */
export const supabaseConfigError: string | null =
  !url || !anonKey
    ? 'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 값이 빌드에 포함되지 않았습니다.'
    : null;

// 설정이 없으면 아래 클라이언트는 쓰이지 않는다(설정 안내 화면이 대신 렌더된다).
export const supabase = createClient(url || 'https://unconfigured.invalid', anonKey || 'unconfigured');

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
