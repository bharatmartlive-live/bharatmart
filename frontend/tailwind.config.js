/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        navy: '#15174f',
        brand: '#ff9f1c',
        accent: '#1d72f2',
        cream: '#fffaf1'
      },
      boxShadow: {
        soft: '0 18px 40px rgba(15, 23, 42, 0.12)'
      },
      backgroundImage: {
        'hero-grid':
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};
