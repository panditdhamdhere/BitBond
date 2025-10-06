/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      backgroundImage: {
        'bitcoin-gradient': 'linear-gradient(135deg, #f7931a 0%, #ff6b35 100%)',
        'stacks-gradient': 'linear-gradient(135deg, #5546ff 0%, #7c3aed 100%)',
      },
    },
  },
  plugins: [],
}
