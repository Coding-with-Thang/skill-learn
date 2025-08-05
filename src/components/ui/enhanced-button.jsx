import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring-primary focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 aria-invalid:border-destructive relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled hover:shadow-md hover:shadow-primary/20 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive-hover active:bg-destructive/90 focus-visible:ring-destructive/20 hover:shadow-md hover:shadow-destructive/20 active:scale-[0.98]",
        outline:
          "border border-border bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent-active hover:shadow-md hover:shadow-accent/20 active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-hover active:bg-secondary-active hover:shadow-md hover:shadow-secondary/20 active:scale-[0.98]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent-active hover:shadow-sm active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover",
        success: "bg-success text-success-foreground shadow-sm hover:bg-success-hover active:bg-success/90 hover:shadow-md hover:shadow-success/20 active:scale-[0.98]",
        warning: "bg-warning text-warning-foreground shadow-sm hover:bg-warning-hover active:bg-warning/90 hover:shadow-md hover:shadow-warning/20 active:scale-[0.98]",
        info: "bg-info text-info-foreground shadow-sm hover:bg-info-hover active:bg-info/90 hover:shadow-md hover:shadow-info/20 active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-lg px-8 has-[>svg]:px-6 text-base",
        icon: "size-9",
      },
      loading: {
        true: "cursor-wait",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
)

const EnhancedButton = React.forwardRef(({
  className,
  variant,
  size,
  loading = false,
  children,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      className={cn(enhancedButtonVariants({ variant, size, loading, className }))}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-md bg-white/20 opacity-0 group-active:opacity-100 transition-opacity duration-150 pointer-events-none" />
    </Comp>
  )
})
EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, enhancedButtonVariants } 