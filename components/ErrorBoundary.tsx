import React from 'react';

interface State {
  error: Error | null;
}

/**
 * 렌더 중 예외가 나면 React는 트리 전체를 언마운트한다 — 사용자에게는 흰 화면만 남고
 * 원인은 콘솔에만 찍힌다. 최소한 무슨 일이 났는지 화면에 남기기 위한 경계.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-paper text-ink font-sans antialiased flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-ink mb-5">Error</p>
          <h1 className="text-3xl leading-[1.3] font-bold tracking-[-0.02em]">
            화면을 표시하는 중 문제가 발생했습니다.
          </h1>
          <p className="mt-6 text-[15px] leading-[1.8] text-carbon">
            잠시 후 다시 시도해주세요. 문제가 계속되면 아래 내용을 알려주시면 도움이 됩니다.
          </p>
          <pre className="mt-6 bg-parchment border border-rule rounded-sm p-4 text-xs leading-relaxed text-carbon whitespace-pre-wrap break-words">
            {error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 bg-ink text-paper px-7 py-3.5 text-base font-semibold rounded-sm hover:bg-carbon transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
