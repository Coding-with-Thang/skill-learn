'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import ChangelogForm from '@/components/cms/changelog/ChangelogForm'
import { ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import api from "@skill-learn/lib/utils/axios"
import { toast } from 'sonner'

export default function EditChangelogPage({ params }) {
  const { id } = use(params)
  const [changelog, setChangelog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/changelog/${id}`)
        setChangelog(response.data)
      } catch (error) {
        console.error('Error fetching changelog:', error)
        toast.error('Failed to load changelog data')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchChangelog()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  if (!changelog) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-semibold">Changelog entry not found</h2>
        <Link href="/cms/changelog">
          <button className="text-teal-500 hover:underline">Back to list</button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        <Link href="/cms/changelog" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to Changelog
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Edit Update</h1>
        <p className="text-muted-foreground">Modify the details of your platform update.</p>
      </motion.div>

      <ChangelogForm initialData={changelog} />
    </div>
  )
}
