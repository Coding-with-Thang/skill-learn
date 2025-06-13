'use client';

import { Star, BookOpenText, ChartColumnBig, LayoutDashboard } from 'lucide-react';
import { NavLink } from './NavLink';

export function Navigation({ isOperations }) {
  return (
    <>
      {/* {isOperations && (
        <NavLink href="/dashboard" icon={LayoutDashboard}>
          Dashboard
        </NavLink>
      )} */}
      <NavLink href="/training" icon={BookOpenText}>
        Training
      </NavLink>
      <NavLink href="/stats" icon={ChartColumnBig}>
        My Stats
      </NavLink>
      <NavLink href="/rewards" icon={Star}>
        Rewards
      </NavLink>
    </>
  );
}
