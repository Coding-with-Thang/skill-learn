import * as React from "react"

import { cn } from "@skill-learn/lib/utils"

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-4xld border border-input bg-input px-3 py-1 text-base shadow-sm transition-colors duration-normal file:border-0 file:bg-input file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:bg-input-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }
