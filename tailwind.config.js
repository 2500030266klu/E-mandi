/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govPrimary: '#003366', // Formal Navy Blue
        govSecondary: '#FF9933', // Saffron / Orange accent
        govTertiary: '#138808', // Green accent
        govBackground: '#F4F6F9', // Light gray-blue background
        govText: '#2C3E50', // Dark slate gray for readable text
        govLight: '#FFFFFF', // Clean white for cards
        govBorder: '#E2E8F0', // Light border
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      }
    },
  },
  plugins: [],
}
