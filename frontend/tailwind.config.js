/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#ffffff',
          base:    '#f6f8f7',
          muted:   '#eef2f0',
          hover:   '#f0f4f2',
        },
        ink: {
          DEFAULT: '#1a2e22',
          muted:   '#5f7167',
          faint:   '#94a89c',
        },
        brand: {
          DEFAULT: '#22c55e',
          hover:   '#16a34a',
          light:   '#dcfce7',
          muted:   '#bbf7d0',
        },
        line: {
          DEFAULT: '#e5ebe8',
          focus:   '#86efac',
        },
        success: {
          DEFAULT: '#22c55e',
          light:   '#dcfce7',
        },
        danger: {
          DEFAULT: '#ef4444',
          light:   '#fee2e2',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light:   '#fef3c7',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(26, 46, 34, 0.04), 0 1px 2px rgba(26, 46, 34, 0.06)',
        'soft':    '0 4px 16px rgba(26, 46, 34, 0.06), 0 2px 6px rgba(26, 46, 34, 0.04)',
        'soft-lg': '0 12px 40px rgba(26, 46, 34, 0.08), 0 4px 12px rgba(26, 46, 34, 0.04)',
        'soft-xl': '0 20px 60px rgba(26, 46, 34, 0.10), 0 8px 20px rgba(26, 46, 34, 0.05)',
      },
    },
  },
  plugins: [],
};
