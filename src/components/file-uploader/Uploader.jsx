"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from "@/components/ui/card"
import { RenderEmptyState, RenderErrorState } from "./RenderState"
import { cn } from "@/lib/utils";
import { toast } from "sonner"
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export function Uploader() {
  const [fileState, setFileState] = useState({
    error: false,
    file: null,
    id: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    fileType: "image",
  })

  async function uploadFile(file) {
    setFileState((prev) => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: false,
    }))

    const form = new FormData();
    form.append('file', file, file.name);

    try {
      const res = await axios.post('/api/admin/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setFileState((prev) => ({ ...prev, progress: percent }));
          }
        },
      });

      const data = res?.data || {};
      if (data.url) {
        setFileState((prev) => ({ ...prev, uploading: false, progress: 100, url: data.url }));
        toast.success('Upload successful');
        return data;
      }

      setFileState((prev) => ({ ...prev, uploading: false, error: true }));
      const message = data?.error || `Upload failed with status ${res.status}`;
      toast.error(message);
      throw new Error(message);
    } catch (err) {
      setFileState((prev) => ({ ...prev, uploading: false, error: true }));
      const message = err?.response?.data?.error || err.message || 'Upload failed';
      toast.error(message);
      throw err;
    }
  }

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]

      setFileState({
        file: file,
        uploading: false,
        progress: 0,
        objectUrl: URL.createObjectURL(file),
        error: false,
        id: uuidv4(),
        isDeleting: false,
        fileType: 'image',
      })
      // Start upload immediately and track progress
      uploadFile(file).catch(() => {
        // errors are already handled with toast and state
      })
    }
  }, [])

  function rejectedFiles(fileRejection) {
    if (fileRejection.length) {
      const tooManyFiles = fileRejection.find(
        (rejection) => rejection.errors[0].code === 'too-many-files'
      )
      const fileSizeToBig = fileRejection.find(
        (rejection) => rejection.errors[0].code === 'file-too-large'
      )

      if (fileSizeToBig) {
        toast.error('File size exceeded, Max: 5MB');
      }

      if (tooManyFiles) {
        toast.error('Too many files selected, max: 1');
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    maxSize: 5 * 1024 * 1024, //5MB upload limit
    onDropRejected: rejectedFiles,
  })

  return (
    <Card
      {...getRootProps()}
      className={cn("relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64",
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary")}
    >
      <CardContent className="flex items-center justify-center h-full w-full p-4">
        <input {...getInputProps()} />
        <RenderEmptyState isDragActive={isDragActive} />
        {/* <RenderErrorState /> */}
      </CardContent>
    </Card>
  )
}