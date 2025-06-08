import baseConfig from '@extension/tailwindcss-config';
import { withUI } from '@extension/ui';

export default withUI({
  ...baseConfig,
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      fontFamily: {
        'google-sans': ['Google Sans', 'Roboto', 'Arial', 'sans-serif'],
      },
      colors: {
        ...baseConfig.theme?.extend?.colors,
        google: {
          blue: '#1a73e8',
          gray: {
            50: '#f8f9fa',
            100: '#f1f3f4',
            200: '#e8eaed',
            300: '#dadce0',
            400: '#bdc1c6',
            500: '#9aa0a6',
            600: '#5f6368',
            700: '#3c4043',
            800: '#202124',
            900: '#1a1a1a',
          },
          red: '#ea4335',
          green: '#34a853',
        },
      },
      animation: {
        'ai-pulse': 'ai-pulse 1.2s ease-in-out infinite',
      },
      keyframes: {
        'ai-pulse': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(26, 115, 232, 0.7)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.5)',
            boxShadow: '0 0 0 4px rgba(26, 115, 232, 0.3)',
          },
        },
      },
    },
  },
});
