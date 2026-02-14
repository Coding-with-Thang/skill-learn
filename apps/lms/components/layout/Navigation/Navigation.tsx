'use client';

import { useEffect } from 'react';
import { Star, BookOpenText, ChartColumnBig, LayoutDashboard, Gamepad2, Trophy, Layers } from 'lucide-react';
import { NavLink } from './NavLink';
import { useFeaturesStore } from "@skill-learn/lib/stores/featuresStore";

export function Navigation({ isOperations, mobile }) {
  const isEnabled = useFeaturesStore((s) => s.isEnabled);
  const isLoading = useFeaturesStore((s) => s.isLoading);
  const fetchFeatures = useFeaturesStore((s) => s.fetchFeatures);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  // Define navigation items with feature requirements
  const navItems = [
    { href: '/training', icon: BookOpenText, label: 'Training', feature: 'training_courses' },
    { href: '/flashcards', icon: Layers, label: 'Flash Cards', feature: 'flash_cards' },
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
        <>
          {mobile ? (
            <div className="h-px w-full bg-border/50 my-2" />
          ) : (
            <div className="h-4 w-px bg-border/60 ml-2 mr-4" />
          )}
          <NavLink href="/dashboard" icon={LayoutDashboard} mobile={mobile} variant="primary">
            Admin Dashboard
          </NavLink>
        </>
      )}
    </nav>
  );
}
