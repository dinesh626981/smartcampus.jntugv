/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Material 3 Dynamic Semantic Tokens
        md: {
          primary: 'var(--md-sys-color-primary, #0B57D0)',
          'on-primary': 'var(--md-sys-color-on-primary, #FFFFFF)',
          'primary-container': 'var(--md-sys-color-primary-container, #D3E3FD)',
          'on-primary-container': 'var(--md-sys-color-on-primary-container, #041E49)',
          surface: 'var(--md-sys-color-surface, #FFFFFF)',
          'on-surface': 'var(--md-sys-color-on-surface, #1F1F1F)',
          'surface-container': 'var(--md-sys-color-surface-container, #F8FAFD)',
          'surface-container-high': 'var(--md-sys-color-surface-container-high, #EDF2FA)',
          'dialog-surface': 'var(--md-sys-color-dialog-surface, #FFFFFF)',
          outline: 'var(--md-sys-color-outline, #747775)',
          'outline-variant': 'var(--md-sys-color-outline-variant, #C4C7C5)',
          'on-surface-variant': 'var(--md-sys-color-on-surface-variant, #444746)',
          error: 'var(--md-sys-color-error, #B3261E)',
          'error-container': 'var(--md-sys-color-error-container, #F9DEDC)',
          success: 'var(--md-sys-color-success, #146C2E)',
          'success-container': 'var(--md-sys-color-success-container, #C4EED0)',
          warning: 'var(--md-sys-color-warning, #B06000)',
          'warning-container': 'var(--md-sys-color-warning-container, #FDE8B3)',
        },
        // Google Blue scale (backward compatible with existing primary-* classes)
        primary: {
          50: '#E8F0FE',
          100: '#D3E3FD',
          200: '#A8C7FA',
          300: '#7CACF8',
          400: '#4285F4',
          500: '#1A73E8',
          600: '#0B57D0', // Google Primary Blue
          700: '#0842A0',
          800: '#042D6B',
          900: '#041E49',
        },
        // Google Secondary / Neutral Slate
        neutral: {
          50: '#F8FAFD',
          100: '#F1F3F4',
          200: '#E3E3E3',
          300: '#C4C7C5',
          400: '#8E918F',
          500: '#747775',
          600: '#5E615F',
          700: '#444746',
          800: '#2B2C2E',
          900: '#1F1F1F',
          950: '#131314',
        },
        slate: {
          50: '#F8FAFD',
          100: '#F1F3F4',
          200: '#E3E3E3',
          300: '#C4C7C5',
          400: '#8E918F',
          500: '#747775',
          600: '#5E615F',
          700: '#444746',
          800: '#2B2C2E',
          900: '#1F1F1F',
        },
        // Google Amber / Gold
        accent: {
          50: '#FEF7E0',
          100: '#FDE8B3',
          200: '#FCD679',
          300: '#FBC02D',
          400: '#F9AB00',
          500: '#B06000',
          600: '#8E4D00',
          700: '#6C3A00',
        },
      },
      fontFamily: {
        sans: ['"Google Sans"', '"Google Sans Text"', 'Figtree', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
      fontSize: {
        // Material 3 typography roles
        'm3-display': ['45px', { lineHeight: '52px', fontWeight: '400' }],
        'm3-headline-lg': ['32px', { lineHeight: '40px', fontWeight: '400' }],
        'm3-headline-sm': ['24px', { lineHeight: '32px', fontWeight: '400' }],
        'm3-title-md': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'm3-body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'm3-body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'm3-label-lg': ['14px', { lineHeight: '20px', fontWeight: '500', letterSpacing: '0.1px' }],
        'm3-label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      borderRadius: {
        'input': '4px',
        'chip': '8px',
        'card': '16px',
        'dialog': '28px',
      },
      boxShadow: {
        'm3-1': '0px 1px 3px 1px rgba(0, 0, 0, 0.08), 0px 1px 2px 0px rgba(0, 0, 0, 0.12)',
        'm3-2': '0px 2px 6px 2px rgba(0, 0, 0, 0.08), 0px 1px 2px 0px rgba(0, 0, 0, 0.15)',
        'm3-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.08), 0px 1px 3px 0px rgba(0, 0, 0, 0.15)',
        'dialog': '0px 8px 24px rgba(0, 0, 0, 0.14)',
      },
    },
  },
  plugins: [],
};
