'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/cms/ui/card'
import { Button } from '@/components/cms/ui/button'
import { Badge } from '@/components/cms/ui/badge'
import { Save, X, Image as ImageIcon, Plus, Trash2, Layout, Calendar as CalendarIcon, Tag, Terminal, ExternalLink, Bug, Sparkles, HelpCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import api from '@skill-learn/lib/utils/axios.js'
import { toast } from 'sonner'
import { Uploader } from "@skill-learn/ui/components/file-uploader"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@skill-learn/ui/components/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@skill-learn/ui/components/select'

const TAG_OPTIONS = [
  { label: 'New', color: 'bg-blue-500', icon: Sparkles },
  { label: 'Enterprise', color: 'bg-purple-500', icon: Layout },
  { label: 'Improved', color: 'bg-green-500', icon: Terminal },
  { label: 'Fixed', color: 'bg-orange-500', icon: Bug },
  { label: 'Security', color: 'bg-red-500', icon: Terminal },
  { label: 'B2B Features', color: 'bg-indigo-500', icon: ExternalLink },
]

export default function ChangelogForm({ initialData = null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [superAdmins, setSuperAdmins] = useState([])
  const [loadingAdmins, setLoadingAdmins] = useState(true)
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

  // Fetch super admins on mount
  useEffect(() => {
    const fetchSuperAdmins = async () => {
      try {
        setLoadingAdmins(true)
        const response = await api.get('/admin/super-admins')
        console.log('Super admins response:', response.data)
        if (response.data?.superAdmins) {
          setSuperAdmins(response.data.superAdmins)
          console.log('Loaded super admins:', response.data.superAdmins.length)
        } else {
          console.warn('No superAdmins in response:', response.data)
          toast.error('No super admins found')
        }
      } catch (error) {
        console.error('Error fetching super admins:', error)
        console.error('Error details:', error.response?.data || error.message)
        toast.error('Failed to load super admins')
      } finally {
        setLoadingAdmins(false)
      }
    }
    fetchSuperAdmins()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAuthorChange = (authorId) => {
    const selectedAdmin = superAdmins.find(admin => admin.id === authorId)
    if (selectedAdmin) {
      setFormData(prev => ({
        ...prev,
        authorName: selectedAdmin.fullName,
        authorImage: selectedAdmin.imageUrl || ''
      }))
    }
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
      // Convert number fields to integers
      const submitData = {
        ...formData,
        newFeaturesCount: formData.newFeaturesCount != null && formData.newFeaturesCount !== '' 
          ? parseInt(formData.newFeaturesCount, 10) || 0 
          : 0,
        bugFixesCount: formData.bugFixesCount != null && formData.bugFixesCount !== '' 
          ? parseInt(formData.bugFixesCount, 10) || 0 
          : 0,
      }

      if (initialData?.id) {
        await api.patch(`/changelog/${initialData.id}`, submitData)
        toast.success('Changelog updated successfully')
      } else {
        await api.post('/changelog', submitData)
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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Content / Description (Markdown supported)</label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        aria-label="Markdown help"
                      >
                        <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Markdown Guide</DialogTitle>
                        <DialogDescription>
                          Learn how to format your content using Markdown
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 text-sm">
                        <div>
                          <h4 className="font-semibold mb-2">Headers</h4>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`# H1 Header
## H2 Header
### H3 Header`}
                          </pre>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Text Formatting</h4>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`**bold text**
*italic text*
~~strikethrough~~`}
                          </pre>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Lists</h4>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`- Unordered item
- Another item

1. Ordered item
2. Another item`}
                          </pre>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Links & Images</h4>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`[Link text](https://example.com)
![Image alt](https://example.com/image.jpg)`}
                          </pre>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Code</h4>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`\`inline code\`

\`\`\`javascript
// Code block
const example = "code";
\`\`\``}
                          </pre>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Blockquotes</h4>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`> This is a blockquote
> It can span multiple lines`}
                          </pre>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
                  {TAG_OPTIONS.map(opt => {
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => toggleTag(opt.label)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${formData.tags.includes(opt.label)
                          ? `${opt.color} text-white shadow-md scale-105`
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                          }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {opt.label}
                      </button>
                    )
                  })}
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
                <Uploader
                  value={formData.imageUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url || '' }))}
                  uploadEndpoint="/api/admin/upload"
                />
                <p className="text-[10px] text-muted-foreground">Drag and drop an image or click to upload. Images will be automatically resized to fit.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                Author Info
              </h3>
              <div className="space-y-2 text-sm">
                <label>Author (Super Admin)</label>
                <Select
                  value={superAdmins.find(admin => admin.fullName === formData.authorName)?.id || ''}
                  onValueChange={handleAuthorChange}
                  disabled={loadingAdmins}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingAdmins ? "Loading..." : "Select an author"} />
                  </SelectTrigger>
                  <SelectContent>
                    {superAdmins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        <div className="flex items-center gap-2">
                          {admin.imageUrl && (
                            <img 
                              src={admin.imageUrl} 
                              alt={admin.fullName}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          )}
                          <span>{admin.fullName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

          <Card className={formData.published ? 'border-green-500/50 dark:border-green-400/50' : ''}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-semibold">Published Status</label>
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-input bg-background text-teal-600 focus:ring-teal-500 focus:ring-2"
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
