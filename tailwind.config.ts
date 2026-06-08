import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/components/**/*.{vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/utils/**/*.ts',
    './app/error.vue'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#101828',
        ember: '#f97316',
        pulse: '#00d4ff'
      },
      boxShadow: {
        glass: '0 24px 80px rgba(15, 23, 42, 0.16)'
      }
    }
  },
  plugins: []
} satisfies Config
