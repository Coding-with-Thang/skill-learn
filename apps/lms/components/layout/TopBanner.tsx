"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";


export default function TopBanner() {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // only set mounted to avoid hydration mismatch — don't persist dismissal
    setMounted(true);
  }, []);

  const close = () => {
    // trigger exit animation then hide
    setClosing(true);
    // match transition duration (300ms)
    setTimeout(() => setVisible(false), 320);
  };

  // if not yet mounted, or dismissed, don't render the banner
  if (!mounted || !visible) return null;

  return (
    <div
      className={`bg-linear-to-r from-brand-teal/40 via-brand-teal/90 to-brand-dark-blue/60 text-white py-2 px-4 transition-all duration-300 ease-out transform-gpu ${closing ? 'opacity-0 -translate-y-4' : 'animate-fade-in-up'}`}
      role="region"
      aria-label="Important banner"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center relative">
        <Link
          href="/about"
          className="flex items-center gap-2 text-sm md:text-base"
        >
          <span>Elevating People, Partnered with AI.</span>
          <span className="flex items-center gap-1 hover:underline">
            Read our vision
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <button
          onClick={close}
          aria-label="Dismiss banner"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-4xld p-1.5 text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

