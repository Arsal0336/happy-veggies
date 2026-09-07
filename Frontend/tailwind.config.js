/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--hv-color-primary-50)',
          100: 'var(--hv-color-primary-100)',
          200: 'var(--hv-color-primary-200)',
          300: 'var(--hv-color-primary-300)',
          400: 'var(--hv-color-primary-400)',
          500: 'var(--hv-color-primary-500)',
          600: 'var(--hv-color-primary-600)',
          700: 'var(--hv-color-primary-700)',
          800: 'var(--hv-color-primary-800)',
          900: 'var(--hv-color-primary-900)',
        },
        surface: 'var(--hv-color-surface)',
        muted: 'var(--hv-color-text-muted)',
      },
      fontFamily: {
        sans: ['var(--hv-font-sans)'],
        display: ['var(--hv-font-display)'],
        urdu: ['var(--hv-urdu-font)'],
      },
      borderRadius: {
        hv: 'var(--hv-radius-md)',
        'hv-lg': 'var(--hv-radius-lg)',
      },
      boxShadow: {
        hv: 'var(--hv-shadow-md)',
        'hv-nav': 'var(--hv-shadow-nav)',
      },
    },
  },
  plugins: [],
};
