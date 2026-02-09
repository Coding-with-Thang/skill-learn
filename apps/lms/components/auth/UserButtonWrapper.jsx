'use client';

import { useState, useEffect } from 'react';
import { UserButton as ClerkUserButton } from '@clerk/nextjs';
import { User } from 'lucide-react';
import { Button } from "@skill-learn/ui/components/button";

/**
 * Wraps Clerk UserButton and only renders it after client mount to avoid hydration
 * mismatch (Clerk injects client-only DOM that differs from server render).
 */
export function UserButtonWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center" aria-hidden>
        <User className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  try {
    return (
      <ClerkUserButton
        appearance={{
          elements: {
            userButtonPopoverFooter: {
              display: 'none',
            },
          },
        }}
      />
    );
  } catch (err) {
    console.error("Failed to render UserButton:", err);
    return (
      <Button variant="ghost" className="w-10 h-10 rounded-full">
        <User className="h-5 w-5" />
      </Button>
    );
  }
}
