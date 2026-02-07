# Color Migration Reference

This file provides quick reference for migrating hard-coded colors to theme variables.

## Quick Reference Table

### Brand Colors
| Hard-Coded | CSS Variable | Tailwind Class | Usage |
|-----------|--------------|----------------|-------|
| `#155d59` | `var(--brand-teal)` | `bg-brand-teal` | Primary brand color |
| `#124a47` | `var(--brand-teal-dark)` | `bg-brand-teal-dark` | Darker teal variant |
| `#1B1B53` | `var(--brand-dark-blue)` | `bg-brand-dark-blue` | Secondary brand color |
| `#40C9FF`, `#3FA7D6`, `#48B1BF` | `var(--brand-cyan)` | `bg-brand-cyan` | Cyan for gradients |

### Game Colors
| Hard-Coded | CSS Variable | Tailwind Class |
|-----------|--------------|----------------|
| `#ff6f61` | `var(--game-primary)` | `bg-game-primary` |
| `#92a8d1` | `var(--game-secondary)` | `bg-game-secondary` |
| `#ff9800` | `var(--game-accent)` | `bg-game-accent` |
| `#94D1CF`, `#7CB9B6`, `#5DA39F` | `var(--game-background)` | `bg-game-background` |

### Reward Colors
| Hard-Coded | CSS Variable | Tailwind Class |
|-----------|--------------|----------------|
| `#ffd700` | `var(--reward-gold)` | `text-reward-gold` |
| `#c0c0c0` | `var(--reward-silver)` | `text-reward-silver` |
| `#cd7f32` | `var(--reward-bronze)` | `text-reward-bronze` |

### Chart Colors
| Hard-Coded | CSS Variable | Tailwind Class |
|-----------|--------------|----------------|
| `#0088FE` | `var(--chart-1)` | `fill-chart-1` |
| `#00C49F` | `var(--chart-2)` | `fill-chart-2` |
| `#FFBB28` | `var(--chart-3)` | `fill-chart-3` |
| `#FF8042` | `var(--chart-4)` | `fill-chart-4` |
| `#8884D8` | `var(--chart-5)` | `fill-chart-5` |
| `#0ea5e9` | `var(--chart-1)` | `stroke-chart-1` |
| `#e5e7eb` | `var(--border)` | `stroke-border` |
| `#888888` | `var(--muted-foreground)` | `stroke-muted-foreground` |

### Semantic Colors
| Hard-Coded | CSS Variable | Tailwind Class | Purpose |
|-----------|--------------|----------------|---------|
| `#2563eb` | `var(--info)` | `bg-info` | Information |
| Green shades | `var(--success)` | `bg-success` | Success states |
| Yellow/Orange | `var(--warning)` | `bg-warning` | Warnings |
| Red shades | `var(--error)` | `bg-error` | Errors |

### Background Colors
| Hard-Coded | CSS Variable | Tailwind Class | Context |
|-----------|--------------|----------------|---------|
| `#0F172A` | `var(--background)` | `bg-background` | Dark mode bg |
| `#1E293B` | `var(--card)` | `bg-card` | Dark mode card |
| `#EAEDF5` | `var(--background)` | `bg-background` | Light mode bg |
| `white`, `#ffffff` | `var(--card)` | `bg-card` | Light mode card |

### Text Colors
| Hard-Coded | CSS Variable | Tailwind Class | Context |
|-----------|--------------|----------------|---------|
| `#4F67E1` | `var(--primary)` | `text-primary` | Primary text |
| `#1B1B53` | `var(--foreground)` | `text-foreground` | Main text |
| `#5865F2`, `#4752c4` | `var(--primary)` | `bg-primary` | Button colors |

## Shadow Replacements

### RGBA Shadows → Theme Variables

```jsx
// Before: rgba(0,0,0,0.1)
style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
// After:
className="shadow-theme-sm"

// Before: rgba(0,0,0,0.15)
style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.15)' }}
// After:
className="shadow-theme-md"

// Before: rgba(0,0,0,0.2)
style={{ boxShadow: '0 10px 15px rgba(0,0,0,0.2)' }}
// After:
className="shadow-theme-lg"

// Before: rgba(0,0,0,0.25)
style={{ boxShadow: '0 20px 25px rgba(0,0,0,0.25)' }}
// After:
className="shadow-theme-xl"
```

### Specific Shadow Patterns

```jsx
// Before:
shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]
// After:
shadow-theme-md

// Before:
shadow-[0_20px_40px_rgba(0,0,0,0.12)]
// After:
shadow-theme-lg

// Before:
shadow-[0_40px_80px_rgba(0,0,0,0.08)]
// After:
shadow-theme-xl
```

