// ============================================================================
// PHASE 1 - MILESTONE: TAILWIND CSS CONFIGURATION
// ============================================================================
// Tailwind CSS configuration for three-panel layout and component styling
// All code below is commented out until Phase 1 implementation begins
// ============================================================================

/*
// ============================================================================
// PHASE 1: Tailwind CSS Configuration
// ============================================================================
// Custom Tailwind configuration for Comet Browser UI
// Defines theme, colors, spacing, and responsive breakpoints

module.exports = {
  content: [
    './src/**/*.{html,js}',
    './src/index.html',
    './src/scripts/**/*.js'
  ],
  theme: {
    extend: {
      // ============================================================================
      // Custom Colors for Comet Browser Theme
      // ============================================================================
      colors: {
        // Primary brand colors
        comet: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // Primary brand color
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Dark theme colors
        dark: {
          bg: '#1a1a1a',
          surface: '#2d2d2d',
          border: '#404040',
          text: '#e5e5e5',
          muted: '#9ca3af',
        },
        // Light theme colors
        light: {
          bg: '#ffffff',
          surface: '#f9fafb',
          border: '#e5e7eb',
          text: '#111827',
          muted: '#6b7280',
        }
      },
      
      // ============================================================================
      // Custom Spacing for Three-Panel Layout
      // ============================================================================
      spacing: {
        'sidebar': '64px',      // Left sidebar width
        'panel': '320px',       // Right panel default width
        'navbar': '48px',       // Top navigation bar height
        'tab-bar': '36px',      // Tab bar height
      },
      
      // ============================================================================
      // Custom Z-Index Layers
      // ============================================================================
      zIndex: {
        'modal': '1000',
        'dropdown': '900',
        'navbar': '800',
        'sidebar': '700',
        'overlay': '600',
      },
      
      // ============================================================================
      // Custom Animations
      // ============================================================================
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'slide-out': 'slideOut 0.3s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      
      // ============================================================================
      // Custom Font Families
      // ============================================================================
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['Fira Code', 'monospace'],
      },
      
      // ============================================================================
      // Custom Border Radius
      // ============================================================================
      borderRadius: {
        'browser': '8px',  // Browser view border radius
        'panel': '6px',    // Panel border radius
        'button': '4px',   // Button border radius
      },
    },
  },
  
  // ============================================================================
  // Plugins
  // ============================================================================
  plugins: [
    // Form styling plugin
    require('@tailwindcss/forms'),
    // Typography plugin for rich text content
    require('@tailwindcss/typography'),
    // Custom scrollbar plugin
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-hidden': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      }
      addUtilities(newUtilities)
    },
  ],
  
  // ============================================================================
  // Dark Mode Configuration
  // ============================================================================
  darkMode: 'class', // Enable class-based dark mode
};

*/
