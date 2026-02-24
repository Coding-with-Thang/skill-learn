"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition, useRef } from "react";
import { cn } from "@skill-learn/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@skill-learn/ui/components/dropdown-menu";
import { Globe, ChevronDown, Check } from "lucide-react";

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
  variant?: "default" | "dark";
};

export function LanguageSwitcher({ className, variant = "default" }: Props) {
  const isDark = variant === "dark";
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

  const currentLocale = LOCALES.find((l) => l.value === locale) || LOCALES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isPending}
          className={cn(
            "group flex items-center gap-2.5 rounded-full border transition-all px-4 py-2 cursor-pointer focus:outline-hidden",
            isDark
              ? "border-white/20 bg-white/10 hover:bg-white/20"
              : "border-border/50 bg-muted/40 hover:bg-muted",
            isPending && "opacity-70 cursor-not-allowed",
            className
          )}
        >
          <Globe className={cn("h-4 w-4", isDark ? "text-white/70" : "text-brand-teal")} />
          <span className={cn("text-sm font-bold", isDark ? "text-white" : "text-foreground")}>
            {currentLocale.label}
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180", isDark ? "text-white/60" : "text-muted-foreground")} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[5.5rem] p-1.5 z-3000">
        {LOCALES.map(({ value, label }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => onSelect(value as "en" | "fr")}
            className={cn(
              "flex items-center justify-between font-bold text-sm h-10 px-3 cursor-pointer rounded-lg transition-colors",
              locale === value 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {label}
            {locale === value && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
