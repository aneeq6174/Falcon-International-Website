import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1B2A4A',
        red: '#E23327',
        ink: '#221F1F',
        grey: '#5E5F5F',
        paper: '#F3F4F3',
        white: '#FFFFFF',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        stat: ['clamp(4rem, 12vw, 11rem)', { lineHeight: '0.85', letterSpacing: '-0.04em' }],
        h1: ['clamp(2.5rem, 8vw, 7rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        h2: ['clamp(1.75rem, 4.5vw, 3.5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        h3: ['clamp(1.125rem, 2vw, 1.5rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.22em' }],
      },
      spacing: {
        section: 'clamp(5rem, 10vw, 9rem)',
      },
      maxWidth: {
        shell: '80rem',
      },
    },
  },
  plugins: [],
};

export default config;
