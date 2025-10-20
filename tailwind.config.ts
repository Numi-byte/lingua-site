import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1200px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f3f7ff',
          100: '#e6effe',
          200: '#cbdcfd',
          300: '#a3c0fc',
          400: '#6c98fa',
          500: '#3c6cf7',   // primary
          600: '#284fe5',
          700: '#213dc0',
          800: '#1e3699',
          900: '#1c327a',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.08)',
        ring: '0 0 0 8px rgba(60,108,247,0.12)',
      },
      backgroundImage: {
        'radial-fade':
          'radial-gradient(1200px 600px at 80% -10%, rgba(60,108,247,.18), transparent 60%), radial-gradient(800px 500px at 0% 10%, rgba(99,102,241,.12), transparent 60%)',
      },
    },
  },
  plugins: [],
}
export default config
