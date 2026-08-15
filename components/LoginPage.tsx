import React, { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle } from '../lib/supabase';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

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

/**
 * 랜딩과 같은 디자인 시스템(웜 페이퍼 에디토리얼)을 쓴다.
 * 랜딩에서 CTA를 누르면 곧바로 오는 화면이라 톤이 끊기면 진입 흐름이 튄다.
 */
const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // 성공하면 OAuth 리다이렉트가 일어나고, App.tsx가 세션 변화를 감지한다.
    } catch (err) {
      console.error(err);
      setError('로그인 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-paper text-ink font-sans antialiased flex flex-col">
      {/* 상단 바 — 랜딩의 네비게이션과 같은 괘선·타이포 */}
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
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-ink mb-5">Sign in</p>

          <h1 className="text-[2rem] leading-[1.25] font-bold tracking-[-0.02em]">
            <span className="marker">23명의 전문가</span>가
            <br />
            기다리고 있습니다.
          </h1>

          <p className="mt-5 text-[15px] leading-[1.8] text-carbon">
            로그인하면 우리 가게 정보를 저장하고, 코치들과 나눈 상담 내용을 이어서 볼 수 있습니다.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-7 flex items-start gap-2.5 border-l-2 border-red-500 bg-red-50/60 px-4 py-3 text-sm text-red-700 animate-shake"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="mt-9 border-t border-rule pt-9">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-3 bg-ink text-paper px-6 py-4 text-base font-semibold rounded-sm hover:bg-carbon transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-[18px] h-[18px] animate-spin" />
                  연결하는 중…
                </>
              ) : (
                <>
                  <span className="bg-paper rounded-full p-1 flex items-center justify-center">
                    <GoogleLogo />
                  </span>
                  Google 계정으로 계속하기
                </>
              )}
            </button>

            <button
              disabled
              className="mt-3 w-full px-6 py-4 text-base font-medium text-slate-ink border border-rule rounded-sm cursor-not-allowed"
            >
              이메일로 로그인 · 준비 중
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
