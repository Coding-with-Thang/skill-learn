'use client';

import { UserButton as ClerkUserButton } from '@clerk/nextjs';
import { User } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function UserButtonWrapper() {
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
