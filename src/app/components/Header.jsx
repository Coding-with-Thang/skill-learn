"use client";

import Link from "next/link";
import MainNav from "./MainNav";

export default function Header() {

  return (
    <header className="sticky top-0 w-full bg-white border-b-2 z-[1000]">
      <div className="flex items-center h-16 justify-between">
        <MainNav />
        <div className="flex items-center justify-end gap-6 mr-6 lg:mr-9">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
