/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gemini: {
          bg: '#080809',
          card: '#131314',
          border: '#303136',
          textMuted: '#9e9e9e',
        },
        antigravity: {
          bg: '#05070a',
          panel: '#0c0f17',
          border: '#1b2234',
          glow: '#00f2fe',
          glowSecondary: '#4facfe',
          cyan: '#00d2ff',
          magenta: '#ff007f',
          accent: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'glow-pulse': 'glowPulse 2s infinite ease-in-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', filter: 'brightness(0.9) drop-shadow(0 0 5px rgba(0,242,254,0.3))' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2) drop-shadow(0 0 12px rgba(0,242,254,0.6))' },
        }
      }
    },
  },
  plugins: [],
}
