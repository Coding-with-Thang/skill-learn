'use client';

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import logo from '../../public/logo.svg';
import { cn } from "@skill-learn/lib/utils";

export function Logo({ className, textClassName, imageClassName }: { className?: string; textClassName?: string; imageClassName?: string } = {}) {
  return (
    <Link href="/" className={cn("flex gap-1 items-center justify-center", className)}>
      <Image
        src={logo}
        width={48}
        height={48}
        alt="Skill-Learn"
        className={cn(imageClassName)}
      />
      <h1 className={cn('font-bold text-2xl text-nowrap', textClassName)}>Skill-Learn</h1>
    </Link>
  );
}
