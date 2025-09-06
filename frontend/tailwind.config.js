/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          start: '#6366f1', // indigo-500
          end: '#10b981', // emerald-500
        },
        surface: {
          DEFAULT: '#fafafa', // neutral-50
          dark: '#171717', // neutral-900
        },
        'text-strong': {
          DEFAULT: '#171717', // neutral-900
          dark: '#f5f5f5', // neutral-100
        }
      },
      animation: {
        'scale-up': 'scaleUp 0.2s ease-out',
        'scale-down': 'scaleDown 0.15s ease-out',
      },
      keyframes: {
        scaleUp: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
        scaleDown: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.98)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.1), 0 1px 3px -1px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 4px 14px -4px rgba(0, 0, 0, 0.1), 0 2px 6px -2px rgba(0, 0, 0, 0.05)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      ringWidth: {
        'focus': '2px',
      },
      ringColor: {
        'focus': '#6366f1', // indigo-500
      },
    },
  },
  plugins: [],
}