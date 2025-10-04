# Font System Documentation

## Overview

The font system has been centralized to provide a single source of truth for all typography in the application. This makes it easy to change fonts globally and ensures consistency across the entire project.

## Font Configuration

### Primary Fonts

- **Sans-serif (Primary)**: Inter - Modern, clean, and highly readable
- **Monospace**: JetBrains Mono - Developer-friendly with excellent readability
- **Display**: Poppins - Modern, friendly, and great for headings

### Font Files

- `src/config/fonts.js` - Central font configuration
- `src/lib/fonts.js` - Font utilities and helper functions

## Usage

### Using Tailwind Classes

```jsx
// Font families
<div className="font-sans">Primary text</div>
<div className="font-mono">Code text</div>
<div className="font-display">Heading text</div>

// Font weights
<div className="font-light">Light text</div>
<div className="font-normal">Normal text</div>
<div className="font-medium">Medium text</div>
<div className="font-semibold">Semibold text</div>
<div className="font-bold">Bold text</div>
<div className="font-extrabold">Extra bold text</div>
```

### Using Typography Utilities

```jsx
import { typography } from '@/lib/fonts'

// Pre-defined typography combinations
<h1 className={typography.h1}>Main Heading</h1>
<h2 className={typography.h2}>Section Heading</h2>
<p className={typography.body}>Body text</p>
<code className={typography.code}>Inline code</code>
```

### Using Helper Functions

```jsx
import { getFontClasses } from "@/lib/fonts";

// Custom font combinations
<div className={getFontClasses("display", "bold", "2xl", "tight")}>
  Custom heading
</div>;
```

## Changing Fonts Globally

To change fonts across the entire application:

1. **Update the font configuration** in `src/config/fonts.js`:

   ```javascript
   export const fonts = {
     sans: ["Your New Font", "fallback", "fonts"],
     // ... other font families
   };
   ```

2. **Update CSS variables** in `src/app/globals.css`:

   ```css
   --font-sans: Your New Font, fallback, fonts;
   ```

3. **Update Google Fonts import** in `src/app/layout.jsx` if using web fonts:
   ```html
   <link
     href="https://fonts.googleapis.com/css2?family=Your+New+Font:wght@300;400;500;600;700&display=swap"
     rel="stylesheet"
   />
   ```

## Font Loading

The application uses Google Fonts with optimized loading:

- **Preconnect** to Google Fonts domains for faster loading
- **Display swap** for better performance
- **Multiple weights** loaded for flexibility

## Best Practices

1. **Use semantic font classes** (`font-sans`, `font-mono`, `font-display`)
2. **Leverage typography utilities** for consistent styling
3. **Test font loading** on slower connections
4. **Maintain fallback fonts** for better compatibility
5. **Use appropriate font weights** for different UI elements

## Examples

### Headings

```jsx
<h1 className="font-display font-bold text-4xl leading-tight">Main Title</h1>
<h2 className="font-display font-semibold text-3xl leading-snug">Section Title</h2>
```

### Body Text

```jsx
<p className="font-sans text-base leading-relaxed">Regular paragraph text</p>
<p className="font-sans text-sm leading-normal">Small text</p>
```

### Code

```jsx
<code className="font-mono text-sm">const example = 'code';</code>
<pre className="font-mono text-base leading-relaxed">
  // Code block
</pre>
```

### UI Elements

```jsx
<button className="font-sans font-medium text-base">Button Text</button>
<label className="font-sans font-medium text-sm">Form Label</label>
```
