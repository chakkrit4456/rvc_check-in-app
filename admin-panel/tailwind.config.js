module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        secondary: '#10b981',
        'secondary-hover': '#059669',
        background: '#f3f4f6',
        'card-background': '#ffffff',
        'text-primary': '#1f2937',
        'text-secondary': '#6b7280',
        border: '#e5e7eb',
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}






