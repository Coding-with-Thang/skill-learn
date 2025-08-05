import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"

const EnhancedInput = React.forwardRef(({
  className,
  type = "text",
  variant = "default",
  size = "default",
  icon,
  error,
  success,
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)

  const inputType = type === "password" && showPassword ? "text" : type

  return (
    <div className="relative group">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
          {icon}
        </div>
      )}
      <input
        type={inputType}
        className={cn(
          "flex w-full rounded-md border bg-input px-3 py-1 text-base shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // Size variants
          size === "sm" && "h-8 text-sm px-2",
          size === "default" && "h-9 px-3",
          size === "lg" && "h-11 px-4 text-base",
          // Icon padding
          icon && "pl-10",
          // Password toggle padding
          showPasswordToggle && type === "password" && "pr-10",
          // Variant styles
          variant === "default" && [
            "border-input hover:bg-input-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-primary focus-visible:ring-offset-2",
            isFocused && "border-primary/50"
          ],
          variant === "error" && [
            "border-error bg-error/5 text-error-foreground focus-visible:ring-error/20",
            "hover:bg-error/10"
          ],
          variant === "success" && [
            "border-success bg-success/5 text-success-foreground focus-visible:ring-success/20",
            "hover:bg-success/10"
          ],
          className
        )}
        ref={ref}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />

      {/* Status icons */}
      {error && (
        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-error" />
      )}
      {success && (
        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
      )}

      {/* Password toggle */}
      {showPasswordToggle && type === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}

      {/* Focus ring animation */}
      <div className="absolute inset-0 rounded-md ring-2 ring-primary/0 ring-offset-2 transition-all duration-200 pointer-events-none group-focus-within:ring-primary/20" />
    </div>
  )
})
EnhancedInput.displayName = "EnhancedInput"

export { EnhancedInput } 