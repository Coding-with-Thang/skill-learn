"use client";

import { ClerkProvider } from "@clerk/nextjs";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";

import { useQuizStore } from "@/app/store/quizStore";

// export const metadata = {
//   title: "Skill-Learn",
//   description: "Gamify your knowledge - have a blast learning",
// };

export default function RootLayout({ children, quiz }) {
  const config = useQuizStore((state) => state.config);
  let render = config.status ? quiz : children;
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <Header />
          {render}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
