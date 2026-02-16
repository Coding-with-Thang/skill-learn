"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}: React.ComponentProps<typeof Sonner>) => {
  const { theme = "system" } = useTheme()
  const safeTheme = (theme === "light" || theme === "dark" || theme === "system") ? theme : "system"

  return (
    (<Sonner
      theme={safeTheme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)"
        }
      }
      {...props} />)
  );
}

export { Toaster }
