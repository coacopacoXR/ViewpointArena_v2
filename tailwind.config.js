/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'arena-bg': '#F2F2F2',
        'arena-dark': '#1A1A1A',
        'arena-glass': 'rgba(255, 255, 255, 0.7)',
        'arena-glass-dark': 'rgba(0, 0, 0, 0.1)',
        'agent-alpha': '#4F46E5',
        'agent-beta': '#10B981',
        'agent-gamma': '#F59E0B',
        'agent-delta': '#EC4899',
        'risk-critical': '#EF4444',
        'risk-high': '#F97316',
        'action': '#3B82F6',
        'rationale': '#8B5CF6',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
    },
  },
  plugins: [],
}
