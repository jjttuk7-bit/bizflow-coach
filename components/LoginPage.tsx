import React, { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../lib/supabase';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
}

// 외부 CDN(gstatic) 의존을 없애기 위해 인라인으로 둔다.
const GoogleLogo: React.FC = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

type Mode = 'signup' | 'signin';

const FIELD =
  'w-full px-4 py-3 bg-linen border border-rule rounded-sm text-ink placeholder:text-slate-ink ' +
  'focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-colors disabled:opacity-60';

/**
 * 랜딩과 같은 디자인 시스템(웜 페이퍼 에디토리얼)을 쓴다.
 * 랜딩에서 CTA를 누르면 곧바로 오는 화면이라 톤이 끊기면 진입 흐름이 튄다.
 *
 * 이메일 가입/로그인이 기본이고 Google은 보조다 — Google OAuth는 별도 설정이
 * 끝나야 동작하므로, 그 전에도 서비스를 써볼 수 있어야 한다.
 */
const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const { needsEmailConfirm } = await signUpWithEmail(email.trim(), password);
        if (needsEmailConfirm) {
          // 메일 인증이 켜져 있으면 세션이 없다. App은 세션이 생겨야 다음 화면으로 넘어간다.
          setNotice('가입 확인 메일을 보냈습니다. 메일의 링크를 누르면 로그인이 완료됩니다.');
          setIsLoading(false);
          return;
        }
        // 인증이 꺼져 있으면 즉시 세션이 생기고 App.tsx가 화면을 넘긴다.
      } else {
        await signInWithEmail(email.trim(), password);
      }
      // 성공하면 화면이 전환되므로 로딩을 풀지 않는다.
    } catch (err) {
      setError(err instanceof Error ? err.message : '문제가 발생했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setNotice(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // 성공하면 OAuth 리다이렉트가 일어난다.
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-paper text-ink font-sans antialiased flex flex-col">
      <header className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="text-lg font-bold tracking-tight">BizFlow</span>
            <span className="hidden sm:inline text-[11px] uppercase tracking-[0.18em] text-slate-ink">
              Business Coach
            </span>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-slate-ink hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[26rem]"
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-ink mb-5">
            {mode === 'signup' ? 'Create account' : 'Sign in'}
          </p>

          <h1 className="text-[2rem] leading-[1.25] font-bold tracking-[-0.02em]">
            <span className="marker">23명의 전문가</span>가
            <br />
            기다리고 있습니다.
          </h1>

          <p className="mt-5 text-[15px] leading-[1.8] text-carbon">
            {mode === 'signup'
              ? '이메일로 가입하면 바로 우리 가게 진단을 시작할 수 있습니다.'
              : '가입하신 이메일로 로그인해주세요.'}
          </p>

          <div className="mt-8 flex border-b border-rule" role="tablist">
            {(['signup', 'signin'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`px-4 py-2.5 text-sm font-semibold -mb-px border-b-2 transition-colors ${
                  mode === m ? 'border-ink text-ink' : 'border-transparent text-slate-ink hover:text-ink'
                }`}
              >
                {m === 'signup' ? '회원가입' : '로그인'}
              </button>
            ))}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 border-l-2 border-red-500 bg-red-50/60 px-4 py-3 text-sm text-red-700 animate-shake"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="mt-6 flex items-start gap-2.5 border-l-2 border-ink bg-marker/40 px-4 py-3 text-sm text-ink"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{notice}</p>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="mt-6 space-y-3">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-1.5">
                이메일
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="sajang@example.com"
                className={FIELD}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-1.5">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder={mode === 'signup' ? '6자 이상' : ''}
                className={FIELD}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2.5 bg-ink text-paper px-6 py-4 text-base font-semibold rounded-sm hover:bg-carbon transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-[18px] h-[18px] animate-spin" />
                  처리하는 중…
                </>
              ) : mode === 'signup' ? (
                '가입하고 시작하기'
              ) : (
                '로그인'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-rule">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-3 border border-rule bg-linen px-6 py-3.5 text-[15px] font-semibold text-ink rounded-sm hover:bg-parchment transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <GoogleLogo />
              Google 계정으로 계속하기
            </button>
          </div>

          <p className="mt-8 text-xs leading-relaxed text-slate-ink">
            로그인 시 BizFlow의 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
          </p>
        </motion.div>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-slate-ink">
          © 2026 BizFlow. AXIS Cognitive OS Module.
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