## Gradient Replacements

### Teal Gradients
```jsx
// Before:
style={{ background: 'linear-gradient(135deg, #155d59, #40C9FF)' }}
// After:
className="bg-gradient-teal"

// Before:
className="bg-gradient-to-br from-[#94D1CF] via-[#7CB9B6] to-[#5DA39F]"
// After:
className="bg-gradient-teal"
```

### Game Gradients
```jsx
// Before:
style={{ background: 'linear-gradient(135deg, #ff6f61, #92a8d1)' }}
// After:
className="bg-gradient-game"

// Before:
className="bg-gradient-to-br from-[#40C9FF] via-[#3FA7D6] to-[#48B1BF]"
// After:
className="bg-gradient-game"
```

### Radial Gradients
```jsx
// Before:
className="bg-[radial-gradient(circle_at_50%_0%,rgba(130,140,230,0.15),transparent_70%)]"
// After:
className="bg-accent/15" // Use theme color with opacity

// Before:
className="bg-[radial-gradient(circle_at_30%_20%,rgba(27,27,83,0.05),transparent_50%)]"
// After:
className="bg-brand-dark-blue/5" // Use theme color with opacity
```

## Component-Specific Migrations

### Buttons
```jsx
// Before:
<button className="bg-[#5865F2] hover:bg-[#4752c4] text-white">

// After:
<button className="bg-primary hover:bg-primary-hover text-primary-foreground">
```

### Cards
```jsx
// Before:
<div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)]">

// After:
<div className="bg-card rounded-3xl shadow-theme-xl">
```

### Inputs
```jsx
// Before:
<input className="border-[#e5e7eb] focus:border-[#155d59]">

// After:
<input className="border-border focus:border-input-focus">
```

### Text
```jsx
// Before:
<h1 className="text-[#1B1B53]">

// After:
<h1 className="text-foreground">
```

### Game Elements
```jsx
// Before:
<div className="bg-gradient-to-br from-[#94D1CF] to-[#5DA39F] text-[#155d59]">

// After:
<div className="bg-gradient-game text-brand-teal">
```

## Opacity Modifiers

Use Tailwind's opacity modifiers instead of rgba:

```jsx
// Before:
style={{ backgroundColor: 'rgba(21, 93, 89, 0.5)' }}

// After:
className="bg-brand-teal/50"

// Before:
style={{ color: 'rgba(27, 27, 83, 0.8)' }}

// After:
className="text-brand-dark-blue/80"
```

## Dark Mode Specific

Some colors need different values in dark mode. The theme system handles this automatically:

```jsx
// This automatically adapts:
className="bg-background text-foreground"

// Light mode: white background, dark text
// Dark mode: dark background, light text

// This also adapts:
className="bg-card border-border"

// Light mode: white card, light border
// Dark mode: dark card, darker border
```

## Search & Replace Patterns

Use these regex patterns in your editor:

### Find hex colors:
```regex
#[0-9a-fA-F]{6}
```

### Find rgba colors:
```regex
rgba?\([^)]+\)
```

### Find hard-coded shadows:
```regex
shadow-\[[^\]]+\]
```

### Find hard-coded backgrounds:
```regex
bg-\[#[0-9a-fA-F]{6}\]
```

## Common Mistakes to Avoid

1. **Don't mix theme and hard-coded colors:**
   ```jsx
   // Bad
   <div className="bg-primary" style={{ borderColor: '#155d59' }}>
   
   // Good
   <div className="bg-primary border-primary">
   ```

2. **Don't forget foreground colors:**
   ```jsx
   // Bad - might be unreadable
   <div className="bg-primary">
   
   // Good
   <div className="bg-primary text-primary-foreground">
   ```

3. **Don't use white/black directly:**
   ```jsx
   // Bad
   className="bg-white text-black"
   
   // Good
   className="bg-background text-foreground"
   ```

4. **Don't hard-code opacity:**
   ```jsx
   // Bad
   style={{ backgroundColor: 'rgba(21, 93, 89, 0.5)' }}
   
   // Good
   className="bg-brand-teal/50"
   ```

## Testing After Migration

After migrating colors, test:

1. ✅ Component in light mode
2. ✅ Component in dark mode
3. ✅ Hover states in both modes
4. ✅ Active/pressed states in both modes
5. ✅ Focus states in both modes
6. ✅ Text readability in both modes
7. ✅ Shadows look appropriate in both modes

## Need Help?

- See full documentation: `THEME_SYSTEM.md`
- View implementation plan: `THEME_SYSTEM_ELEVATION_PLAN.md`
- Check color audit: `hard-coded-colors-report.md`

