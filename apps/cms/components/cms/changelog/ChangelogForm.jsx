'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/cms/ui/card'
import { Button } from '@/components/cms/ui/button'
import { Badge } from '@/components/cms/ui/badge'
import { Save, X, Image as ImageIcon, Plus, Trash2, Layout, Calendar as CalendarIcon, Tag, Terminal, ExternalLink, Bug, Flare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import api from '@skill-learn/lib/utils/utils/axios.js'
import { toast } from 'sonner'

const TAG_OPTIONS = [
  { label: 'New', color: 'bg-blue-500', icon: Flare },
  { label: 'Enterprise', color: 'bg-purple-500', icon: Layout },
  { label: 'Improved', color: 'bg-green-500', icon: Terminal },
  { label: 'Fixed', color: 'bg-orange-500', icon: Bug },
  { label: 'Security', color: 'bg-red-500', icon: Terminal },
  { label: 'B2B Features', color: 'bg-indigo-500', icon: ExternalLink },
]

export default function ChangelogForm({ initialData = null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    version: initialData?.version || '',
    content: initialData?.content || '',
    imageUrl: initialData?.imageUrl || '',
    releaseDate: initialData?.releaseDate ? new Date(initialData.releaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    published: initialData?.published || false,
    tags: initialData?.tags || [],
    newFeaturesCount: initialData?.newFeaturesCount || 0,
    bugFixesCount: initialData?.bugFixesCount || 0,
    apiDocsUrl: initialData?.apiDocsUrl || '',
    githubRepoUrl: initialData?.githubRepoUrl || '',
    authorName: initialData?.authorName || '',
    authorImage: initialData?.authorImage || '',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const toggleTag = (tag) => {
    setFormData(prev => {
      const tags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
      return { ...prev, tags }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (initialData?.id) {
        await api.patch(`/changelog/${initialData.id}`, formData)
        toast.success('Changelog updated successfully')
      } else {
        await api.post('/changelog', formData)
        toast.success('Changelog created successfully')
      }
      router.push('/cms/changelog')
      router.refresh()
    } catch (error) {
      console.error('Error saving changelog:', error)
      toast.error('Failed to save changelog')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Enterprise Dashboard Revamp"
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Version</label>
                  <input
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                    placeholder="e.g., v2.4.0"
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Release Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      name="releaseDate"
                      value={formData.releaseDate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content / Description (Markdown supported)</label>
                <textarea
                  required
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={12}
                  placeholder="Describe the update details, bullet points, etc..."
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4" /> Attributes & Tags
              </h3>

              <div className="space-y-3">
                <label className="text-sm font-medium">Select Tags</label>
                <div className="flex flex-wrap gap-2">
                  {TAG_OPTIONS.map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => toggleTag(opt.label)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${formData.tags.includes(opt.label)
                        ? `${opt.color} text-white shadow-md scale-105`
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                        }`}
                    >
                      <opt.icon className="h-3.5 w-3.5" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Features Count</label>
                  <input
                    type="number"
                    name="newFeaturesCount"
                    value={formData.newFeaturesCount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bug Fixes Count</label>
                  <input
                    type="number"
                    name="bugFixesCount"
                    value={formData.bugFixesCount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Cover Image
              </h3>
              <div className="space-y-2">
                <input
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 text-xs rounded-lg border bg-background focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <p className="text-[10px] text-muted-foreground">URL to a representative image for this update.</p>
              </div>
              {formData.imageUrl && (
                <div className="aspect-video rounded-lg overflow-hidden border">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                Author Info
              </h3>
              <div className="space-y-2 text-sm">
                <label>Author Name</label>
                <input
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleChange}
                  placeholder="e.g., Sarah Chen"
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div className="space-y-2 text-sm">
                <label>Author Image URL</label>
                <input
                  name="authorImage"
                  value={formData.authorImage}
                  onChange={handleChange}
                  placeholder="URL to avatar..."
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                Links
              </h3>
              <div className="space-y-2 text-sm">
                <label>API Documentation</label>
                <input
                  name="apiDocsUrl"
                  value={formData.apiDocsUrl}
                  onChange={handleChange}
                  placeholder="URL..."
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div className="space-y-2 text-sm">
                <label>GitHub Repository</label>
                <input
                  name="githubRepoUrl"
                  value={formData.githubRepoUrl}
                  onChange={handleChange}
                  placeholder="URL..."
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className={formData.published ? 'bg-green-50/50 border-green-200' : 'bg-gray-50'}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-semibold">Published Status</label>
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.published
                  ? 'This update will be visible to all users on the public changelog page.'
                  : 'This update is currently a draft and only visible in the CMS.'}
              </p>
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 gap-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white border-none"
                >
                  {loading ? 'Saving...' : <><Save className="h-4 w-4" /> Save Update</>}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/cms/changelog')}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
