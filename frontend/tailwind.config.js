/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F06225',
        'primary-dark': '#D9541D',
        'primary-light': '#FFF4EF',
        secondary: '#22C997',
        'secondary-dark': '#1AAE82',
        accent: '#F5A623',
        background: '#F5F6F8',
        card: 'rgba(255,255,255,0.85)',
        'card-solid': '#FFFFFF',
        border: 'rgba(0,0,0,0.06)',
        muted: '#9CA3AF',
        'muted-dark': '#6B7280',
        danger: '#EF4444',
        success: '#10B981',
        dark: '#111827',
        'dark-secondary': '#374151',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        mono: ['SF Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)',
        'float': '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'glow': '0 0 20px rgba(240,98,37,0.15)',
        'glow-sm': '0 0 10px rgba(240,98,37,0.1)',
        'inner-light': 'inset 0 1px 0 rgba(255,255,255,0.5)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #F06225 0%, #F5A623 100%)',
        'gradient-cool': 'linear-gradient(135deg, #22C997 0%, #3B82F6 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        'gradient-page': 'linear-gradient(180deg, #FFF4EF 0%, #F5F6F8 15%, #F5F6F8 100%)',
      },
    },
  },
  plugins: [],
};
