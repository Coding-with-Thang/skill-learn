'use client';

import React from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@skill-learn/lib/utils";

export function NavLink({ href, icon: Icon, children, mobile, variant }: { href: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; mobile?: boolean; variant?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex gap-1 items-center transition-all duration-200",
        mobile
          ? 'gap-2 py-2.5 px-4 rounded-xl text-lg font-semibold hover:bg-muted'
          : 'hover:text-primary decoration-primary/30 underline-offset-4',
        variant === 'primary' && !mobile && "px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wide hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 hover:no-underline transition-all duration-300",
        variant === 'primary' && mobile && "bg-primary/5 text-primary border border-primary/10 font-bold",
        !variant && !mobile && "hover:underline"
      )}
    >
      <Icon className={mobile ? 'w-6 h-6' : 'w-4 h-4'} /> {children}
    </Link>
  );
}
