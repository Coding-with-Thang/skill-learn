import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner"
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";

export const metadata = {
  title: "Skill-Learn",
  description: "Gamify your knowledge - have a blast learning",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="flex flex-col min-h-screen">
          <Header />
          {children}
          <Toaster />
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
