/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F2',
        beige: '#EADBC8',
        brown: {
          DEFAULT: '#8B5E3C',
          light: '#A97B5A',
          dark: '#6E4A2E',
        },
        forest: {
          DEFAULT: '#5E7C5A',
          dark: '#4A6347',
        },
        gold: '#D4AF37',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(139, 94, 60, 0.18)',
        lift: '0 20px 50px -12px rgba(139, 94, 60, 0.28)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'heart-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'heart-pop': 'heart-pop 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
};
