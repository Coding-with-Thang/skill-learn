# Theme System Documentation

## Overview

The skill-learn project uses a comprehensive, theme-aware color system that supports both light and dark modes. All colors are defined as CSS variables and automatically adapt when users switch themes.

## Available Themes

- **Light Mode** (default)
- **Dark Mode**

## Color Categories

### 1. Base Colors

Used for backgrounds and text throughout the application.

```jsx
// Background colors
className = "bg-background text-foreground";

// Card surfaces
className = "bg-card text-card-foreground";

// Popovers and dropdowns
className = "bg-popover text-popover-foreground";
```

### 2. Brand Colors

Theme-aware brand colors that adapt to light/dark mode.

```jsx
// Primary brand teal
className = "bg-brand-teal text-white";
className = "hover:bg-brand-teal-light";
className = "active:bg-brand-teal-dark";

// Brand dark blue
className = "bg-brand-dark-blue text-white";

// Brand cyan (for gradients)
className = "bg-brand-cyan";

// Gradient backgrounds
className = "bg-gradient-teal"; // Teal to cyan gradient
className = "bg-gradient-primary"; // Primary color gradient
```

### 3. Semantic Colors

#### Primary

Main action color, used for primary buttons and important UI elements.

```jsx
className = "bg-primary text-primary-foreground";
className = "hover:bg-primary-hover";
className = "active:bg-primary-active";
```

#### Secondary

Supporting actions and less prominent UI elements.

```jsx
className = "bg-secondary text-secondary-foreground";
className = "hover:bg-secondary-hover";
```

#### Accent

Highlights and special emphasis.

```jsx
className = "bg-accent text-accent-foreground";
className = "hover:bg-accent-hover";
```

#### Muted

Subdued backgrounds and disabled states.

```jsx
className = "bg-muted text-muted-foreground";
className = "hover:bg-muted-hover";
```

### 4. Status Colors

Communicate state and feedback to users.

#### Success

```jsx
className = "bg-success text-success-foreground";
className = "hover:bg-success-hover";
```

#### Warning

```jsx
className = "bg-warning text-warning-foreground";
className = "hover:bg-warning-hover";
```

#### Error

```jsx
className = "bg-error text-error-foreground";
className = "hover:bg-error-hover";
```

#### Info

```jsx
className = "bg-info text-info-foreground";
className = "hover:bg-info-hover";
```

#### Destructive

For dangerous actions like delete.

```jsx
className = "bg-destructive text-destructive-foreground";
className = "hover:bg-destructive-hover";
```

### 5. Game & Interactive Colors

Special colors for gamification features.

```jsx
// Game colors
className = "bg-game-primary";
className = "bg-game-secondary";
className = "bg-game-accent";
className = "bg-game-background";

// Gradient for game elements
className = "bg-gradient-game";

// Text gradient
className = "text-gradient-game";
```

### 6. Reward Colors

For achievements and rewards.

```jsx
className = "text-reward-gold";
className = "text-reward-silver";
className = "text-reward-bronze";
```

### 7. Border & Input Colors

```jsx
// Borders
className = "border border-border";

// Inputs
className = "border-input hover:border-input-hover focus:border-input-focus";

// Focus rings
className = "focus:ring-2 focus:ring-ring";
className = "focus:ring-ring-primary";
```

### 8. Chart Colors

For data visualizations.

```jsx
// In chart components
fill = "var(--chart-1)";
fill = "var(--chart-2)";
fill = "var(--chart-3)";
fill = "var(--chart-4)";
fill = "var(--chart-5)";
```

### 9. Sidebar Colors

Special colors for sidebar navigation.

```jsx
className = "bg-sidebar text-sidebar-foreground";
className = "bg-sidebar-primary text-sidebar-primary-foreground";
className = "bg-sidebar-accent text-sidebar-accent-foreground";
className = "border-sidebar-border";
```

## Shadows

Theme-aware shadows that adapt to light/dark mode.

```jsx
// Using Tailwind classes
className="shadow-theme-sm"
className="shadow-theme-md"
className="shadow-theme-lg"
className="shadow-theme-xl"
className="shadow-theme-2xl"

// Using CSS variables
style={{ boxShadow: 'var(--shadow-md)' }}
```

## Border Radius

Consistent border radius values.

```jsx
className = "rounded-sm"; // var(--radius-sm)
className = "rounded-4xld"; // var(--radius-md)
className = "rounded-lg"; // var(--radius-lg)
className = "rounded-xl"; // var(--radius-xl)
```

## Transitions

Standardized transition durations.

```jsx
// Using Tailwind
className="transition-fast"
className="transition-normal"
className="transition-slow"

// Using CSS variables
style={{ transition: 'var(--transition-normal)' }}
```

## Best Practices

### ✅ DO

1. **Always use CSS variables** for colors

   ```jsx
   // Good
   className="bg-primary text-primary-foreground"

   // Good
   style={{ color: 'var(--brand-teal)' }}
   ```

2. **Use semantic color names** that describe purpose, not appearance

   ```jsx
   // Good - describes purpose
   className = "bg-success";

   // Bad - describes appearance
   className = "bg-green-500";
   ```

3. **Pair colors with their foreground variants**

   ```jsx
   // Good - ensures readable text
   className = "bg-primary text-primary-foreground";

   // Bad - might have poor contrast
   className = "bg-primary text-white";
   ```

