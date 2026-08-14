/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
    './mdx-components.tsx',
  ],
  theme: {
    extend: {
      colors: {
        mint: {
          DEFAULT: '#4DFFB4',
          50: '#F0FDF8',
          100: '#D5FBE9',
          200: '#AFF7D5',
          300: '#7CEFB9',
          400: '#4DFFB4',
          500: '#1DE892',
          600: '#0BC775',
          700: '#099D5D',
          800: '#0C7C4C',
          900: '#0D653F',
          950: '#033922',
        },
        zorveus: {
          dark: '#0A0A0B',
          card: '#121214',
          subtle: '#18181B',
          border: '#27272A',
          borderLight: '#3F3F46',
          textMuted: '#A1A1AA',
        },
      },
    },
  },
};
