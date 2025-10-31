/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // EXISTING BRAND COLORS (Keep for compatibility)
        primary: '#00F0FF',
        secondary: '#9D4EDD',
        accent: '#FF006E',
        dark: '#0A0E27',
        success: '#06FFA5',
        error: '#FF4D6D',

        // ADMIN DASHBOARD DESIGN SYSTEM COLORS
        // Backgrounds
        'bg-default': '#0A0E27',
        'bg-surface': '#1A1F3A',
        'bg-elevated': '#252B47',

        // Text
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0AEC0',
        'text-tertiary': '#64748B',

        // Borders
        'border-subtle': '#2D3748',
        'border-medium': '#4A5568',
        'border-strong': '#718096',

        // System States
        warning: '#F59E0B',
        info: '#60A5FA',

        // Gamification
        'gamification-xp': '#FFD700',
        'gamification-streak': '#FF8C00',

        // Glows
        'glow-cyan': 'rgba(0, 240, 255, 0.4)',
        'glow-green': 'rgba(6, 255, 165, 0.4)',
        'glow-gold': 'rgba(255, 215, 0, 0.4)',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"SF Mono"', '"Fira Code"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)',
        'pop': '0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)',
        'modal': '0 16px 48px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.5)',
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3)',
        'glow-green': '0 0 20px rgba(6, 255, 165, 0.5), 0 0 40px rgba(6, 255, 165, 0.3)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '0.7',
            boxShadow: '0 0 40px rgba(0, 240, 255, 0.8)',
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      transitionDuration: {
        'instant': '100ms',
        'fast': '200ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
