'use client';

import Link from "next/link";

export function NavLink({ href, icon: Icon, children, mobile }) {
  return (
    <Link
      href={href}
      className={
        mobile
          ? 'flex gap-2 items-center py-2 px-2 rounded text-lg font-medium hover:bg-muted transition-colors'
          : 'flex gap-1 items-center hover:underline'
      }
    >
      <Icon className={mobile ? 'w-6 h-6' : 'w-4 h-4'} /> {children}
    </Link>
  );
}
