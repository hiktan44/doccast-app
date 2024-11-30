/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#60A5FA',
          dark: '#3B82F6',
        },
        background: {
          light: '#FFFFFF',
          dark: '#1F2937',
        },
        surface: {
          light: '#F3F4F6',
          dark: '#374151',
        },
        text: {
          light: '#1F2937',
          dark: '#F9FAFB',
        }
      }
    },
  },
  plugins: [],
}