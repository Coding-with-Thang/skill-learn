import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@skill-learn/lib/utils.js"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-4xld text-sm font-medium transition-colors duration-normal disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring-primary focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/80 disabled:bg-primary/50",
        destructive:
          "bg-destructive text-brand-tealestructive-foreground shadow-sm hover:bg-destructive-hover active:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border border-border bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent-active",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-hover active:bg-secondary-active",
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent-active",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-4xld gap-1.5 px-3 py-2",
        lg: "h-10 rounded-4xld px-6 py-2",
        icon: "size-9 p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      style={{ fontFamily: "var(--font-display)" }}
      {...props} />
  );
}

export { Button, buttonVariants }
