"use client";

import { useUser } from "@clerk/nextjs";

export default function WelcomeBanner() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-blue-400 p-8 md:p-12 text-white shadow-lg mb-8">
      {/* Background Decorative Shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      <div className="absolute bottom-0 right-20 w-48 h-48 bg-blue-300/20 rounded-full blur-xl"></div>

      <div className="relative z-10 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up">
          Welcome back, {firstName}!
        </h1>
        <p className="text-blue-50 text-lg animate-fade-in-up delay-100">
          You've got 5 new lessons to catch up. Keep up the great work!
        </p>
      </div>
    </div>
  );
}
