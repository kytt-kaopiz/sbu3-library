/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E8F6FC',
          100: '#B3E0F5',
          400: '#5BC4ED',
          500: '#29ABE2',
          600: '#1A8BBF',
          700: '#136B94',
        },
        sbu: {
          red: '#E83B2A',
          redLight: '#FDECEA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.35s ease',
        'fade-in': 'fadeIn 0.25s ease',
        'slide-in': 'slideIn 0.3s ease',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { opacity: 0, transform: 'translateX(20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      }
    }
  },
  plugins: []
}
