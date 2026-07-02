/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101010',
        paper: '#FAFAF8',
        card: '#FFFFFF',
        line: '#E7E6E1',
        muted: '#83807A',
        volt: '#C8FF4D',
        voltDark: '#9FD92A',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
