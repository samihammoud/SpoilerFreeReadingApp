/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        crimson:  ['"Crimson Text"',     'Georgia', 'serif'],
      },
      colors: {
        brand: {
          gold:    '#c8a048',
          'gold-light': '#d4b058',
          'gold-dark':  '#7a5820',
        },
        surface: {
          base:   '#0f0d0a',
          dark:   '#0a0805',
          card:   '#171410',
          inset:  '#151210',
          border: '#242018',
          'border-hover': '#38321e',
        },
        ink: {
          DEFAULT: '#eae4d8',
          muted:   '#b8a888',
          subtle:  '#5a4e36',
          faint:   '#3e3620',
          ghost:   '#302a18',
        },
      },
      keyframes: {
        fadeUp:      { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:      { from: { opacity: '0' },                                to: { opacity: '1' } },
        popIn:       { from: { opacity: '0', transform: 'scale(0.95)' },      to: { opacity: '1', transform: 'scale(1)' } },
        shimmer:     { '0%,100%': { opacity: '0.4' }, '50%': { opacity: '1' } },
        floatY:      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight:  { from: { transform: 'translateX(100%)' },               to: { transform: 'translateX(0)' } },
        revealDown:  { from: { opacity: '0', transform: 'translateY(-10px)' },to: { opacity: '1', transform: 'translateY(0)' } },
        spin:        { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-up':     'fadeUp 0.34s cubic-bezier(0.22,0.68,0,1.15) both',
        'fade-in':     'fadeIn 0.2s ease both',
        'pop-in':      'popIn 0.25s cubic-bezier(0.22,0.68,0,1.2) both',
        shimmer:       'shimmer 2s ease infinite',
        'float-y':     'floatY 3s ease-in-out infinite',
        'slide-up':    'slideUp 0.5s cubic-bezier(0.22,0.68,0,1.2) both',
        'slide-right': 'slideRight 0.28s cubic-bezier(0.22,0.68,0,1.1) both',
        'reveal-down': 'revealDown 0.35s cubic-bezier(0.22,0.68,0,1.1) both',
        spin:          'spin 0.7s linear infinite',
      },
    },
  },
  plugins: [],
}
