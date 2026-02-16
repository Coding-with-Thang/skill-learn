"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
import { cn } from "@skill-learn/lib/utils";

const LOCALES = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
] as const;

type Props = {
  className?: string;
  variant?: "dropdown" | "buttons";
};

export function LanguageSwitcher({ className, variant = "buttons" }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onSelect(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname || "/", { locale: nextLocale as "en" | "fr" });
    });
  }

  if (variant === "dropdown") {
    return (
      <select
        aria-label="Switch language"
        value={locale}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isPending}
        className={cn(
          "rounded-md border border-border bg-background px-2 py-1.5 text-sm cursor-pointer disabled:opacity-50",
          className
        )}
      >
        {LOCALES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)} role="group" aria-label="Language">
      {LOCALES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          disabled={isPending || locale === value}
          className={cn(
            "rounded-md px-2 py-1 text-sm font-medium transition-colors",
            locale === value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
            isPending && "opacity-50 pointer-events-none"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
