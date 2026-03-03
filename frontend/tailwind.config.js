/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rendix-blue': '#0066ff',
        'rendix-dark': '#0a0e27',
        'rendix-light': '#1a1f3a',
        'glass': 'rgba(255, 255, 255, 0.1)',
        'glass-border': 'rgba(255, 255, 255, 0.2)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'particle-float': 'particle-float 10s ease-in-out infinite',
        'insane-loading': 'insane-loading 3s ease-in-out infinite',
        'dna-helix': 'dna-helix 4s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 102, 255, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 102, 255, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'particle-float': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '25%': { transform: 'translate(10px, -10px) scale(1.1)' },
          '50%': { transform: 'translate(-10px, 10px) scale(0.9)' },
          '75%': { transform: 'translate(5px, 5px) scale(1.05)' },
        },
        'insane-loading': {
          '0%': { 
            transform: 'rotate(0deg) scale(1)',
            background: 'linear-gradient(45deg, #0066ff, #00ff88)'
          },
          '25%': { 
            transform: 'rotate(90deg) scale(1.2)',
            background: 'linear-gradient(90deg, #00ff88, #ff0088)'
          },
          '50%': { 
            transform: 'rotate(180deg) scale(0.8)',
            background: 'linear-gradient(135deg, #ff0088, #ffaa00)'
          },
          '75%': { 
            transform: 'rotate(270deg) scale(1.1)',
            background: 'linear-gradient(180deg, #ffaa00, #0066ff)'
          },
          '100%': { 
            transform: 'rotate(360deg) scale(1)',
            background: 'linear-gradient(225deg, #0066ff, #00ff88)'
          },
        },
        'dna-helix': {
          '0%': { transform: 'rotateY(0deg) translateZ(20px)' },
          '100%': { transform: 'rotateY(360deg) translateZ(20px)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
