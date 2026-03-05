"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@skill-learn/ui/components/button";

/**
 * Localized 404 page for routes under [locale] (e.g. /en/..., /fr/...).
 * Uses next-intl for translations and locale-aware navigation.
 */
export default function NotFoundPage() {
  const t = useTranslations("notFound");

  return (
    <div className="flex flex-col items-center justify-center bg-linear-to-br from-background to-muted min-h-screen p-4">
      <h1 className="mt-20 font-bold text-xl text-primary">404</h1>
      <p className="mt-4 text-2xl md:text-4xl lg:text-6xl font-semibold text-foreground text-center">
        {t("title")}
      </p>
      <p className="mt-2 text-muted-foreground text-center max-w-md">
        {t("description")}
      </p>
      <Button className="mt-6" asChild>
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  );
}
