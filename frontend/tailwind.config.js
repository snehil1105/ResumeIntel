/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Romanizter Periwinkle / Sky Blue palette
        periwinkle: {
          50: '#F2F7FD',
          100: '#E4EEFB',
          200: '#CDE0F8',
          300: '#A9CBF3',
          400: '#86B3EE',
          500: '#6B9FE8',
          600: '#548BD6',
          700: '#3E73BC',
          800: '#2F5994',
          900: '#234471',
        },
        // Romanizter Coral / Salmon palette
        coral: {
          50: '#FFF5F4',
          100: '#FFEBE9',
          200: '#FED5D1',
          300: '#FDB6B0',
          400: '#F78B81',
          500: '#F1695D',
          600: '#E15448',
          700: '#C93F34',
          800: '#A3332A',
          900: '#7E2821',
        },
        cream: {
          50: '#FDFBF7',
          100: '#F9F5EC',
          200: '#EFE8DA',
        },
        brand: {
          50: '#F2F7FD',
          100: '#E4EEFB',
          500: '#6B9FE8',
          600: '#548BD6',
          700: '#3E73BC',
          900: '#234471',
        }
      }
    },
  },
  plugins: [],
}
