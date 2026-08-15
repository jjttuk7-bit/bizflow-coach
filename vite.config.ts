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
  },
});
