'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/cms/ui/card'
import { Button } from '@/components/cms/ui/button'
import { Badge } from '@/components/cms/ui/badge'
import { Megaphone, Plus, Bell, Calendar, Eye } from 'lucide-react'

// Mock Data
const announcements = [
  {
    id: 1,
    title: 'Scheduled Maintenance Window',
    content: 'We will be performing database upgrades on Saturday, Oct 28th from 2:00 AM to 4:00 AM UTC. Services may be intermittent.',
    target: 'All Tenants',
    status: 'Scheduled',
    date: 'Oct 28, 2023',
    views: 1245,
  },
  {
    id: 2,
    title: 'New Feature: AI Course Builder',
    content: 'We have just launched the new AI-powered course builder. Check out the documentation to learn more.',
    target: 'Pro & Enterprise',
    status: 'Published',
    date: 'Oct 24, 2023',
    views: 856,
  },
  {
    id: 3,
    title: 'API Version 2.0 Deprecation Warning',
    content: 'API v2.0 will be deprecated on Dec 31st, 2023. Please migrate to v3.0.',
    target: 'Developers',
    status: 'Draft',
    date: 'Unpublished',
    views: 0,
  },
]

export default function AnnouncementsPage() {
  return (
    <div className="p-4 lg:p-6 w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Broadcast messages to tenant administrators and users.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Announcements */}
        <div className="lg:col-span-2 space-y-4">
          {announcements.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Megaphone className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="secondary" className="font-normal">{item.target}</Badge>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {item.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={item.status === 'Published' ? 'default' : 'secondary'} className={item.status === 'Published' ? 'bg-green-500 hover:bg-green-600' : ''}>
                      {item.status}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4">
                    {item.content}
                  </p>

                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{item.views} Views</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">View Stats</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Sidebar Help / Tips */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                When sending global announcements, consider the timing. Tuesday mornings typically see the highest engagement rates.
              </p>
              <div className="space-y-2">
                <p className="font-medium">Targeting:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Use "All Tenants" for critical maintenance.</li>
                  <li>Target specific plans for upsell features.</li>
                  <li>Use "Developers" for API changes.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
