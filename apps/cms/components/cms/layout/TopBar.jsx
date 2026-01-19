'use client'

import { useState } from 'react'
import { Input } from '@/components/cms/ui/input'
import { Button } from '@/components/cms/ui/button'
import { Badge } from '@/components/cms/ui/badge'
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react'
import { useThemeStore, useDashboardStore, useSidebarStore } from '@/lib/cms/store'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cms/utils'
import { UserButtonWrapper } from '@/components/cms/auth/UserButtonWrapper'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

export default function TopBar() {
  const { theme, toggleTheme, initializeTheme } = useThemeStore()
  const { notifications, markNotificationRead, markAllNotificationsRead } = useDashboardStore()
  const { toggleMobileSidebar } = useSidebarStore()
  const { user } = useUser()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Initialize theme on mount to ensure it's applied
  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="sticky top-0 z-30 border-b bg-card backdrop-blur-sm">
      <div className="flex h-16 items-center gap-2 px-4 lg:gap-4 lg:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search - Left Side */}
        <div className="hidden flex-1 max-w-md lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tenants, users, or settings..."
              className="pl-9 w-full"
            />
          </div>
        </div>

        {/* Mobile Search Button */}
        <div className="flex-1 lg:hidden">
          <AnimatePresence>
            {showSearch ? (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="relative flex w-full items-center gap-2"
              >
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 pr-9 w-full"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(false)}
                  className="h-8 w-8 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(true)}
                className="ml-auto"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section - Pushed to the right */}
        <div className="flex items-center gap-1 lg:gap-2 ml-auto">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative"
          >
            <AnimatePresence mode="wait">
              {theme === 'light' ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-80 rounded-lg border bg-card shadow-lg z-50"
                >
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllNotificationsRead}
                          className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationRead(notification.id)}
                        className={cn(
                          "border-b last:border-0 p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                          !notification.read && "bg-primary/5"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.time).toLocaleTimeString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-2 border-l border-border">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-foreground">
                {user?.fullName || "Super Admin"}
              </span>
              <span className="text-xs text-muted-foreground">
                Super Admin
              </span>
            </div>
            <UserButtonWrapper />
          </div>
        </div>
      </div>
    </header>
  )
}
