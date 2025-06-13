'use client';

import Link from "next/link";

export function NavLink({ href, icon: Icon, children }) {
  return (
    <Link href={href} className="flex gap-1 items-center hover:underline">
      <Icon /> {children}
    </Link>
  );
}
