/**
 * Font Utilities
 * 
 * This file provides utility functions and classes for using fonts consistently
 * throughout the application.
 */

import { fonts, fontWeights, fontSizes, lineHeights } from '@/config/fonts'

// Tailwind CSS classes for different font families
export const fontClasses = {
  sans: 'font-sans',
  mono: 'font-mono', 
  display: 'font-display'
}

// Tailwind CSS classes for font weights
export const weightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold'
}

// Tailwind CSS classes for font sizes
export const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl'
}

// Tailwind CSS classes for line heights
export const lineHeightClasses = {
  none: 'leading-none',
  tight: 'leading-tight',
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose'
}

// Helper function to combine font classes
export const getFontClasses = (family = 'sans', weight = 'normal', size = 'base', lineHeight = 'normal') => {
  return [
    fontClasses[family],
    weightClasses[weight],
    sizeClasses[size],
    lineHeightClasses[lineHeight]
  ].filter(Boolean).join(' ')
}

// Common typography combinations
export const typography = {
  // Headings
  h1: getFontClasses('display', 'bold', '5xl', 'tight'),
  h2: getFontClasses('display', 'bold', '4xl', 'tight'),
  h3: getFontClasses('display', 'semibold', '3xl', 'snug'),
  h4: getFontClasses('display', 'semibold', '2xl', 'snug'),
  h5: getFontClasses('sans', 'semibold', 'xl', 'snug'),
  h6: getFontClasses('sans', 'semibold', 'lg', 'snug'),
  
  // Body text
  body: getFontClasses('sans', 'normal', 'base', 'relaxed'),
  bodyLarge: getFontClasses('sans', 'normal', 'lg', 'relaxed'),
  bodySmall: getFontClasses('sans', 'normal', 'sm', 'normal'),
  
  // UI elements
  button: getFontClasses('sans', 'medium', 'base', 'normal'),
  label: getFontClasses('sans', 'medium', 'sm', 'normal'),
  caption: getFontClasses('sans', 'normal', 'xs', 'normal'),
  
  // Code
  code: getFontClasses('mono', 'normal', 'sm', 'normal'),
  codeBlock: getFontClasses('mono', 'normal', 'base', 'relaxed'),
}

// Export the original font configuration for direct access
export { fonts, fontWeights, fontSizes, lineHeights }
