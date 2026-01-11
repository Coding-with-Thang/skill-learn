import * as React from "react"
import { cn } from "@skill-learn/lib/utils.js"

const InteractiveCard = React.forwardRef(({
  className,
  children,
  variant = "default",
  interactive = true,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative group rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300",
      interactive && [
        "hover:shadow-lg hover:shadow-primary/10",
        "hover:border-primary/20",
        "hover:-translate-y-1",
        "active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-primary focus-visible:ring-offset-2"
      ],
      variant === "elevated" && "shadow-md hover:shadow-xl",
      variant === "bordered" && "border-2 hover:border-primary",
      className
    )}
    style={{ backgroundColor: "var(--card)" }}
    {...props}
  >
    {children}
    {interactive && (
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    )}
  </div>
))
InteractiveCard.displayName = "InteractiveCard"

const InteractiveCardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
InteractiveCardHeader.displayName = "InteractiveCardHeader"

const InteractiveCardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
InteractiveCardTitle.displayName = "InteractiveCardTitle"

const InteractiveCardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
InteractiveCardDescription.displayName = "InteractiveCardDescription"

const InteractiveCardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
InteractiveCardContent.displayName = "InteractiveCardContent"

const InteractiveCardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
InteractiveCardFooter.displayName = "InteractiveCardFooter"

export {
  InteractiveCard,
  InteractiveCardHeader,
  InteractiveCardFooter,
  InteractiveCardTitle,
  InteractiveCardDescription,
  InteractiveCardContent
} 