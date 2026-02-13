# Font System Documentation

## Overview

The font system uses Next.js font optimization (`next/font`) to load and configure typography. Fonts are defined in the root layout and exposed as CSS variables for consistent usage across the application.

## Font Configuration

### Primary Fonts

- **Sans-serif (Primary)**: Inter - Modern, clean, and highly readable
- **Monospace**: JetBrains Mono - Developer-friendly with excellent readability
- **Display**: Poppins - Modern, friendly, and great for headings

### Configuration Location

- **Layout**: `apps/lms/app/layout.tsx` - Fonts loaded via `next/font/google`
- **CSS Variables**: `--font-sans`, `--font-mono`, `--font-display` applied to body

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

## Changing Fonts Globally

To change fonts across the entire application:

1. **Update the layout** in `apps/lms/app/layout.tsx`:

   ```typescript
   import { YourFont } from "next/font/google";

   const yourFont = YourFont({
     subsets: ["latin"],
     variable: "--font-sans", // or --font-mono, --font-display
     display: "swap",
   });
   ```

2. **Add the variable to the body** in the layout:

   ```tsx
   <body className={`${inter.variable} ${mono.variable} ${poppins.variable} font-sans antialiased ...`}>
   ```

3. **Update Tailwind config** if the CSS variable name changes

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
