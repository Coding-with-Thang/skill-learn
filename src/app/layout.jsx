import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner"
import { ErrorBoundaryProvider } from "@/components/providers/ErrorBoundaryProvider";
import Header from "./components/Header";
import FooterWrapper from "./components/FooterWrapper";
import "./globals.css";

export const metadata = {
  title: "Skill-Learn",
  description: "Gamify your knowledge - have a blast learning",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
    // appearance={{
    //   baseTheme: dark // Optional: if you want to use the dark theme
    // }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="flex flex-col min-h-screen font-sans" style={{ background: "var(--background)", color: "var(--foreground)", transition: "var(--transition-normal)" }}>
          <ErrorBoundaryProvider>
            <Header />
            {children}
            <Toaster />
            <FooterWrapper />
          </ErrorBoundaryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
