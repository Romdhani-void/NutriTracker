/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        parchment: {
          50:  '#fdfaf5',
          100: '#faf3e7',
          200: '#f4e4cc',
          300: '#e8cfa8',
          400: '#d9b080',
          500: '#c8925a',
        },
        terracotta: {
          400: '#c4704f',
          500: '#b05c3a',
          600: '#8f4a2d',
        },
        bark: {
          700: '#5a3e2b',
          800: '#3d2a1e',
          900: '#261a12',
        },
        sage: {
          400: '#7a9e7e',
          500: '#5f8263',
        },
        dustyrose: {
          400: '#c97b7b',
          500: '#a85f5f',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Lora"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'warm-sm': '0 2px 8px rgba(120, 70, 40, 0.10)',
        'warm':    '0 4px 20px rgba(120, 70, 40, 0.15)',
        'warm-lg': '0 8px 40px rgba(120, 70, 40, 0.20)',
      }
    },
  },
  plugins: [],
};
