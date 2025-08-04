/**
 * Color utility functions for consistent theming
 * Provides helper functions for accessing theme colors and creating color combinations
 */

/**
 * Get a color value from CSS variables
 * @param {string} colorName - The color variable name (e.g., 'primary', 'success')
 * @param {string} variant - The color variant (e.g., 'hover', 'active', 'foreground')
 * @returns {string} The CSS variable reference
 */
export function getColor(colorName, variant = "DEFAULT") {
  if (variant === "DEFAULT") {
    return `var(--${colorName})`;
  }
  return `var(--${colorName}-${variant})`;
}

/**
 * Get semantic color values
 */
export const semanticColors = {
  // Success states
  success: {
    bg: "var(--success)",
    text: "var(--success-foreground)",
    hover: "var(--success-hover)",
  },

  // Warning states
  warning: {
    bg: "var(--warning)",
    text: "var(--warning-foreground)",
    hover: "var(--warning-hover)",
  },

  // Error states
  error: {
    bg: "var(--error)",
    text: "var(--error-foreground)",
    hover: "var(--error-hover)",
  },

  // Info states
  info: {
    bg: "var(--info)",
    text: "var(--info-foreground)",
    hover: "var(--info-hover)",
  },
};

/**
 * Get interactive color values
 */
export const interactiveColors = {
  // Primary interactions
  primary: {
    bg: "var(--primary)",
    text: "var(--primary-foreground)",
    hover: "var(--primary-hover)",
    active: "var(--primary-active)",
    disabled: "var(--primary-disabled)",
  },

  // Secondary interactions
  secondary: {
    bg: "var(--secondary)",
    text: "var(--secondary-foreground)",
    hover: "var(--secondary-hover)",
    active: "var(--secondary-active)",
  },

  // Accent interactions
  accent: {
    bg: "var(--accent)",
    text: "var(--accent-foreground)",
    hover: "var(--accent-hover)",
    active: "var(--accent-active)",
  },
};

/**
 * Get game-specific colors
 */
export const gameColors = {
  primary: "var(--game-primary)",
  secondary: "var(--game-secondary)",
  accent: "var(--game-accent)",
};

/**
 * Get reward colors
 */
export const rewardColors = {
  gold: "var(--reward-gold)",
  silver: "var(--reward-silver)",
  bronze: "var(--reward-bronze)",
};

/**
 * Get points colors
 */
export const pointsColors = {
  primary: "var(--points-primary)",
  secondary: "var(--points-secondary)",
};

/**
 * Get chart colors
 */
export const chartColors = {
  1: "var(--chart-1)",
  2: "var(--chart-2)",
  3: "var(--chart-3)",
  4: "var(--chart-4)",
  5: "var(--chart-5)",
};

/**
 * Get sidebar colors
 */
export const sidebarColors = {
  bg: "var(--sidebar)",
  text: "var(--sidebar-foreground)",
  primary: "var(--sidebar-primary)",
  "primary-text": "var(--sidebar-primary-foreground)",
  accent: "var(--sidebar-accent)",
  "accent-text": "var(--sidebar-accent-foreground)",
  border: "var(--sidebar-border)",
  ring: "var(--sidebar-ring)",
};

/**
 * Get shadow values
 */
export const shadows = {
  sm: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
  xl: "var(--shadow-xl)",
};

/**
 * Get transition values
 */
export const transitions = {
  fast: "var(--transition-fast)",
  normal: "var(--transition-normal)",
  slow: "var(--transition-slow)",
};

/**
 * Create a color class name for Tailwind
 * @param {string} colorType - The color type (e.g., 'bg', 'text', 'border')
 * @param {string} colorName - The color name (e.g., 'primary', 'success')
 * @param {string} variant - The color variant (e.g., 'hover', 'active')
 * @returns {string} The Tailwind class name
 */
export function createColorClass(colorType, colorName, variant = "") {
  if (variant) {
    return `${colorType}-${colorName}-${variant}`;
  }
  return `${colorType}-${colorName}`;
}

/**
 * Get common color combinations for different UI states
 */
export const colorCombinations = {
  // Button states
  button: {
    primary: {
      default: "bg-primary text-primary-foreground",
      hover: "hover:bg-primary-hover",
      active: "active:bg-primary-active",
      disabled: "disabled:bg-primary-disabled disabled:opacity-50",
    },
    secondary: {
      default: "bg-secondary text-secondary-foreground",
      hover: "hover:bg-secondary-hover",
      active: "active:bg-secondary-active",
    },
    destructive: {
      default: "bg-destructive text-destructive-foreground",
      hover: "hover:bg-destructive-hover",
    },
  },

  // Card states
  card: {
    default: "bg-card text-card-foreground border border-border",
    hover: "hover:shadow-md transition-shadow duration-normal",
  },

  // Input states
  input: {
    default: "bg-input border border-border",
    hover: "hover:bg-input-hover",
    focus: "focus:bg-input-focus focus:ring-2 focus:ring-ring-primary",
  },

  // Status indicators
  status: {
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    error: "bg-error text-error-foreground",
    info: "bg-info text-info-foreground",
  },
};

/**
 * Get theme-aware color utilities for common patterns
 */
export const themeUtils = {
  // Text colors
  text: {
    primary: "text-foreground",
    secondary: "text-muted-foreground",
    accent: "text-accent-foreground",
    success: "text-success-foreground",
    warning: "text-warning-foreground",
    error: "text-error-foreground",
  },

  // Background colors
  bg: {
    primary: "bg-background",
    secondary: "bg-card",
    accent: "bg-accent",
    muted: "bg-muted",
  },

  // Border colors
  border: {
    default: "border-border",
    primary: "border-primary",
    accent: "border-accent",
  },

  // Ring colors
  ring: {
    primary: "ring-ring-primary",
    secondary: "ring-ring-secondary",
  },
};

export default {
  getColor,
  semanticColors,
  interactiveColors,
  gameColors,
  rewardColors,
  pointsColors,
  chartColors,
  sidebarColors,
  shadows,
  transitions,
  createColorClass,
  colorCombinations,
  themeUtils,
};
