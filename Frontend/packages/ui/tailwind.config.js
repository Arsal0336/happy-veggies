import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(root, 'src/**/*.{ts,tsx}'),
    path.join(root, '../../apps/farmer-web/src/**/*.{ts,tsx}'),
    path.join(root, '../../apps/admin-web/src/**/*.{ts,tsx}'),
  ],
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
          DEFAULT: 'var(--hv-color-primary-600)',
          foreground: 'var(--hv-color-text-inverse)',
        },
        background: 'var(--hv-color-bg)',
        surface: 'var(--hv-color-surface)',
        border: 'var(--hv-color-border)',
        muted: 'var(--hv-color-text-muted)',
        foreground: 'var(--hv-color-text)',
        success: 'var(--hv-color-success)',
        warning: 'var(--hv-color-warning)',
        error: 'var(--hv-color-error)',
        info: 'var(--hv-color-info)',
        // Keep default neutral scale available for utility classes
        neutral: {
          0: 'var(--hv-color-neutral-0)',
          50: 'var(--hv-color-neutral-50)',
          100: 'var(--hv-color-neutral-100)',
          200: 'var(--hv-color-neutral-200)',
          300: 'var(--hv-color-neutral-300)',
          400: 'var(--hv-color-neutral-400)',
          500: 'var(--hv-color-neutral-500)',
          600: 'var(--hv-color-neutral-600)',
          700: 'var(--hv-color-neutral-700)',
          800: 'var(--hv-color-neutral-800)',
          900: 'var(--hv-color-neutral-900)',
        },
      },
      fontFamily: {
        sans: [
          'var(--hv-font-sans)',
          'Segoe UI',
          'Noto Nastaliq Urdu',
          'Noto Sans',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        sm: 'var(--hv-radius-sm)',
        DEFAULT: 'var(--hv-radius-md)',
        md: 'var(--hv-radius-md)',
        lg: 'var(--hv-radius-lg)',
        xl: 'var(--hv-radius-xl)',
      },
      boxShadow: {
        sm: 'var(--hv-shadow-sm)',
        DEFAULT: 'var(--hv-shadow-md)',
        md: 'var(--hv-shadow-md)',
        lg: 'var(--hv-shadow-lg)',
      },
    },
  },
  plugins: [],
};
