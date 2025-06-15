/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        emergency: {
          red: '#ef4444',
          blue: '#3b82f6',
        }
      },
      animation: {
        'pulse-emergency': 'pulse-emergency 1.5s ease-in-out infinite',
        'fill-circle': 'fill-circle 3s ease-in-out forwards',
      },
      keyframes: {
        'pulse-emergency': {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 0 20px rgba(239, 68, 68, 0)',
            transform: 'scale(1.05)'
          },
        },
        'fill-circle': {
          '0%': { strokeDasharray: '0 408' },
          '100%': { strokeDasharray: '408 408' },
        }
      }
    },
  },
  plugins: [],
}