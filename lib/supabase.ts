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

/**
 * Supabase가 돌려주는 영어 메시지를 사장님이 읽을 수 있는 문장으로 바꾼다.
 * 원문을 그대로 노출하면 무엇을 고쳐야 할지 알 수 없다.
 */
function toKoreanAuthError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (m.includes('already registered') || m.includes('already been registered')) return '이미 가입된 이메일입니다. 로그인해주세요.';
  if (m.includes('password should be at least')) return '비밀번호는 6자 이상이어야 합니다.';
  if (m.includes('email not confirmed')) return '이메일 인증이 아직 완료되지 않았습니다. 받은 메일의 링크를 눌러주세요.';
  if (m.includes('unable to validate email') || m.includes('invalid email')) return '이메일 형식이 올바르지 않습니다.';
  if (m.includes('provider is not enabled')) return 'Google 로그인이 아직 설정되지 않았습니다. 이메일로 진행해주세요.';
  if (m.includes('rate limit') || m.includes('too many')) return '요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.';
  // Supabase 주소가 틀렸거나 네트워크가 끊기면 fetch 자체가 실패한다.
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('load failed'))
    return '서버에 연결하지 못했습니다. 네트워크 상태와 Supabase 설정을 확인해주세요.';
  return raw;
}

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw new Error(toKoreanAuthError(error.message));
};

/**
 * 이메일 회원가입.
 *
 * Supabase의 "Confirm email" 설정이 켜져 있으면 session 없이 user만 돌아온다.
 * 이 경우 메일의 링크를 눌러야 로그인이 완료되므로 호출측에 알려준다.
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
): Promise<{ needsEmailConfirm: boolean }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw new Error(toKoreanAuthError(error.message));
  return { needsEmailConfirm: !data.session };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(toKoreanAuthError(error.message));
};

export const logout = () => supabase.auth.signOut();

/** API 호출에 실을 access token. 로그인 상태가 아니면 null. */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
