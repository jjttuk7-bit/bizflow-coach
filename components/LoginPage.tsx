import React, { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle } from '../lib/supabase';
import { Zap, LogIn, AlertCircle, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
}

// 외부 CDN(gstatic) 의존을 없애기 위해 인라인으로 둔다.
const GoogleLogo: React.FC = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // App.tsx will detect the auth state change
    } catch (err) {
      console.error(err);
      setError('로그인 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-indigo-100/50 p-8 border border-slate-100"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-200">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Biz Flow 로그인</h2>
          <p className="text-slate-500 mt-2 text-center">
            전문가 수준의 AI 비즈니스 코칭을 <br />
            지금 바로 시작하세요.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            ) : (
              <GoogleLogo />
            )}
            Google 계정으로 계속하기
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium tracking-wider">또는</span>
            </div>
          </div>

          <button
            disabled
            className="w-full py-4 px-6 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-400 cursor-not-allowed flex items-center justify-center gap-3"
          >
            <LogIn className="w-5 h-5" />
            이메일로 로그인 (준비 중)
          </button>
        </div>

        <button 
          onClick={onBack}
          className="mt-8 w-full text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
        >
          랜딩 페이지로 돌아가기
        </button>
      </motion.div>

      <p className="mt-8 text-slate-400 text-xs text-center max-w-xs leading-relaxed">
        로그인 시 Biz Flow의 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
};

export default LoginPage;
