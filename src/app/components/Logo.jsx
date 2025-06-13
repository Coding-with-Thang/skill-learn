'use client';

import Link from "next/link";
import Image from "next/image";
import logo from '../../../public/logo.svg';

export function Logo() {
  return (
    <Link href="/" className="flex gap-1 items-center justify-center">
      <Image
        src={logo}
        width={48}
        alt="Skill-Learn"
      />
      <h1 className='font-bold text-2xl text-nowrap'>Skill-Learn</h1>
    </Link>
  );
}
