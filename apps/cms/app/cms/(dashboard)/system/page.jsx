'use client'

import { motion } from 'framer-motion'
import SystemHealthPanel from '@/components/cms/dashboard/SystemHealthPanel'
import RecentAlertsPanel from '@/components/cms/dashboard/RecentAlertsPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { Server, Database, Globe, Shield, Wifi, HardDrive } from 'lucide-react'

// Mock Data
const systemStatus = [
  { name: 'API Gateway', status: 'operational', uptime: '99.99%' },
  { name: 'Auth Service', status: 'operational', uptime: '99.95%' },
  { name: 'Database Cluster', status: 'degraded', uptime: '99.90%' },
  { name: 'Storage Service', status: 'operational', uptime: '99.99%' },
  { name: 'Redis Cache', status: 'operational', uptime: '100%' },
]

const resourceUsage = [
  { resource: 'CPU Usage', value: 45, limit: 100, unit: '%' },
  { resource: 'Memory', value: 32, limit: 64, unit: 'GB' },
  { resource: 'Storage', value: 1.2, limit: 5, unit: 'TB' },
  { resource: 'Network', value: 450, limit: 1000, unit: 'Mbps' },
]

const recentAlerts = [
  {
    id: 1,
    severity: 'critical',
    title: 'High Database Latency',
    message: 'Query execution time > 2s on primary node',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: 2,
    severity: 'warning',
    title: 'Storage Capacity Warning',
    message: 'S3 Bucket reaching 85% capacity',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    id: 3,
    severity: 'info',
    title: 'Scheduled Maintenance',
    message: 'Completed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
]

const infrastructureNodes = [
  { name: 'US-East-1', status: 'online', lat: '24ms', load: '45%', icon: Globe },
  { name: 'EU-West-1', status: 'online', lat: '120ms', load: '32%', icon: Globe },
  { name: 'AP-South-1', status: 'warning', lat: '240ms', load: '89%', icon: Globe },
  { name: 'Primary DB', status: 'online', lat: '2ms', load: '65%', icon: Database },
  { name: 'Redis Cluster', status: 'online', lat: '1ms', load: '20%', icon: Server },
  { name: 'CDN Edge', status: 'online', lat: '15ms', load: '40%', icon: Wifi },
]

export default function SystemHealthPage() {
  return (
    <div className="p-4 lg:p-6 w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">System Health & Monitoring</h1>
        <p className="text-muted-foreground">Real-time infrastructure status and vital metrics.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Health Panel */}
        <div className="lg:col-span-2 space-y-6">
          <SystemHealthPanel
            systemStatus={systemStatus}
            resourceUsage={resourceUsage}
          />

          {/* Infrastructure Map / Nodes */}
          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Nodes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {infrastructureNodes.map((node, index) => {
                  const Icon = node.icon
                  return (
                    <motion.div
                      key={node.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className={`h-2.5 w-2.5 rounded-full ${node.status === 'online' ? 'bg-green-500' :
                            node.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{node.name}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Lat: {node.lat}</span>
                          <span>Load: {node.load}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Logs */}
        <div className="space-y-6">
          <RecentAlertsPanel alerts={recentAlerts} />

          <Card className="bg-slate-950 text-slate-100 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Live Log Stream
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 font-mono text-xs max-h-[300px] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80 pointer-events-none" />
                <div className="text-green-400">[INFO] Worker-01 processed batch #49221</div>
                <div className="text-blue-400">[DEBUG] Cache hit for key user:1024</div>
                <div className="text-yellow-400">[WARN] High memory usage detected on node-03</div>
                <div className="text-green-400">[INFO] Autoscaling group scaled up</div>
                <div className="text-slate-400">[LOG] Routine maintenance check started</div>
                <div className="text-green-400">[INFO] 200 OK GET /api/v1/health</div>
                <div className="text-red-400">[ERR] Connection timeout db-shard-2</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
