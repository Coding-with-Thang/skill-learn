/**
 * Centralized Font Configuration
 * 
 * This file serves as the single source of truth for all fonts used in the application.
 * To change fonts globally, update the values in this file.
 */

// Modern, stylish fonts that are commonly used and well-supported
export const fonts = {
  // Primary sans-serif font - Inter is modern, clean, and highly readable
  sans: [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif'
  ],
  
  // Monospace font - JetBrains Mono is modern and developer-friendly
  mono: [
    '"JetBrains Mono"',
    '"SF Mono"',
    'Monaco',
    '"Cascadia Code"',
    '"Roboto Mono"',
    'Consolas',
    '"Courier New"',
    'monospace'
  ],
  
  // Display font - Poppins is modern, friendly, and great for headings
  display: [
    'Poppins',
    '"Fredoka One"',
    '"Comic Sans MS"',
    'cursive',
    'sans-serif'
  ]
}

// Font weights for consistent typography
export const fontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800'
}

// Font sizes for consistent typography scale
export const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
}

// Line heights for consistent typography
export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2'
}

// Helper function to get font family as CSS string
export const getFontFamily = (type = 'sans') => {
  return fonts[type].join(', ')
}

// Helper function to get font family as CSS variable
export const getFontVariable = (type = 'sans') => {
  return `var(--font-${type})`
}
