/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/**/*.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#233E8B', // A navy shade for primary elements
          light: '#A7BBC7', // Lighter shade for secondary elements
          dark: '#102A43', // Dark navy for text or headers
        },
        accent: {
          coral: '#FF6B6B', // Coral for interactive elements or calls to action
          'coral-dark': '#e55e5e', // Darker shade of coral for hover and active states
          sky: '#1B98E0', // Sky blue for interactive elements or information
        },
        neutral: {
          light: '#F0F4F8', // Light gray for backgrounds and interface elements
          dark: '#334E68', // Dark gray for text
        },
        success: {
          muted: '#4CAF50', // Muted green for success messages
        },
        highlight: {
          soft: '#FFD700', // Soft yellow for highlights and badges
        }
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        heading: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
