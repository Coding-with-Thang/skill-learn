'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@skill-learn/ui/components/card"
import { Button } from "@skill-learn/ui/components/button"
import { Badge } from "@skill-learn/ui/components/badge"
import { Input } from "@skill-learn/ui/components/input"
import { MessageSquare, Search, Filter, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

// Mock Data
const tickets = [
  {
    id: 'T-1024',
    subject: 'Cannot access billing dashboard',
    tenant: 'Acme Corp',
    requester: 'john.doe@acme.com',
    priority: 'high',
    status: 'open',
    created: '2 hours ago',
  },
  {
    id: 'T-1023',
    subject: 'Question about API rate limits',
    tenant: 'TechStart Inc',
    requester: 'susan.lee@techstart.io',
    priority: 'medium',
    status: 'in_progress',
    created: '5 hours ago',
  },
  {
    id: 'T-1022',
    subject: 'Feature request: Custom reports',
    tenant: 'Global Edu',
    requester: 'admin@globaledu.org',
    priority: 'low',
    status: 'resolved',
    created: '1 day ago',
  },
]

export default function SupportPage() {
  const [filter, setFilter] = useState('all')

  return (
    <div className="p-4 lg:p-6 w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">Manage and resolve inquiries from tenant administrators.</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-500">Open Tickets</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">24</p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-500/50" />
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-500">High Priority</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">5</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500/50" />
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">Resolved Today</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">18</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500/50" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
              <p className="text-2xl font-bold">1h 45m</p>
            </div>
            <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Recent Tickets</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search tickets..." className="pl-9 w-[250px]" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 h-2 w-2 rounded-full ${ticket.status === 'open' ? 'bg-blue-500' :
                      ticket.status === 'in_progress' ? 'bg-orange-500' : 'bg-green-500'
                    }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{ticket.subject}</h4>
                      <Badge variant="outline" className="text-xs">{ticket.id}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      From <span className="font-medium text-foreground">{ticket.requester}</span> ({ticket.tenant})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <Badge className={
                      ticket.priority === 'high' ? 'bg-red-500 hover:bg-red-600' :
                        ticket.priority === 'medium' ? 'bg-orange-500 hover:bg-orange-600' :
                          'bg-blue-500 hover:bg-blue-600'
                    }>
                      {ticket.priority.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{ticket.created}</p>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
