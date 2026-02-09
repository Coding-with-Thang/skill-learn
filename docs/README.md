# Theme System Documentation

Welcome to the theme system documentation! This directory contains all the resources you need to understand and work with the enhanced theme system.

## 📚 Documentation Files

### Getting Started
- **[THEME_QUICK_START.md](./THEME_QUICK_START.md)** - Start here! Quick reference guide with common patterns and examples
- **[THEME_SYSTEM_SUMMARY.md](./THEME_SYSTEM_SUMMARY.md)** - Complete overview of what was implemented and next steps

### Detailed Documentation
- **[THEME_SYSTEM.md](./THEME_SYSTEM.md)** - Comprehensive developer documentation with all color categories, best practices, and examples
- **[COLOR_MIGRATION_REFERENCE.md](./COLOR_MIGRATION_REFERENCE.md)** - Quick reference tables for migrating hard-coded colors to theme variables

### Planning & Analysis
- **[THEME_SYSTEM_ELEVATION_PLAN.md](./THEME_SYSTEM_ELEVATION_PLAN.md)** - Detailed implementation plan with phases and timeline
- **[hard-coded-colors-report.md](./hard-coded-colors-report.md)** - Audit of 35+ files with hard-coded colors that need migration

## 🚀 Quick Navigation

### I want to...

**...understand what changed**
→ Read [THEME_SYSTEM_SUMMARY.md](./THEME_SYSTEM_SUMMARY.md)

**...start using the theme system**
→ Read [THEME_QUICK_START.md](./THEME_QUICK_START.md)

**...migrate a component**
→ Use [COLOR_MIGRATION_REFERENCE.md](./COLOR_MIGRATION_REFERENCE.md) for quick lookups

**...learn all the details**
→ Read [THEME_SYSTEM.md](./THEME_SYSTEM.md)

**...see what needs to be migrated**
→ Check [hard-coded-colors-report.md](./hard-coded-colors-report.md)

**...understand the implementation plan**
→ Read [THEME_SYSTEM_ELEVATION_PLAN.md](./THEME_SYSTEM_ELEVATION_PLAN.md)

## 🎨 Key Features

- ✅ **Theme-aware colors** - All colors adapt to light/dark mode
- ✅ **Semantic naming** - Colors describe purpose, not appearance
- ✅ **Comprehensive palette** - Brand, semantic, game, and reward colors
- ✅ **Theme-aware shadows** - Shadows that look great in both modes
- ✅ **Utility classes** - Ready-to-use gradients and helpers
- ✅ **Full documentation** - Everything you need to know

## 📖 Documentation Structure

```
docs/
├── README.md                          # This file
├── THEME_QUICK_START.md              # Quick start guide
├── THEME_SYSTEM_SUMMARY.md           # Implementation summary
├── THEME_SYSTEM.md                   # Complete documentation
├── COLOR_MIGRATION_REFERENCE.md      # Migration reference
├── THEME_SYSTEM_ELEVATION_PLAN.md    # Implementation plan
└── hard-coded-colors-report.md       # Color audit report
```

## 🎯 Common Tasks

### Using Theme Colors
```jsx
// Background and text
<div className="bg-background text-foreground">

// Cards
<div className="bg-card text-card-foreground border border-border">

// Buttons
<button className="bg-primary text-primary-foreground hover:bg-primary-hover">

// Gradients
<div className="bg-gradient-teal">

// Shadows
<div className="shadow-theme-md">
```

### Migrating Hard-Coded Colors
```jsx
// Before
<div className="bg-[#155d59]" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>

// After
<div className="bg-brand-teal shadow-theme-md">
```

## 🔗 Related Files

- **Theme CSS**: `apps/lms/app/themes.css`
- **Global CSS**: `apps/lms/app/globals.css`
- **Tailwind Config**: `tailwind.config.mjs`
- **Theme Switcher**: `packages/ui/components/ThemeSwitcher.jsx`
- **Demo Component**: `apps/lms/components/ThemeSystemDemo.jsx`

## 💡 Tips

1. Always test components in both light and dark modes
2. Use semantic color names (e.g., `bg-primary` not `bg-blue-500`)
3. Pair backgrounds with foregrounds (e.g., `bg-primary text-primary-foreground`)
4. Use theme-aware shadows (`shadow-theme-md` not `shadow-md`)
5. Leverage opacity modifiers (`bg-brand-teal/50` not `rgba(...)`)

## 🆘 Need Help?

- Check the [troubleshooting section](./THEME_SYSTEM.md#troubleshooting) in THEME_SYSTEM.md
- Review [common mistakes](./COLOR_MIGRATION_REFERENCE.md#common-mistakes-to-avoid) in COLOR_MIGRATION_REFERENCE.md
- See [examples](./THEME_SYSTEM.md#examples) in THEME_SYSTEM.md

---

**Happy theming! 🎨**
