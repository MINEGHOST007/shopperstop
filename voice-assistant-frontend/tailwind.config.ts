import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'walmart-blue': '#0071ce',
        'walmart-blue-dark': '#004c87',
        'walmart-blue-light': '#338eef',
        'walmart-yellow': '#ffc220',
        'walmart-yellow-dark': '#e6a800',
        'walmart-yellow-light': '#ffd966',
        'walmart-gray': '#f7f7f7',
        'walmart-dark-gray': '#5a5a5a',
      },
      fontFamily: {
        'walmart': ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
