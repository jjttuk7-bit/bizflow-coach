import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * 이전 설정에는 API 키를 클라이언트 번들에 주입하는 define 블록이 있었다.
 * 그 방식은 키를 브라우저에 그대로 노출시키므로 제거했다.
 * AI 호출은 전부 /api/coach 서버리스 함수를 거친다.
 *
 * 클라이언트에 필요한 값은 VITE_ 접두사 환경변수(Supabase URL/anon key)뿐이며,
 * Vite가 import.meta.env로 알아서 주입한다.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // 라이브러리를 앱 코드와 분리해 배포마다 통째로 다시 받지 않게 한다.
        // 앱 코드만 바뀌면 vendor 청크는 브라우저 캐시에서 그대로 재사용된다.
        //
        // 배열 형태('react': ['react','react-dom'])로는 react-dom/client 같은
        // 하위 진입점이 메인 청크에 남는다. 경로로 직접 판별한다.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('lucide-react') || /node_modules\/motion/.test(id)) return 'ui';
        },
      },
    },
  },
});
