# Theme System - Quick Start Guide

## 🎨 Overview

Your project now has a **comprehensive, theme-aware color system** that supports both light and dark modes. All colors automatically adapt when users switch themes.

## 🚀 Quick Start

### Using Theme Colors

```jsx
// ✅ Good - Theme-aware
<div className="bg-primary text-primary-foreground">
  <button className="bg-brand-teal hover:bg-brand-teal-light">
    Click Me
  </button>
</div>

// ❌ Bad - Hard-coded
<div style={{ backgroundColor: '#155d59', color: 'white' }}>
  <button style={{ backgroundColor: '#155d59' }}>
    Click Me
  </button>
</div>
```

### Common Patterns

```jsx
// Card
<div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-theme-md">

// Button
<button className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2">

// Input
<input className="bg-background border-input focus:border-input-focus focus:ring-2 focus:ring-ring rounded-lg px-4 py-2" />

// Success message
<div className="bg-success text-success-foreground rounded-lg p-4">

// Gradient
<div className="bg-gradient-teal text-white rounded-xl p-8">
```

## 📚 Documentation

| Document                                                               | Purpose                                        |
| ---------------------------------------------------------------------- | ---------------------------------------------- |
| **[THEME_SYSTEM_SUMMARY.md](./THEME_SYSTEM_SUMMARY.md)**               | Start here! Overview of changes and next steps |
| **[THEME_SYSTEM.md](./THEME_SYSTEM.md)**                               | Complete developer documentation               |
| **[COLOR_MIGRATION_REFERENCE.md](./COLOR_MIGRATION_REFERENCE.md)**     | Quick reference for migrating colors           |
| **[THEME_SYSTEM_ELEVATION_PLAN.md](./THEME_SYSTEM_ELEVATION_PLAN.md)** | Detailed implementation plan                   |
| **[hard-coded-colors-report.md](./hard-coded-colors-report.md)**       | Audit of existing hard-coded colors            |

## 🎯 Key Features

### ✨ Theme-Aware Colors

- **Brand colors**: Teal, dark blue, cyan
- **Semantic colors**: Success, warning, error, info
- **Game colors**: For gamification elements
- **Reward colors**: Gold, silver, bronze
- **Status colors**: All interactive states

### 🌓 Automatic Dark Mode

All colors adapt automatically:

```jsx
// This works in both light and dark mode
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Subtitle</p>
</div>
```

### 🎨 Utility Classes

Ready-to-use helpers:

```jsx
className = "bg-gradient-teal"; // Teal gradient
className = "bg-gradient-game"; // Game gradient
className = "text-gradient-teal"; // Gradient text
className = "shadow-theme-md"; // Theme-aware shadow
```

## 🔄 Migration Workflow

### 1. Find Hard-Coded Colors

Check `hard-coded-colors-report.md` for your component.

### 2. Replace with Theme Variables

Use `docs/COLOR_MIGRATION_REFERENCE.md` for quick lookups:

```jsx
// Before
className = "bg-[#155d59]";

// After
className = "bg-brand-teal";
```

### 3. Test Both Themes

- Light mode ✅
- Dark mode ✅
- Hover states ✅
- Active states ✅

### 4. Commit

```bash
git commit -m "feat: migrate ComponentName to theme system"
```

## 📋 Color Categories

### Base

- `bg-background` / `text-foreground`
- `bg-card` / `text-card-foreground`
- `bg-popover` / `text-popover-foreground`

### Brand

- `bg-brand-teal` / `bg-brand-teal-light` / `bg-brand-teal-dark`
- `bg-brand-dark-blue`
- `bg-brand-cyan`

### Semantic

- `bg-primary` / `text-primary-foreground` / `hover:bg-primary-hover`
- `bg-secondary` / `text-secondary-foreground`
- `bg-accent` / `text-accent-foreground`
- `bg-muted` / `text-muted-foreground`

### Status

- `bg-success` / `text-success-foreground`
- `bg-warning` / `text-warning-foreground`
- `bg-error` / `text-error-foreground`
- `bg-info` / `text-info-foreground`
- `bg-destructive` / `text-brand-tealestructive-foreground`

### Game

- `bg-game-primary` / `bg-game-secondary` / `bg-game-accent`
- `bg-game-background`
- `text-reward-gold` / `text-reward-silver` / `text-reward-bronze`

### Borders & Inputs

- `border-border`
- `border-input` / `hover:border-input-hover` / `focus:border-input-focus`
- `focus:ring-2 focus:ring-ring`

## 🎬 Demo Component

See a live example of all theme features:

```jsx
import ThemeSystemDemo from "@/components/ThemeSystemDemo";

// Use in a page to see all colors and features
<ThemeSystemDemo />;
```

## ⚡ Quick Tips

1. **Always pair backgrounds with foregrounds**

   ```jsx
   className = "bg-primary text-primary-foreground";
   ```

2. **Use theme-aware shadows**

   ```jsx
   className = "shadow-theme-md"; // Not shadow-md
   ```

3. **Test in both themes**
   - Toggle theme switcher
   - Check all interactive states

4. **Use semantic names**

   ```jsx
   className = "bg-success"; // Not bg-green-500
   ```

5. **Leverage opacity modifiers**
   ```jsx
   className = "bg-brand-teal/50"; // 50% opacity
   ```

## 🆘 Common Issues

### Text is invisible

**Problem**: Using wrong foreground color  
**Solution**: Always pair `bg-X` with `text-X-foreground`

### Colors don't change with theme

**Problem**: Using hard-coded values  
**Solution**: Use CSS variables via Tailwind classes

### Shadows look wrong in dark mode

**Problem**: Using regular shadow classes  
**Solution**: Use `shadow-theme-*` classes

## 📖 Learn More

- **Full docs**: `THEME_SYSTEM.md`
- **Migration guide**: `COLOR_MIGRATION_REFERENCE.md`
- **Summary**: `THEME_SYSTEM_SUMMARY.md`

## 🎉 You're Ready!

Start migrating components using the theme system. Begin with high-priority components and work your way through the list in `THEME_SYSTEM_SUMMARY.md`.

**Happy theming! 🎨**
