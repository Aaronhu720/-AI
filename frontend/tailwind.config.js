/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        'primary-dark': '#E55A2B',
        secondary: '#2DD4A8',
        'secondary-dark': '#22B893',
        accent: '#FFB800',
        background: '#F8F9FA',
        card: '#FFFFFF',
        border: '#E8ECF0',
        muted: '#8E99A4',
        danger: '#EF4444',
        success: '#22C55E',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
