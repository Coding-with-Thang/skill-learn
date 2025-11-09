"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function TopBanner() {
  return (
    <div className="bg-[#155d59] text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <Link 
          href="/vision" 
          className="flex items-center gap-2 hover:underline text-sm md:text-base"
        >
          <span>Elevating People, Partnered with AI.</span>
          <span className="flex items-center gap-1">
            Read our vision
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}

