import React, { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle } from '../firebase';
import { Zap, LogIn, AlertCircle, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
}

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
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
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
