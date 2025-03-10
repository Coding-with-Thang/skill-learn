import { ClerkProvider } from "@clerk/nextjs";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";
import BreadCrumb from "./components/BreadCrumb";

export const metadata = {
  title: "Skill-Learn",
  description: "Gamify your knowledge - have a blast learning",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <Header />
          <BreadCrumb />
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
