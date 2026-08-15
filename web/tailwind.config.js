/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 900: '#0b1020', 800: '#121a33', 700: '#1b2547', 600: '#2a3766' },
        accent: { DEFAULT: '#5b8cff', soft: '#8fb0ff' },
        ok: '#3ecf8e',
        bad: '#ff6b6b',
      },
      // 폰 한 손 조작: 하단 고정 영역이 홈 인디케이터에 가리지 않게
      spacing: { safe: 'env(safe-area-inset-bottom)' },
      minHeight: { tap: '44px' },
    },
  },
  plugins: [],
};
