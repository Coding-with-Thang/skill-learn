'use client'

import { motion } from 'framer-motion'
import ChangelogForm from '@/components/cms/changelog/ChangelogForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewChangelogPage() {
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
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Create New Update</h1>
        <p className="text-muted-foreground">Draft a new platform update or release announcement.</p>
      </motion.div>

      <ChangelogForm />
    </div>
  )
}
