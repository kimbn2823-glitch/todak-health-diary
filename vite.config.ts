import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // 포트를 고정하지 않는다. PORT 환경변수가 있으면 그 값을 쓰고,
    // 없으면 Vite 기본값(5173)을 쓴다.
    // 상시 실행 중인 사용자용 서버(npm run serve, 5173)와 충돌하지 않도록 하기 위함.
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  preview: {
    host: true,
  },
  build: {
    // 폰트(woff2)·캐릭터(svg)를 번들 안에 base64로 내장한다.
    // 단일 파일(standalone.html) 배포에서도 폰트가 항상 보이게 하기 위함.
    assetsInlineLimit: 1_000_000,
  },
})
