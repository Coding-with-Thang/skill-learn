# Theme System Guide

This guide explains how to use the uniform color theme system throughout the project.

## Overview

The project uses a comprehensive CSS variable-based theming system that supports:

- Light and Dark themes (built-in)
- Custom themes (Ocean, Sunset)
- Semantic color naming
- Interactive states (hover, active, disabled)
- Consistent color usage across components

## Color System Structure

### Core Semantic Colors

```css
--background          /* Main background color */
--foreground         /* Main text color */
--card               /* Card background */
--card-foreground    /* Card text */
--popover            /* Popover background */
--popover-foreground /* Popover text */
```

### Primary Brand Colors

```css
--primary            /* Primary brand color */
--primary-foreground /* Text on primary */
--primary-hover      /* Primary hover state */
--primary-active     /* Primary active state */
--primary-disabled   /* Primary disabled state */
```

### Secondary Colors

```css
--secondary            /* Secondary color */
--secondary-foreground /* Text on secondary */
--secondary-hover      /* Secondary hover */
--secondary-active     /* Secondary active */
```

### Semantic Status Colors

```css
--success / --success-foreground / --success-hover
--warning / --warning-foreground / --warning-hover
--error / --error-foreground / --error-hover
--info / --info-foreground / --info-hover
```

### Interactive Elements

```css
--destructive / --destructive-foreground / --destructive-hover
--border / --input / --ring
```

### Special Purpose Colors

```css
--game-primary / --game-secondary / --game-accent
--reward-gold / --reward-silver / --reward-bronze
--points-primary / --points-secondary
--chart-1 through --chart-5
```

## Usage Guidelines

### 1. Using Tailwind Classes

The color system is mapped to Tailwind classes for easy use:

```jsx
// Primary button
<button className="bg-primary text-primary-foreground hover:bg-primary-hover">
  Click me
</button>

// Success status
<div className="bg-success text-success-foreground">
  Success message
</div>

// Card with hover effect
<div className="bg-card text-card-foreground border border-border hover:shadow-md">
  Card content
</div>
```

### 2. Using CSS Variables Directly

For custom styling, use CSS variables:

```jsx
<div
  style={{
    backgroundColor: "var(--primary)",
    color: "var(--primary-foreground)",
  }}
>
  Custom styled element
</div>
```

### 3. Using Color Utilities

Import the color utilities for programmatic color access:

```jsx
import {
  semanticColors,
  interactiveColors,
  colorCombinations,
} from "@/lib/utils/colors";

// Get semantic colors
const successBg = semanticColors.success.bg;

// Get interactive colors
const primaryHover = interactiveColors.primary.hover;

// Use predefined combinations
const buttonClasses = colorCombinations.button.primary.default;
```

### 4. Component Patterns

#### Buttons

```jsx
// Primary button
<button className="bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled disabled:opacity-50 px-4 py-2 rounded transition-colors duration-normal">
  Primary Button
</button>

// Secondary button
<button className="bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active px-4 py-2 rounded transition-colors duration-normal">
  Secondary Button
</button>

// Destructive button
<button className="bg-destructive text-brand-tealestructive-foreground hover:bg-destructive-hover px-4 py-2 rounded transition-colors duration-normal">
  Delete
</button>
```

#### Cards

```jsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-normal">
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-muted-foreground">Card content</p>
</div>
```

#### Inputs

```jsx
<input
  className="bg-input border border-border rounded px-3 py-2 hover:bg-input-hover focus:bg-input-focus focus:ring-2 focus:ring-ring-primary transition-colors duration-normal"
  placeholder="Enter text..."
/>
```

#### Status Indicators

```jsx
// Success
<div className="bg-success text-success-foreground px-3 py-2 rounded">
  Success message
</div>

// Warning
<div className="bg-warning text-warning-foreground px-3 py-2 rounded">
  Warning message
</div>

// Error
<div className="bg-error text-error-foreground px-3 py-2 rounded">
  Error message
</div>

// Info
<div className="bg-info text-info-foreground px-3 py-2 rounded">
  Info message
</div>
```

## Theme Switching

The project supports multiple themes:

### Built-in Themes

- **Light**: Default light theme
- **Dark**: Dark theme (activated with `dark` class)

### Custom Themes

- **Ocean**: Deep blue theme with teal accents
- **Sunset**: Warm theme with coral and lavender

### Theme Switcher Component

```jsx
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

// Use in your layout
<ThemeSwitcher />;
```

## Best Practices

### 1. Always Use Theme Variables

❌ Don't use hardcoded colors:

```jsx
<div className="bg-blue-500 text-white">Content</div>
```

✅ Use theme variables:

```jsx
<div className="bg-primary text-primary-foreground">Content</div>
```

### 2. Use Semantic Colors

❌ Don't use generic colors for specific purposes:

```jsx
<div className="bg-red-500">Error message</div>
```

✅ Use semantic colors:

```jsx
<div className="bg-error text-error-foreground">Error message</div>
```

### 3. Include Interactive States

Always include hover, active, and disabled states:

```jsx
<button className="bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled disabled:opacity-50">
  Button
</button>
```

### 4. Use Consistent Transitions

Apply consistent transition durations:

```jsx
<div className="transition-colors duration-normal hover:bg-accent">
  Interactive element
</div>
```

### 5. Test Across Themes

Always test your components across all available themes to ensure proper contrast and readability.

## Adding New Themes

To add a new theme:

1. Add theme variables to `src/app/themes.css`:

```css
[data-theme="forest"] {
  --background: #1a2e1a;
  --foreground: #e8f5e8;
  --primary: #4ade80;
  --primary-foreground: #1a2e1a;
  /* ... other variables */
}
```

2. Add the theme to the ThemeSwitcher component:

```jsx
const THEMES = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Ocean", value: "ocean" },
  { label: "Sunset", value: "sunset" },
  { label: "Forest", value: "forest" }, // New theme
];
```

## Accessibility Considerations

### Contrast Ratios

All color combinations meet WCAG AA standards:

- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio

### Color Blind Friendly

The color system includes:

- High contrast alternatives
- Non-color indicators (icons, patterns)
- Semantic meaning beyond color

### Focus Indicators

Always include visible focus indicators:

```jsx
<button className="focus:ring-2 focus:ring-ring-primary focus:outline-none">
  Accessible button
</button>
```

## Troubleshooting

### Colors Not Updating

1. Check that CSS variables are properly defined
2. Ensure Tailwind classes are using the correct variable names
3. Verify theme switching is working correctly

### Inconsistent Colors

1. Use the color utilities for consistent access
2. Avoid hardcoded colors
3. Test across all themes

### Performance Issues

1. Use CSS variables instead of JavaScript color manipulation
2. Minimize theme switching frequency
3. Use efficient selectors in CSS

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [WCAG Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
