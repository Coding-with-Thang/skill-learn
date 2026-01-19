'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/cms/ui/card'
import { Button } from '@/components/cms/ui/button'
import { Badge } from '@/components/cms/ui/badge'
import { Plus, History, Calendar, Eye, Edit2, Trash2, Search, Filter, ExternalLink } from 'lucide-react'
import api from '@skill-learn/lib/utils/axios.js'
import { format } from 'date-fns'
import Link from 'next/link'
import { toast } from 'sonner'

// Fallback image for changelog entries without images
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxNGQ4Y2QiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwZzU0NjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iNjAwIiBvcGFjaXR5PSIwLjgiPkNoYW5nZWxvZzwvdGV4dD48L3N2Zz4='

export default function ChangelogPage() {
  const [changelogs, setChangelogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchChangelogs()
  }, [])

  const fetchChangelogs = async () => {
    try {
      setLoading(true)
      const response = await api.get('/changelog')
      setChangelogs(response.data)
    } catch (error) {
      console.error('Error fetching changelogs:', error)
      toast.error('Failed to load changelogs')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this changelog entry?')) return

    try {
      await api.delete(`/changelog/${id}`)
      toast.success('Changelog deleted')
      setChangelogs(changelogs.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error deleting changelog:', error)
      toast.error('Failed to delete changelog')
    }
  }

  const filteredChangelogs = changelogs.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.version?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 lg:p-6 w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Changelog Management</h1>
          <p className="text-muted-foreground">Create and manage platform updates and feature releases.</p>
        </div>
        <Link href="/cms/changelog/new">
          <Button className="gap-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 border-none shadow-md">
            <Plus className="h-4 w-4" />
            New Update
          </Button>
        </Link>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or version..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-teal-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : filteredChangelogs.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-2">
              <History className="h-12 w-12 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-medium">No updates found</h3>
              <p className="text-muted-foreground">Get started by creating your first changelog entry.</p>
            </div>
          </Card>
        ) : (
          filteredChangelogs.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 border">
                        <img 
                          src={item.imageUrl || FALLBACK_IMAGE} 
                          alt={item.title} 
                          className="object-cover w-full h-full" 
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{item.title}</h3>
                          {item.version && (
                            <Badge variant="outline" className="text-xs">{item.version}</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 py-1">
                          {item.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(item.releaseDate), 'MMM d, yyyy')}
                          </span>
                          <Badge variant={item.published ? "success" : "secondary"} className={item.published ? "bg-green-500/10 text-green-600 border-green-200" : "bg-gray-100 text-gray-500"}>
                            {item.published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 items-start justify-end">
                      <Link href={`/cms/changelog/${item.id}`}>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Link href={`/changelog/${item.slug}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-teal-500 hover:text-teal-600 hover:bg-teal-50">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
