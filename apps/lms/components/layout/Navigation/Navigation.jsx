'use client';

import { Star, BookOpenText, ChartColumnBig, LayoutDashboard, Gamepad2, Trophy } from 'lucide-react';
import { NavLink } from './NavLink';
import { useFeatures } from '@skill-learn/lib/hooks/useFeatures.js';

export function Navigation({ isOperations, mobile }) {
  const { isEnabled, isLoading } = useFeatures();

  // Define navigation items with feature requirements
  const navItems = [
    { href: '/training', icon: BookOpenText, label: 'Training', feature: 'training_courses' },
    { href: '/user/stats', icon: ChartColumnBig, label: 'My Stats', feature: 'user_stats' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaderboard', feature: 'leaderboards' },
    { href: '/games', icon: Gamepad2, label: 'Games', feature: 'games' },
    { href: '/rewards', icon: Star, label: 'Rewards', feature: 'rewards_store' },
  ];

  // Filter items based on enabled features (only filter when not loading)
  const visibleItems = isLoading 
    ? navItems 
    : navItems.filter(item => !item.feature || isEnabled(item.feature));

  return (
    <nav
      className={
        mobile
          ? 'flex flex-col gap-3 py-2' // vertical, more space for mobile
          : 'flex flex-row gap-6 items-center'
      }
    >
      {visibleItems.map((item) => (
        <NavLink key={item.href} href={item.href} icon={item.icon} mobile={mobile}>
          {item.label}
        </NavLink>
      ))}
      {isOperations && (
        <NavLink href="/dashboard" icon={LayoutDashboard} mobile={mobile}>
          Dashboard
        </NavLink>
      )}
    </nav>
  );
}
