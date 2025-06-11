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
        <body className="flex flex-col min-h-screen">
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
