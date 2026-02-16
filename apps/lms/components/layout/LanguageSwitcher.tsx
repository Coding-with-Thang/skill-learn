"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition, useRef } from "react";
import { Toggle } from "@skill-learn/ui/components/toggle";
import { cn } from "@skill-learn/lib/utils";

const LOCALES = [
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
] as const;

/** Strip locale prefix so we never pass a prefixed path to router.replace (avoids /en/fr/...). */
function getPathWithoutLocale(pathname: string): string {
  const without = pathname.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";
  return without || "/";
}

type Props = {
  className?: string;
};

export function LanguageSwitcher({ className }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const replacingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onSelect(nextLocale: "en" | "fr") {
    if (nextLocale === locale) return;
    if (replacingRef.current) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    replacingRef.current = true;
    const path = getPathWithoutLocale(pathname ?? "");
    startTransition(() => {
      router.replace(path, { locale: nextLocale });
    });
    timeoutRef.current = setTimeout(() => {
      replacingRef.current = false;
      timeoutRef.current = null;
    }, 400);
  }

  return (
    <div
      className={cn("inline-flex rounded-md border border-input bg-input p-0.5 shadow-xs", className)}
      role="group"
      aria-label="Switch language"
    >
      {LOCALES.map(({ value, label }, index) => (
        <Toggle
          key={value}
          size="sm"
          variant="outline"
          pressed={locale === value}
          onPressedChange={(pressed) => {
            if (pressed) onSelect(value);
          }}
          disabled={isPending}
          className={cn(
            "h-7 min-w-9 rounded border-0 bg-transparent px-2.5 text-xs font-medium shadow-none transition-colors",
            "hover:bg-muted hover:text-foreground",
            "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm",
            index === 0 && "rounded-r-none rounded-l-md",
            index === LOCALES.length - 1 && "rounded-l-none rounded-r-md"
          )}
        >
          {label}
        </Toggle>
      ))}
    </div>
  );
}
