"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@skill-learn/lib/utils"

type SwitchProps = Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, "className" | "style"> & {
  className?: string;
  style?: React.CSSProperties;
};

function Switch({
  className,
  checked = false,
  style: styleProp,
  ...props
}: SwitchProps) {
  const isChecked = Boolean(checked)
  const trackStyle = isChecked
    ? { backgroundColor: "var(--primary)", borderColor: "var(--primary)" }
    : {
        backgroundColor: "var(--switch-off-bg, #cbd5e1)",
        borderColor: "var(--switch-off-bg, #cbd5e1)",
      }
  const thumbStyle = isChecked
    ? {
        transform: "translateX(20px)",
        backgroundColor: "var(--primary-foreground)",
        border: "none",
      }
    : {
        transform: "translateX(2px)",
        backgroundColor: "var(--switch-thumb-off, #fff)",
        border: "2px solid var(--switch-off-border, #94a3b8)",
      }

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "min-w-[2.75rem]",
        className
      )}
      style={{ ...(styleProp ?? {}), ...trackStyle }}
      checked={checked}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full shadow-md ring-0 transition-transform"
        )}
        style={thumbStyle}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch }
