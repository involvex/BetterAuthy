import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4b888d',
        secondary: '#051524',
        tertiary: '#2c2155',
        danger: '#f07f7b',
        warning: '#f0c27b',
      },
      boxShadow: {
        centered: '0 0 4px #334155',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-0.5deg)' },
          '50%': { transform: 'rotate(0.5deg)' },
        },
      },
      animation: {
        wiggle: 'wiggle 400ms ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
