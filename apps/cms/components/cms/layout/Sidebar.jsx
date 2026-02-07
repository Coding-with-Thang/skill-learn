'use client'

import { useEffect } from 'react'
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  BarChart3,
  Activity,
  Users,
  Zap,
  MessageSquare,
  Megaphone,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  History,
  X,
  Layers,
} from 'lucide-react'
import { Button } from "@skill-learn/ui/components/button"
import { cn } from '@/lib/cms/utils'
import { useSidebarStore } from '@/lib/cms/store'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/cms' },
  { icon: Building2, label: 'Tenants', href: '/cms/tenants' },
  { icon: Shield, label: 'Roles & Permissions', href: '/cms/roles-permissions' },
  { icon: CreditCard, label: 'Billing', href: '/cms/billing' },
  { icon: BarChart3, label: 'Analytics', href: '/cms/analytics' },
  { icon: Activity, label: 'System Health', href: '/cms/system' },
  { icon: Users, label: 'Admin Users', href: '/cms/admins' },
  { icon: Zap, label: 'Features', href: '/cms/features' },
  { icon: Layers, label: 'Flash Card Limits', href: '/cms/flashcard-limits' },
  { icon: MessageSquare, label: 'Support', href: '/cms/support' },
  { icon: History, label: 'Changelog', href: '/cms/changelog' },
  { icon: Megaphone, label: 'Announcements', href: '/cms/announcements' },
  { icon: Settings, label: 'Settings', href: '/cms/settings' },
]

export default function Sidebar() {
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebarStore()
  const pathname = usePathname()

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobileOpen) {
      closeMobileSidebar()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 80 : 256,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        "fixed left-0 top-0 z-50 h-screen border-r bg-card transition-transform duration-300",
        "shadow-lg lg:shadow-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-white font-bold">
                  E
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Skill-Learn
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-white font-bold mx-auto"
              >
                E
              </motion.div>
            )}
          </AnimatePresence>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobileSidebar}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.href} onClick={closeMobileSidebar}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 transition-all",
                      isCollapsed && "justify-center px-2",
                      isActive && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Collapse Toggle - Hidden on mobile */}
        <div className="hidden border-t p-3 lg:block">
          <Button
            variant="ghost"
            onClick={toggleSidebar}
            className={cn(
              "w-full justify-start gap-3",
              isCollapsed && "justify-center px-2"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.aside>
  )
}
