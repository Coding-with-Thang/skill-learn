import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@skill-learn/ui/components/sonner";
import { ErrorBoundaryProvider } from "@/components/providers/ErrorBoundaryProvider";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { Inter, JetBrains_Mono, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Skill-Learn",
  description: "Gamify your knowledge - have a blast learning",
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    languages: {
      en: "/en",
      fr: "/fr",
    },
  },
};

import { CookieConsent } from "@/components/shared/CookieConsent";
import type { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({
  children,
}: RootLayoutProps): Promise<ReactNode> {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <ClerkProvider>
      <html lang={locale} suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const theme = localStorage.getItem('lms-theme') || 'light';
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body
          className={`${inter.variable} ${mono.variable} ${poppins.variable} font-sans antialiased flex flex-col min-h-screen`}
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ErrorBoundaryProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
              <Toaster />
              <CookieConsent />
            </ErrorBoundaryProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
