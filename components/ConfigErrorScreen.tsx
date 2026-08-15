import React from 'react';

interface ConfigErrorScreenProps {
  message: string;
}

/**
 * 설정 누락으로 앱을 띄울 수 없을 때 보여주는 화면.
 * 흰 화면은 원인을 전혀 알려주지 않기 때문에, 무엇을 어디에 넣어야 하는지까지 적는다.
 */
const ConfigErrorScreen: React.FC<ConfigErrorScreenProps> = ({ message }) => (
  <div className="min-h-screen bg-paper text-ink font-sans antialiased flex items-center justify-center px-6 py-16">
    <div className="w-full max-w-xl">
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-ink mb-5">
        Configuration required
      </p>
      <h1 className="text-3xl leading-[1.3] font-bold tracking-[-0.02em]">
        환경변수가 설정되지 않아
        <br />
        앱을 시작할 수 없습니다.
      </h1>

      <p className="mt-6 text-[15px] leading-[1.8] text-carbon">{message}</p>

      <div className="mt-8 border-t border-rule pt-8">
        <h2 className="text-sm font-bold tracking-tight">확인할 것</h2>
        <ol className="mt-4 space-y-3 text-[15px] leading-[1.75] text-carbon list-decimal list-inside">
          <li>
            배포 환경에 <code className="bg-parchment px-1.5 py-0.5 rounded-sm text-sm">VITE_SUPABASE_URL</code>과{' '}
            <code className="bg-parchment px-1.5 py-0.5 rounded-sm text-sm">VITE_SUPABASE_ANON_KEY</code>가 등록되어 있는지
          </li>
          <li>
            변수를 적용할 환경(Production / Preview / Development)에 모두 체크했는지
          </li>
          <li>
            <strong className="font-semibold">변수를 넣은 뒤 다시 배포했는지</strong> — 이 값들은 빌드
            시점에 번들에 박히므로, 기존 배포물은 변수를 추가해도 바뀌지 않습니다
          </li>
        </ol>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-slate-ink">
        로컬에서 이 화면이 보인다면 프로젝트 루트의 <code>.env.local</code>을 확인한 뒤 개발 서버를
        다시 시작해주세요.
      </p>
    </div>
  </div>
);

export default ConfigErrorScreen;
