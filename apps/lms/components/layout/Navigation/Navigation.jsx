'use client';

import { Star, BookOpenText, ChartColumnBig, LayoutDashboard } from 'lucide-react';
import { NavLink } from './NavLink';

export function Navigation({ isOperations, mobile }) {
  return (
    <nav
      className={
        mobile
          ? 'flex flex-col gap-3 py-2' // vertical, more space for mobile
          : 'flex flex-row gap-6 items-center'
      }
    >
      <NavLink href="/training" icon={BookOpenText} mobile={mobile}>
        Training
      </NavLink>
      <NavLink href="/user/stats" icon={ChartColumnBig} mobile={mobile}>
        My Stats
      </NavLink>
      <NavLink href="/rewards" icon={Star} mobile={mobile}>
        Rewards
      </NavLink>
      {isOperations && (
        <NavLink href="/dashboard" icon={LayoutDashboard} mobile={mobile}>
          Dashboard
        </NavLink>
      )}
    </nav>
  );
}
