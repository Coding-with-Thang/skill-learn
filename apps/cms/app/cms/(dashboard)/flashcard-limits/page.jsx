'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/cms/ui/card'
import api from '@skill-learn/lib/utils/axios.js'
import { Badge } from '@/components/cms/ui/badge'
import { Button } from '@/components/cms/ui/button'
import { Input } from '@/components/cms/ui/input'
import { cn } from '@/lib/cms/utils'
import { Layers, Loader2, RefreshCw, Save } from 'lucide-react'

export default function FlashcardLimitsPage() {
  const [limits, setLimits] = useState([])
  const [edits, setEdits] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetchLimits = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/flashcard-tier-limits')
      const list = response.data?.limits || []
      setLimits(list)
      setEdits({})
    } catch (err) {
      console.error('Error fetching flashcard limits:', err)
      setError(err.response?.data?.error || err.message || 'Failed to fetch limits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLimits()
  }, [])

  const handleChange = (tier, field, value) => {
    const v = field === 'maxDecks' || field === 'maxCardsPerDeck'
      ? (value === '' || value === '-1' ? -1 : parseInt(value, 10))
      : value
    setEdits((prev) => ({
      ...prev,
      [tier]: {
        ...(prev[tier] || {}),
        [field]: isNaN(v) ? (field === 'maxDecks' ? -1 : 1) : v,
      },
    }))
  }

  const getValue = (tier, field) => {
    let val
    if (edits[tier]?.[field] !== undefined) val = edits[tier][field]
    else {
      const row = limits.find((l) => l.tier === tier)
      val = row?.[field] ?? (field === 'maxDecks' ? 3 : 30)
    }
    if ((field === 'maxDecks' || field === 'maxCardsPerDeck') && val === -1) return ''
    return val
  }

  const handleSave = async () => {
    const payload = Object.entries(edits).map(([tier, data]) => ({
      tier,
      ...data,
    }))
    if (payload.length === 0) return

    try {
      setSaving(true)
      setError(null)
      await api.patch('/flashcard-tier-limits', { limits: payload })
      await fetchLimits()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const hasEdits = Object.keys(edits).length > 0

  const getPlanColor = (tier) => {
    const colors = {
      free: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      starter: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    }
    return colors[tier?.toLowerCase()] || 'bg-gray-100 text-gray-700'
  }

  if (loading && limits.length === 0) {
    return (
      <div className="p-4 lg:p-6 w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-7 w-7" />
            Flash Card Tier Limits
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure deck and card limits per subscription tier. Used by tenants based on their plan.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={fetchLimits} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasEdits}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save changes
          </Button>
        </div>
      </motion.div>

      {error && (
        <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-4">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Limits by tier</CardTitle>
          <CardDescription>
            Max decks: -1 or empty = unlimited. Max cards per deck: positive number or -1/empty = unlimited.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Tier</th>
                  <th className="text-left py-3 px-4 font-medium">Max decks</th>
                  <th className="text-left py-3 px-4 font-medium">Max cards per deck</th>
                </tr>
              </thead>
              <tbody>
                {['free', 'starter', 'pro', 'enterprise'].map((tier) => (
                  <tr key={tier} className="border-b last:border-0">
                    <td className="py-4 px-4">
                      <Badge className={cn("font-medium capitalize", getPlanColor(tier))}>
                        {tier}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 max-w-[140px]">
                        <Input
                          type="number"
                          min={-1}
                          placeholder="-1 = unlimited"
                          value={getValue(tier, 'maxDecks')}
                          onChange={(e) => handleChange(tier, 'maxDecks', e.target.value)}
                          className="font-mono"
                        />
                        {getValue(tier, 'maxDecks') === '' || getValue(tier, 'maxDecks') === -1 ? (
                          <span className="text-xs text-muted-foreground">∞</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 max-w-[140px]">
                        <Input
                          type="number"
                          min={-1}
                          placeholder="-1 = unlimited"
                          value={getValue(tier, 'maxCardsPerDeck')}
                          onChange={(e) => handleChange(tier, 'maxCardsPerDeck', e.target.value)}
                          className="font-mono"
                        />
                        {getValue(tier, 'maxCardsPerDeck') === '' ? (
                          <span className="text-xs text-muted-foreground">∞</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
