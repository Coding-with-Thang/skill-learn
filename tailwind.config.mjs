import { fontFamily } from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './src/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
        './app/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-sans)', ...fontFamily.sans],
            },
            borderRadius: {
                sm: 'var(--radius-sm)',
                md: 'var(--radius-md)',
                lg: 'var(--radius-lg)',
                xl: 'var(--radius-xl)',
            },
            colors: {
                background: 'var(--color-background)',
                foreground: 'var(--color-foreground)',
                card: 'var(--color-card)',
                'card-foreground': 'var(--color-card-foreground)',
                popover: 'var(--color-popover)',
                'popover-foreground': 'var(--color-popover-foreground)',
                primary: 'var(--color-primary)',
                'primary-foreground': 'var(--color-primary-foreground)',
                secondary: 'var(--color-secondary)',
                'secondary-foreground': 'var(--color-secondary-foreground)',
                muted: 'var(--color-muted)',
                'muted-foreground': 'var(--color-muted-foreground)',
                accent: 'var(--color-accent)',
                'accent-foreground': 'var(--color-accent-foreground)',
                destructive: 'var(--color-destructive)',
                border: 'var(--color-border)',
                input: 'var(--color-input)',
                ring: 'var(--color-ring)',
                'chart-1': 'var(--color-chart-1)',
                'chart-2': 'var(--color-chart-2)',
                'chart-3': 'var(--color-chart-3)',
                'chart-4': 'var(--color-chart-4)',
                'chart-5': 'var(--color-chart-5)',
                sidebar: 'var(--color-sidebar)',
                'sidebar-foreground': 'var(--color-sidebar-foreground)',
                'sidebar-primary': 'var(--color-sidebar-primary)',
                'sidebar-primary-foreground': 'var(--color-sidebar-primary-foreground)',
                'sidebar-accent': 'var(--color-sidebar-accent)',
                'sidebar-accent-foreground': 'var(--color-sidebar-accent-foreground)',
                'sidebar-border': 'var(--color-sidebar-border)',
                'sidebar-ring': 'var(--color-sidebar-ring)',
                green: {
                    400: 'var(--green-400)',
                },
                blue: {
                    400: 'var(--blue-400)',
                },
                teal: {
                    400: 'var(--teal-400)',
                },
            },
        },
    },
    plugins: [],
}
