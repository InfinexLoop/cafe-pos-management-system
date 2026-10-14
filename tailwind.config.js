/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        espresso: {
          50: '#F8F6F4',
          100: '#EFEBE7',
          200: '#DDD5CD',
          300: '#C4B5A7',
          400: '#9E8674',
          500: '#7B6251',
          600: '#5F493C',
          700: '#4D3A2F',
          800: '#38261F', // Deep Espresso Primary
          900: '#261914',
          950: '#150D0A',
        },
        terracotta: {
          50: '#FCF7F4',
          100: '#F7EDE7',
          200: '#EED9CE',
          300: '#E2BFAF',
          400: '#D59D88',
          500: '#C87553', // Secondary Terracotta
          600: '#B55E3C',
          700: '#964B2E',
          800: '#7C3E28',
          900: '#673624',
          950: '#37190F',
        },
        sage: {
          50: '#F6F8F5',
          100: '#ECF0EA',
          200: '#D9E2D6',
          300: '#BFCEB9',
          400: '#A3B69B',
          500: '#87977A', // Accent Sage Green
          600: '#6F8062',
          700: '#56654C',
          800: '#46523E',
          900: '#3A4434',
          950: '#1D241A',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#FAF7F1', // Background Warm Cream
          300: '#F4EEE2',
          400: '#ECE2CE',
          500: '#DFD2B7',
          600: '#C7B595',
          700: '#A79370',
          800: '#7E6E52',
          900: '#564A37',
        },
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['"DM Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(56, 38, 31, 0.05)',
        'card': '0 4px 20px -2px rgba(56, 38, 31, 0.08)',
        'float': '0 10px 30px -5px rgba(56, 38, 31, 0.15)',
      }
    },
  },
  plugins: [],
}
