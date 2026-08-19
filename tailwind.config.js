/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 메인: 딥 네이비 (배너의 스마트폰 화면 톤)
        brand: {
          50: '#f1f4fb',
          100: '#e1e8f6',
          200: '#c3d0ec',
          300: '#93a9da',
          400: '#6079bf',
          500: '#3d57a0',
          600: '#2e4382',
          700: '#253568',
          800: '#1f2c54',
          900: '#1a2547',
        },
        // 포인트: 코랄 (배너의 하트·타이틀 색)
        coral: {
          50: '#fff2ef',
          100: '#ffe1db',
          200: '#ffc6b9',
          300: '#ffa08b',
          400: '#ff7d63',
          500: '#f5604a',
          600: '#e24a34',
          700: '#bc3a28',
        },
        // 보조: 따뜻한 오렌지
        mango: {
          100: '#ffeed9',
          300: '#ffc98a',
          500: '#ffa152',
          600: '#f2862f',
        },
        // 보조: 하늘색 (배너 인물 의상)
        sky2: {
          100: '#e3eefb',
          300: '#a8c8ec',
          500: '#5b8fd4',
          600: '#4275bb',
        },
        // 일러스트 배경: 밝은 시안 (건강 배너 톤)
        ocean: {
          50: '#eaf6fd',
          100: '#d2ecf9',
          300: '#7cc6e8',
          500: '#1a8fc7',
          600: '#1479a9',
          700: '#0f6289',
        },
        // 일러스트 외곽선: 딥 잉크 네이비
        ink: '#14395e',
        // 배경: 크림
        cream: {
          50: '#fefaf6',
          100: '#fdf5ee',
          200: '#f7ece1',
          300: '#efe0d1',
          400: '#e3cdb8',
        },
      },
      fontFamily: {
        // 파란 헤더 등 포인트 영역 전용 귀여운 글씨체
        cute: ['Gamja Flower', 'Malgun Gothic', '맑은 고딕', 'sans-serif'],
        // 웹폰트 CDN 없이도 한글이 제대로 나오도록 플랫폼별 한글 폰트를 명시한다.
        // (배포 환경에 따라 외부 폰트 로딩이 차단될 수 있음)
        sans: [
          'Apple SD Gothic Neo', // macOS · iOS
          'Malgun Gothic', // Windows
          '맑은 고딕',
          'Noto Sans KR', // Android
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 2px 16px -4px rgba(31, 44, 84, 0.10)',
        lift: '0 8px 28px -8px rgba(31, 44, 84, 0.18)',
      },
    },
  },
  plugins: [],
}
