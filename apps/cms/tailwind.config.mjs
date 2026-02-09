/** @type {import('tailwindcss').Config} */
const defaultFontSans = ["ui-sans-serif", "system-ui", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"];
const defaultFontMono = ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"];

const config = {
  darkMode: "class",
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    '../../packages/ui/components/**/*.{js,jsx}', // Include UI package
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultFontSans],
        mono: ["var(--font-mono)", ...defaultFontMono],
        display: ["var(--font-display)", ...defaultFontSans],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      colors: {
        // Brand colors
        'brand-teal': '#155d59',
        'brand-teal-dark': '#124a47',
        'brand-dark-blue': '#1B1B53',
        
        // Core semantic colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",

        // Primary brand colors
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
          active: "var(--primary-active)",
          disabled: "var(--primary-disabled)",
        },

        // Secondary colors
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          hover: "var(--secondary-hover)",
          active: "var(--secondary-active)",
        },

        // Accent colors
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          hover: "var(--accent-hover)",
          active: "var(--accent-active)",
        },

        // Muted colors
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
          hover: "var(--muted-hover)",
        },

        // Semantic status colors
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
          hover: "var(--success-hover)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
          hover: "var(--warning-hover)",
        },
        error: {
          DEFAULT: "var(--error)",
          foreground: "var(--error-foreground)",
          hover: "var(--error-hover)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
          hover: "var(--info-hover)",
        },

        // Interactive elements
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
          hover: "var(--destructive-hover)",
        },

        // Border and input colors
        border: "var(--border)",
        input: {
          DEFAULT: "var(--input)",
          hover: "var(--input-hover)",
          focus: "var(--input-focus)",
        },

        // Ring/focus colors
        ring: {
          DEFAULT: "var(--ring)",
          primary: "var(--ring-primary)",
          secondary: "var(--ring-secondary)",
        },

        // Chart colors
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },

        // Sidebar colors
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },

        // Game and interactive colors
        game: {
          primary: "var(--game-primary)",
          secondary: "var(--game-secondary)",
          accent: "var(--game-accent)",
        },

        // Reward and points colors
        reward: {
          gold: "var(--reward-gold)",
          silver: "var(--reward-silver)",
          bronze: "var(--reward-bronze)",
        },
        points: {
          primary: "var(--points-primary)",
          secondary: "var(--points-secondary)",
        },

        // Legacy color mappings for backward compatibility
        green: {
          400: "var(--success)",
        },
        blue: {
          400: "var(--info)",
        },
        teal: {
          400: "var(--game-primary)",
        },
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      transitionDuration: {
        fast: "var(--transition-fast)",
        normal: "var(--transition-normal)",
        slow: "var(--transition-slow)",
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'slide-in-right': 'slideInRight 0.8s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'floatDelayed 3s ease-in-out infinite',
        'progress': 'progress 1.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(50px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        floatDelayed: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-15px)',
          },
        },
        progress: {
          '0%': {
            width: '0',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
