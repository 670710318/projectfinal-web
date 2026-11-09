/** @type {import('tailwindcss').Config} */
// สีและฟอนต์ของทั้งเว็บกำหนดที่นี่ที่เดียว (pine = สีหลัก, sand = สีเน้นแบบโรงแรม)
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pine: {
          50: '#f0f7f5', 100: '#d9ebe5', 200: '#b4d7cb', 300: '#84bcab', 400: '#559c88',
          500: '#3a806d', 600: '#2c6657', 700: '#255247', 800: '#20433b', 900: '#1c3832', 950: '#0e1f1b',
        },
        sand: {
          50: '#fbf8f1', 100: '#f5eedc', 200: '#ebdbb5', 300: '#dec385', 400: '#d2a95c',
          500: '#c79343', 600: '#b07737', 700: '#935d30',
        },
      },
      fontFamily: {
        sans: ['Prompt', 'system-ui', 'sans-serif'],
        display: ['"Noto Serif Thai"', 'Prompt', 'serif'],
      },
    },
  },
  plugins: [],
};
