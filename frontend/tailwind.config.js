/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', 'monospace'],
      },
      colors: {
        blue: { 50: '#eef1ff', 100: '#e0e6ff', 200: '#c6d0ff', 300: '#a3b2ff', 400: '#6b85ff', 500: '#3d5cff', 600: '#2b47f0', 700: '#2238c8', 800: '#1d2f9c', 900: '#172575', 950: '#0d1546' },
        /* ShadCN tokens */
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: { '1': 'hsl(var(--chart-1))', '2': 'hsl(var(--chart-2))', '3': 'hsl(var(--chart-3))', '4': 'hsl(var(--chart-4))', '5': 'hsl(var(--chart-5))' },

        /* Premium dark depth layers */
        layer: {
          0: '#000000',
          1: '#0a0a0f',
          2: '#111118',
          3: '#18181f',
          4: '#1e1e28',
          5: '#252530',
          6: '#2c2c38',
        },

        /* Brand palette */
        brand: {
          DEFAULT: '#00c896',
          50:  'rgba(0,200,150,0.05)',
          100: 'rgba(0,200,150,0.10)',
          200: 'rgba(0,200,150,0.18)',
          300: 'rgba(0,200,150,0.30)',
          400: '#00a87a',
          500: '#00c896',
          600: '#00e6aa',
          glow: 'rgba(0,200,150,0.25)',
        },

        /* Violet accent */
        violet: {
          DEFAULT: '#6f5ef5',
          50:  'rgba(111,94,245,0.05)',
          100: 'rgba(111,94,245,0.10)',
          200: 'rgba(111,94,245,0.18)',
          300: 'rgba(111,94,245,0.30)',
          500: '#6f5ef5',
          600: '#8b7ff8',
          glow: 'rgba(111,94,245,0.25)',
        },

        /* Danger */
        danger: {
          DEFAULT: '#ff4757',
          100: 'rgba(255,71,87,0.10)',
          200: 'rgba(255,71,87,0.18)',
          500: '#ff4757',
          600: '#ff6b7a',
        },

        /* Warning */
        warn: {
          DEFAULT: '#ffa733',
          100: 'rgba(255,167,51,0.10)',
          500: '#ffa733',
          600: '#ffb84d',
        },

        /* Ice blue */
        ice: {
          DEFAULT: '#38bdf8',
          100: 'rgba(56,189,248,0.10)',
          500: '#38bdf8',
        },

        /* Text */
        ink: {
          primary:   'rgba(255,255,255,0.96)',
          secondary: 'rgba(255,255,255,0.58)',
          muted:     'rgba(255,255,255,0.32)',
          ghost:     'rgba(255,255,255,0.16)',
        },

        /* Borders */
        edge: {
          subtle:  'rgba(255,255,255,0.05)',
          default: 'rgba(255,255,255,0.08)',
          strong:  'rgba(255,255,255,0.14)',
          brand:   'rgba(0,200,150,0.25)',
        },
      },

      borderRadius: {
        sm:   '10px',
        md:   '14px',
        lg:   '20px',
        xl:   '26px',
        '2xl':'32px',
        '3xl':'40px',
        '4xl':'48px',
        full: '9999px',
        /* ShadCN compat */
        DEFAULT: 'var(--radius)',
      },

      boxShadow: {
        'brand-glow':  '0 0 24px rgba(0,200,150,0.18), 0 0 80px rgba(0,200,150,0.06)',
        'violet-glow': '0 0 24px rgba(111,94,245,0.20), 0 0 80px rgba(111,94,245,0.06)',
        'card':        '0 8px 32px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.30)',
        'float':       '0 20px 60px rgba(0,0,0,0.60), 0 8px 24px rgba(0,0,0,0.40)',
        'btn-brand':   '0 4px 20px rgba(0,200,150,0.25), 0 1px 4px rgba(0,200,150,0.15)',
        'btn-brand-hover': '0 8px 30px rgba(0,200,150,0.35), 0 2px 8px rgba(0,200,150,0.20)',
        'nav':         '0 -2px 20px rgba(0,0,0,0.40), 0 8px 32px rgba(0,0,0,0.30)',
        'inset-brand': 'inset 0 1px 0 rgba(0,200,150,0.15)',
        'inset-white': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },

      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #00c896 0%, #00a87a 100%)',
        'gradient-brand-h': 'linear-gradient(90deg, #00c896 0%, #00e6aa 100%)',
        'gradient-violet':  'linear-gradient(135deg, #6f5ef5 0%, #8b7ff8 100%)',
        'gradient-dark':    'linear-gradient(180deg, #0a0a0f 0%, #000000 100%)',
        'gradient-surface': 'linear-gradient(135deg, #18181f 0%, #1e1e28 100%)',
        'gradient-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
        'gradient-hero':    'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,200,150,0.08) 0%, transparent 70%)',
        'gradient-card-border': 'linear-gradient(135deg, rgba(0,200,150,0.3) 0%, rgba(111,94,245,0.15) 50%, rgba(255,255,255,0.04) 100%)',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.04)' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'dot-pulse': {
          '0%, 100%': { transform: 'scale(0.8)', opacity: '0.5' },
          '50%':      { transform: 'scale(1.2)', opacity: '1' },
        },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'glow-pulse':     'glow-pulse 3s ease-in-out infinite',
        'float':          'float-gentle 4s ease-in-out infinite',
        'shimmer':        'shimmer 2.5s linear infinite',
        'fade-up':        'fade-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':        'fade-in 0.3s ease both',
        'scale-in':       'scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up':       'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'dot-pulse':      'dot-pulse 1.5s ease-in-out infinite',
        'spin-slow':      'spin 3s linear infinite',
      },

      transitionTimingFunction: {
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':   'cubic-bezier(0.16, 1, 0.3, 1)',
        'snappy':   'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },

      blur: {
        '2xs': '2px',
        xs:    '4px',
        '4xl': '80px',
        '5xl': '120px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
