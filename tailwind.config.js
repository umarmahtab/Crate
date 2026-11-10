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
        background: {
          DEFAULT: 'var(--bg-main)',
          secondary: 'var(--bg-secondary)',
          elevated: 'var(--bg-elevated)',
        },
        neutral: {
          850: '#1b202b',
        },
        surface: {
          DEFAULT: 'var(--surface-main)',
          hover: 'var(--surface-hover)',
          active: 'var(--surface-active)',
          border: 'var(--surface-border)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'color-mix(in srgb, var(--accent) 82%, #000)',
          light: '#fef3c7',
          muted: 'rgba(245, 158, 11, 0.15)',
        },
        status: {
          playing: '#10b981',   // Emerald
          backlog: '#3b82f6',   // Blue
          completed: '#f59e0b', // Amber/Gold
          onhold: '#f97316',    // Orange
          dropped: '#ef4444',   // Rose/Red
          wishlist: '#8b5cf6',  // Purple/Violet
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 10px 25px -3px rgba(0, 0, 0, 0.35)',
        'glow-accent': '0 0 15px -3px rgba(245, 158, 11, 0.3)',
      },
      scale: {
        98: '0.98',
        108: '1.08',
        115: '1.15',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-from-bottom-3': {
          from: { opacity: '0', transform: 'translateY(0.75rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-in-from-bottom-3': 'slide-in-from-bottom-3 300ms ease-out',
      },
    },
  },
  plugins: [],
}
