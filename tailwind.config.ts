import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:           '#0F0F10',
        surface:      '#141415',
        'surface-hover': '#1C1C1E',
        border:       'rgba(255,255,255,0.06)',
        'text-primary': '#EDEDF0',
        'text-muted':   'rgba(255,255,255,0.42)',
        accent:       '#7B61FF',
        success:      '#34D399',
        warning:      '#FBBF24',
        danger:       '#F87171',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        base: ['13px', '1.5'],
      },
      borderRadius: {
        btn:  '6px',
        card: '10px',
        chip: '999px',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.4)',
        modal: '0 8px 32px rgba(0,0,0,0.7)',
      },
    },
  },
  plugins: [],
}

export default config
