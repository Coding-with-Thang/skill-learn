"use client"

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from "@/components/ui/card"
import { RenderEmptyState, RenderErrorState, RenderUploadedState, RenderUploadingState } from "./RenderState"
import { cn } from "@/constants/utils";
import { toast } from "sonner"
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Minimal, clean uploader implementation to avoid syntax issues.
export function Uploader({ value, onChange, onUploadComplete }) {
  const [url, setUrl] = useState(value || undefined)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (typeof value === 'string' && value !== url) {
      setUrl(value)
    }
  }, [value])

  const uploadFile = async (file) => {
    setUploading(true)
    setProgress(0)
    const form = new FormData()
    form.append('file', file, file.name)
    try {
      const res = await axios.post('/api/admin/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
        }
      })
      const data = res?.data
      if (data?.url) {
        setUrl(data.url)
        onChange?.(data.url)
        onUploadComplete?.(data)
        toast.success('Upload successful')
      } else {
        toast.error('Upload failed')
      }
    } catch (err) {
      console.error('[Uploader] upload error', err)
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles?.[0]
    if (f) uploadFile(f)
  }, [])

  const handleRemoveFile = async () => {
    if (!url || isDeleting) return
    setIsDeleting(true)
    try {
      // If url is an absolute storage url, we rely on server-side delete using `path`.
      // For now, just clear client state and notify parent.
      setUrl(undefined)
      onChange?.("")
      onUploadComplete?.(undefined)
      toast.success('File removed')
    } catch (err) {
      console.error('[Uploader] delete error', err)
      toast.error('Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1, accept: { 'image/*': [] }, disabled: uploading || !!url })

  return (
    <Card {...getRootProps()} className={cn('relative border-2 border-dashed w-full h-64', isDragActive ? 'border-primary bg-primary/10' : 'border-border')}>
      <CardContent className="flex items-center justify-center h-full w-full p-4">
        <input {...getInputProps()} />
        {uploading ? (
          <RenderUploadingState progress={progress} />
        ) : url ? (
          <RenderUploadedState previewUrl={url} onDelete={handleRemoveFile} isDeleting={isDeleting} />
        ) : (
          <RenderEmptyState isDragActive={isDragActive} />
        )}
      </CardContent>
    </Card>
  )
}