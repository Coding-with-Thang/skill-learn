import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ErrorBoundaryProvider } from "@/components/providers/ErrorBoundaryProvider";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { Toaster } from "@skill-learn/ui/components/sonner";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { HtmlLangUpdater } from "@/components/providers/HtmlLangUpdater";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <HtmlLangUpdater locale={locale} />
      <ErrorBoundaryProvider>
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster />
        <CookieConsent />
      </ErrorBoundaryProvider>
    </NextIntlClientProvider>
  );
}
