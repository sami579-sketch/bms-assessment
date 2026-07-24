/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Bridgeway green
        bw: {
          green: '#3DB54A',
          greenDark: '#2a9e36',
          greenLight: '#e8f8ea',
          charcoal: '#4A5568',
          charcoalDark: '#2D3748',
        },
        // MedShop navy/blue
        ms: {
          navy: '#2B3A8F',
          navyDark: '#1e2a6e',
          navyLight: '#e8ebf9',
          blue: '#3B4BC8',
          cyan: '#00B4D8',
          cyanLight: '#e0f7fc',
          green: '#4CAF50',
        },
        clinical: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px 0 rgba(43,58,143,0.12)',
        field: '0 1px 2px 0 rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
