/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Display serif for headlines, Inter for everything else.
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Chapter palette - deep navy and gold.
        navy: {
          50: '#eef3fb', 100: '#d6e2f5', 200: '#adc4e8', 300: '#7b9dd6',
          400: '#4d76bf', 500: '#2f57a3', 600: '#224184', 700: '#1a3269',
          800: '#142650', 900: '#0e1c3c', 950: '#070f22',
        },
        gold: {
          50: '#fdf8e7', 100: '#faeec0', 200: '#f4dc85', 300: '#eec44a',
          400: '#e6ae22', 500: '#c98f10', 600: '#a06e0b', 700: '#7a530c',
          800: '#5b3e10', 900: '#3d2a0c',
        },
      },
      letterSpacing: { eyebrow: '0.22em' },
    },
  },
  plugins: [],
};
