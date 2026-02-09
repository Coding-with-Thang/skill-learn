/**
 * Theme System Demo Component
 * 
 * This component demonstrates the new theme system with examples of:
 * - All color categories
 * - Theme-aware shadows
 * - Gradients
 * - Interactive states
 * - Both light and dark mode support
 * 
 * Use this as a reference when building new components.
 */

export default function ThemeSystemDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-brand-teal font-bold text-gradient-teal">
            Theme System Demo
          </h1>
          <p className="text-muted-foreground text-lg">
            All colors automatically adapt to light and dark modes
          </p>
        </header>

        {/* Brand Colors */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Brand Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-brand-teal text-white p-6 rounded-xl shadow-theme-md">
              <h3 className="font-bold text-xl mb-2">Brand Teal</h3>
              <p className="text-sm opacity-90">Primary brand color</p>
            </div>
            <div className="bg-brand-dark-blue text-white p-6 rounded-xl shadow-theme-md">
              <h3 className="font-bold text-xl mb-2">Brand Dark Blue</h3>
              <p className="text-sm opacity-90">Secondary brand color</p>
            </div>
            <div className="bg-brand-cyan text-white p-6 rounded-xl shadow-theme-md">
              <h3 className="font-bold text-xl mb-2">Brand Cyan</h3>
              <p className="text-sm opacity-90">Accent color</p>
            </div>
          </div>
        </section>

        {/* Semantic Colors */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Semantic Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-success text-success-foreground p-6 rounded-xl shadow-theme-md hover:bg-success-hover transition-normal">
              <h3 className="font-bold text-xl mb-2">Success</h3>
              <p className="text-sm opacity-90">Positive actions</p>
            </div>
            <div className="bg-warning text-warning-foreground p-6 rounded-xl shadow-theme-md hover:bg-warning-hover transition-normal">
              <h3 className="font-bold text-xl mb-2">Warning</h3>
              <p className="text-sm opacity-90">Caution needed</p>
            </div>
            <div className="bg-error text-error-foreground p-6 rounded-xl shadow-theme-md hover:bg-error-hover transition-normal">
              <h3 className="font-bold text-xl mb-2">Error</h3>
              <p className="text-sm opacity-90">Something wrong</p>
            </div>
            <div className="bg-info text-info-foreground p-6 rounded-xl shadow-theme-md hover:bg-info-hover transition-normal">
              <h3 className="font-bold text-xl mb-2">Info</h3>
              <p className="text-sm opacity-90">Information</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active px-6 py-3 rounded-lg shadow-theme-sm transition-normal">
              Primary Button
            </button>
            <button className="bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active px-6 py-3 rounded-lg shadow-theme-sm transition-normal">
              Secondary Button
            </button>
            <button className="bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-active px-6 py-3 rounded-lg shadow-theme-sm transition-normal">
              Accent Button
            </button>
            <button className="bg-destructive text-brand-tealestructive-foreground hover:bg-destructive-hover px-6 py-3 rounded-lg shadow-theme-sm transition-normal">
              Delete Button
            </button>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-theme-md">
              <h3 className="font-bold text-xl mb-2">Default Card</h3>
              <p className="text-muted-foreground mb-4">
                This card uses theme-aware colors and shadows.
              </p>
              <button className="bg-primary text-primary-foreground hover:bg-primary-hover px-4 py-2 rounded-lg text-sm transition-normal">
                Learn More
              </button>
            </div>

            <div className="bg-gradient-teal text-white p-6 rounded-xl shadow-theme-lg">
              <h3 className="font-bold text-xl mb-2">Gradient Card</h3>
              <p className="opacity-90 mb-4">
                Using the teal gradient utility class.
              </p>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-lg text-sm transition-normal">
                Explore
              </button>
            </div>

            <div className="bg-gradient-game text-white p-6 rounded-xl shadow-theme-lg">
              <h3 className="font-bold text-xl mb-2">Game Card</h3>
              <p className="opacity-90 mb-4">
                Perfect for gamification elements.
              </p>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-lg text-sm transition-normal">
                Play Now
              </button>
            </div>
          </div>
        </section>

        {/* Game Elements */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Game Elements</h2>
          <div className="bg-game-background p-8 rounded-4xl shadow-theme-xl">
            <div className="text-center space-y-6">
              <h3 className="text-4xl font-bold text-gradient-game">
                Level Complete!
              </h3>
              <div className="flex justify-center gap-8 text-6xl">
                <div className="text-center">
                  <div className="text-reward-gold">🥇</div>
                  <div className="text-sm text-foreground mt-2">Gold</div>
                </div>
                <div className="text-center">
                  <div className="text-reward-silver">🥈</div>
                  <div className="text-sm text-foreground mt-2">Silver</div>
                </div>
                <div className="text-center">
                  <div className="text-reward-bronze">🥉</div>
                  <div className="text-sm text-foreground mt-2">Bronze</div>
                </div>
              </div>
              <button className="bg-game-primary text-white hover:bg-game-accent px-8 py-4 rounded-xl text-lg font-bold shadow-theme-lg transition-normal">
                Next Level
              </button>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Form Elements</h2>
          <div className="bg-card p-6 rounded-xl border border-border shadow-theme-md max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Text Input
                </label>
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full bg-background text-foreground border border-input hover:border-input-hover focus:border-input-focus focus:ring-2 focus:ring-ring rounded-lg px-4 py-2 transition-normal outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Textarea
                </label>
                <textarea
                  placeholder="Enter description..."
                  rows={4}
                  className="w-full bg-background text-foreground border border-input hover:border-input-hover focus:border-input-focus focus:ring-2 focus:ring-ring rounded-lg px-4 py-2 transition-normal outline-none resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-primary text-primary-foreground hover:bg-primary-hover px-4 py-2 rounded-lg transition-normal">
                  Submit
                </button>
                <button className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary-hover px-4 py-2 rounded-lg transition-normal">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Shadows */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Theme-Aware Shadows</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-xl shadow-theme-sm">
              <p className="text-center font-medium">Small</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-theme-md">
              <p className="text-center font-medium">Medium</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-theme-lg">
              <p className="text-center font-medium">Large</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-theme-xl">
              <p className="text-center font-medium">Extra Large</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Shadows automatically adjust for light and dark modes
          </p>
        </section>

        {/* Chart Colors */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Chart Colors</h2>
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className={`h-32 rounded-xl shadow-theme-md flex items-center justify-center text-white font-bold text-2xl`}
                style={{ backgroundColor: `var(--chart-${num})` }}
              >
                {num}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-12 pb-6 border-t border-border">
          <p className="text-muted-foreground">
            All colors and shadows automatically adapt to your theme preference
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            See <code className="bg-muted px-2 py-1 rounded">docs/THEME_SYSTEM.md</code> for full documentation
          </p>
        </footer>

      </div>
    </div>
  );
}