4. **Use theme-aware shadows**

   ```jsx
   // Good
   className="shadow-theme-md"

   // Bad
   style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
   ```

5. **Test in both light and dark modes**
   - Always verify your component looks good in both themes
   - Check hover and active states
   - Verify text contrast

### ❌ DON'T

1. **Don't use hard-coded color values**

   ```jsx
   // Bad
   className="bg-[#155d59]"
   style={{ backgroundColor: '#155d59' }}
   ```

2. **Don't use hard-coded rgba/hsl values**

   ```jsx
   // Bad
   style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
   style={{ color: 'hsl(180, 50%, 50%)' }}
   ```

3. **Don't mix theme-aware and hard-coded colors**

   ```jsx
   // Bad - inconsistent theming
   className="bg-primary"
   style={{ borderColor: '#155d59' }}
   ```

4. **Don't assume colors will look the same in both themes**
   ```jsx
   // Bad - might be invisible in dark mode
   className = "bg-white text-black";
   ```

## Migration Guide

### Replacing Hard-Coded Colors

#### Hex Colors

```jsx
// Before
className = "bg-[#155d59]";

// After
className = "bg-brand-teal";
```

#### RGB/RGBA Colors

```jsx
// Before
style={{ backgroundColor: 'rgba(21, 93, 89, 0.5)' }}

// After
className="bg-brand-teal/50" // Using Tailwind opacity
```

#### Shadows

```jsx
// Before
style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}

// After
className="shadow-theme-md"
```

#### Gradients

```jsx
// Before
style={{
  background: 'linear-gradient(135deg, #155d59, #40C9FF)'
}}

// After
className="bg-gradient-teal"
```

### Common Replacements

| Hard-Coded Value  | Theme Variable           | Tailwind Class               |
| ----------------- | ------------------------ | ---------------------------- |
| `#155d59`         | `var(--brand-teal)`      | `bg-brand-teal`              |
| `#1B1B53`         | `var(--brand-dark-blue)` | `bg-brand-dark-blue`         |
| `#0F172A`         | `var(--background)`      | `bg-background` (dark mode)  |
| `#ff6f61`         | `var(--game-primary)`    | `bg-game-primary`            |
| `#ffd700`         | `var(--reward-gold)`     | `text-reward-gold` |
| `rgba(0,0,0,0.1)` | `var(--shadow-md)`       | `shadow-theme-md`            |

## Examples

### Button Component

```jsx
// Primary button
<button className="bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active rounded-lg px-4 py-2 shadow-theme-sm transition-normal">
  Click Me
</button>

// Success button
<button className="bg-success text-success-foreground hover:bg-success-hover rounded-lg px-4 py-2">
  Save
</button>

// Destructive button
<button className="bg-destructive text-destructive-foreground hover:bg-destructive-hover rounded-lg px-4 py-2">
  Delete
</button>
```

### Card Component

```jsx
<div className="bg-card text-card-foreground rounded-xl p-6 shadow-theme-lg border border-border">
  <h2 className="text-2xl font-bold mb-4">Card Title</h2>
  <p className="text-muted-foreground">Card content goes here</p>
</div>
```

### Game Element

```jsx
<div className="bg-gradient-game rounded-4xl p-8 shadow-theme-xl">
  <h1 className="text-gradient-game text-4xl font-bold">Level Complete!</h1>
  <div className="flex gap-4 mt-4">
    <span className="text-reward-gold">🥇 Gold</span>
    <span className="text-reward-silver">🥈 Silver</span>
    <span className="text-reward-bronze">🥉 Bronze</span>
  </div>
</div>
```

### Input Field

```jsx
<input
  type="text"
  className="bg-background text-foreground border border-input hover:border-input-hover focus:border-input-focus focus:ring-2 focus:ring-ring rounded-lg px-4 py-2 transition-normal"
  placeholder="Enter text..."
/>
```

## Testing Checklist

When creating or updating components:

- [ ] Component renders correctly in light mode
- [ ] Component renders correctly in dark mode
- [ ] All text is readable (good contrast)
- [ ] Hover states work in both themes
- [ ] Active/pressed states work in both themes
- [ ] Focus indicators are visible in both themes
- [ ] Shadows look appropriate in both themes
- [ ] No hard-coded colors used
- [ ] All colors use CSS variables
- [ ] Gradients adapt to theme (if applicable)

## Troubleshooting

### Text is invisible or hard to read

- Make sure you're using the correct foreground color
- Always pair `bg-X` with `text-X-foreground`

### Colors don't change when switching themes

- Check that you're using CSS variables, not hard-coded values
- Verify the theme switcher is working
- Check browser console for errors

### Shadows look wrong in dark mode

- Use `shadow-theme-*` classes instead of regular `shadow-*`
- Theme-aware shadows automatically adjust for dark mode

### Component looks good in light mode but bad in dark mode

- Test all components in both themes during development
- Use semantic color names that adapt to theme
- Avoid assumptions about background colors

## Additional Resources

- **Theme Files**: `apps/lms/app/themes.css`
- **Global Styles**: `apps/lms/app/globals.css`
- **Tailwind Config**: `tailwind.config.mjs` (in each app)
- **Theme Switcher**: In `packages/ui` or app layout
- **Migration Reference**: `COLOR_MIGRATION_REFERENCE.md` (in docs/)
- **Quick Start**: `THEME_QUICK_START.md` (in docs/)
