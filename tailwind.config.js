/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#212661',
        gold: '#cec481',
        green: '#234d1e',
        'light-gray': '#F5F5F5',
        'medium-gray': '#D3D3D3',
        'dark-gray': '#333333',
        'error-red': '#C8102E',
      },
      fontFamily: {
        sans: ['Avenir', 'Avenir Next', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
