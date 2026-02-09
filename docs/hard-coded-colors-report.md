# Hard-Coded Colors Report

This report lists all files containing hard-coded color values in the skill-learn project.

## Summary

Hard-coded colors were found in the following categories:
- **Hex Colors** (#RGB, #RRGGBB, #RRGGBBAA)
- **RGB/RGBA Colors** (rgb(), rgba())
- **HSL/HSLA Colors** (hsl(), hsla())

---

## Files with Hard-Coded Colors

### UI Components (packages/ui/components/)

#### `packages/ui/components/pie-chart.jsx`
- **Hex Colors:**
  - `#0088FE`, `#00C49F`, `#FFBB28`, `#FF8042`, `#8884D8` (color array)
  - `#8884d8` (fill color)

#### `packages/ui/components/loader.jsx`
- **Hex Colors:**
  - `#0F172A` (dark background)
  - `#1E293B` (dark card background)

#### `packages/ui/components/line-chart.jsx`
- **Hex Colors:**
  - `#0ea5e9` (gradient stops, stroke, cursor)
  - `#e5e7eb` (grid stroke)
  - `#888888` (axis stroke)

#### `packages/ui/components/chart.jsx`
- **Hex Colors:**
  - `#ccc`, `#fff` (in CSS selectors for recharts styling)

#### `packages/ui/components/ThemeSwitcher.jsx`
- **RGBA Colors:**
  - `rgba(0,0,0,0.25)` (box shadow)

#### `packages/ui/components/sidebar.jsx`
- **HSL Colors:**
  - `hsl(var(--sidebar-border))`, `hsl(var(--sidebar-accent))` (CSS variables)

---

### LMS App - User Components (apps/lms/components/user/)

#### `apps/lms/components/user/TopicProgressWidget.jsx`
- **Hex Colors:**
  - `#2563eb` (Blue-600)
  - `#e5e7eb` (Gray-200)

#### `apps/lms/components/user/QuizStats.jsx`
- **RGBA Colors:**
  - `rgba(0,0,0,0.1)` (box shadow)

#### `apps/lms/components/user/CategoryBarChart.jsx`
- **RGBA Colors:**
  - `rgba(0,0,0,0.1)` (box shadow)
- **HSL Colors:**
  - `hsl(var(--chart-1))`, `hsl(var(--chart-2))` (chart colors)

---

### LMS App - Landing Components (apps/lms/components/landing/)

#### `apps/lms/components/landing/VersatilePlatform.jsx`
- **Hex Colors:**
  - `#6366f1` (stroke color)
- **RGBA Colors:**
  - `rgba(0,0,0,0.05)`, `rgba(0,0,0,0.02)` (box shadows)

#### `apps/lms/components/landing/Testimonials.jsx`
- **Hex Colors:**
  - `#EAEDF5` (background)
  - `#4F67E1` (text color)
  - `#1B1B53` (text color, opacity variants)
  - `#5865F2`, `#4752c4` (button colors)
- **RGBA Colors:**
  - `rgba(130,140,230,0.15)` (radial gradient)
  - `rgba(0,0,0,0.03)`, `rgba(0,0,0,0.06)` (box shadows)

#### `apps/lms/components/landing/SkillLearnHere.jsx`
- **Hex Colors:**
  - `#40C9FF`, `#3FA7D6`, `#48B1BF` (gradient colors)
  - `#F1F5F9` (stroke)
  - `#00D181` (stroke)

#### `apps/lms/components/landing/HeroSection.jsx`
- **Hex Colors:**
  - `#155d59` (radial gradient, linear gradient, grid lines)
- **RGBA Colors:**
  - `rgba(21,93,89,0.2)` (box shadow)

#### `apps/lms/components/landing/BuiltForEveryone.jsx`
- **RGBA Colors:**
  - `rgba(27,27,83,0.05)`, `rgba(21,93,89,0.05)` (radial gradients)

---

### LMS App - Games Components (apps/lms/components/games/)

#### `apps/lms/components/games/GamePlayLayout.jsx`
- **Hex Colors:**
  - `#94D1CF`, `#7CB9B6`, `#5DA39F` (gradient backgrounds)
  - `#1e293b` (text color)
  - `#155d59` (text colors, hover states)

---

### LMS App - Shared Components (apps/lms/components/shared/)

#### `apps/lms/components/shared/CookieConsent.jsx`
- **RGBA Colors:**
  - `rgba(0,0,0,0.12)` (box shadow)

---

### LMS App - Quiz Components (apps/lms/components/quiz/)

#### `apps/lms/components/quiz/QuizCard.jsx`
- **RGBA Colors:**
  - `rgba(0,0,0,0.8)` (box shadow)

---

### LMS App - Theme & Global Styles (apps/lms/app/)

#### `apps/lms/app/themes.css`
- **Hex Colors:**
  - `#1a1a1a` (shadow color - multiple instances)
  - `#000000` (shadow color)
  - `#ff6f61` (game primary)
  - `#92a8d1` (game secondary)
  - `#ff9800` (game accent)
  - `#ffd700` (reward gold)
- **RGBA Colors:**
  - Multiple rgba values for shadows with `rgba(255, 111, 97, ...)` variations
- **HSL Colors:**
  - Multiple hsl values for shadows with `hsl(0 0% ...)` variations

#### `apps/lms/app/globals.css`
- **RGBA Colors:**
  - `rgba(0, 0, 0, 0.15)` (box shadow)
  - `rgba(255, 255, 255, 0.1)` (background)
  - `rgba(255, 255, 255, 0.2)` (border)
- **HSL Colors:**
  - Multiple hsl values for shadows with `hsl(0 0% 0% / ...)` variations

---

### LMS App - Pages (apps/lms/app/)

#### `apps/lms/app/(public)/video-ad/page.jsx`
- **RGBA Colors:**
  - `rgba(255,255,255,0.8)` (box shadow)

#### `apps/lms/app/(public)/features/page.jsx`
- **RGBA Colors:**
  - `rgba(0,209,129,0.05)` (radial gradient)
  - `rgba(0,0,0,0.08)` (box shadow)

#### `apps/lms/app/(public)/contact/page.jsx`
- **RGBA Colors:**
  - `rgba(0,0,0,0.06)` (box shadow)

#### `apps/lms/app/(public)/about/page.jsx`
- **RGBA Colors:**
  - `rgba(0,0,0,0.06)` (box shadow - multiple instances)

#### `apps/lms/app/(public)/changelog/page.jsx`
- **RGBA Colors:**
  - `rgba(0,0,0,0.05)`, `rgba(20,184,166,0.3)` (box shadows)

#### `apps/lms/app/(lms)/(user)/quiz/start/[quizId]/page.jsx`
- **RGBA Colors:**
  - `rgba(0,0,0,0.1)` (box shadow)

#### `apps/lms/app/(lms)/(user)/flashcards/study/page.jsx`
- **RGBA Colors:**
  - `rgba(99,102,241,0.4)` (box shadow)

#### `apps/lms/app/(lms)/(admin)/dashboard/page.jsx`
- **RGBA Colors:**
  - `rgba(var(--primary),0.3)` (box shadow)

#### `apps/lms/app/(lms)/(admin)/dashboard/settings/SettingsForm.jsx`
- **RGBA Colors:**
  - `rgba(0,0,0,0.2)`, `rgba(0,0,0,0.5)` (box shadows)

#### `apps/lms/app/(lms)/(user)/achievements/page.jsx`
- **RGBA Colors:**
  - `rgba(0,0,0,0.3)` (text shadow)

#### `apps/lms/app/(lms)/(auth)/sign-in/[[...sign-in]]/page.jsx`
- **RGBA Colors:**
  - `rgba(0,0,0,0.06)` (box shadow)

---

### CMS App - Theme & Global Styles (apps/cms/app/)

#### `apps/cms/app/themes.css`
- **RGBA Colors:**
  - Multiple rgba values for shadows with `rgba(255, 111, 97, ...)` variations
- **HSL Colors:**
  - Multiple hsl values for shadows with `hsl(0 0% ...)` variations

#### `apps/cms/app/globals.css`
- **RGBA Colors:**
  - `rgba(0, 0, 0, 0.15)` (box shadow)
  - `rgba(255, 255, 255, 0.1)` (background)
  - `rgba(255, 255, 255, 0.2)` (border)
- **HSL Colors:**
  - Multiple hsl values for shadows with `hsl(0 0% 0% / ...)` variations

---

## Recommendations

1. **Create a centralized color system**: Move all hard-coded colors to CSS variables or a theme configuration file
2. **Use Tailwind colors**: Replace hard-coded hex values with Tailwind's color palette where possible
3. **Standardize shadows**: Create reusable shadow utilities instead of inline rgba/hsl values
4. **Theme consistency**: Ensure all colors support both light and dark modes through CSS variables
5. **Chart colors**: Consider moving chart color arrays to a configuration file for easier maintenance

---

## Statistics

- **Total files with hard-coded colors**: 35+ files
- **Most common color types**: 
  - RGBA (for shadows and opacity)
  - Hex codes (for brand colors and UI elements)
  - HSL (for theme-aware shadows)
- **Areas with most hard-coded colors**:
  - Landing page components
  - Theme/global CSS files
  - Game-related components
