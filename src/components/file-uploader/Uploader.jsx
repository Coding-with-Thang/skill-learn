"use client"

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from "@/components/ui/card"
import { RenderEmptyState, RenderErrorState, RenderUploadedState, RenderUploadingState } from "./RenderState"
import { cn } from "@/lib/utils";
import { toast } from "sonner"
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export function Uploader({ value, onChange, name, onUploadComplete }) {
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
        setFileState((prev) => ({ ...prev, uploading: false, progress: 100, url: data.url, path: data.path }));
        // notify parent (e.g. react-hook-form) of the uploaded URL (backwards-compatible)
        onChange?.(data.url);
        // provide full upload response (url + path) when parent wants fileKey
        onUploadComplete?.(data);
        toast.success('Upload successful');
        return data;
      }

      setFileState((prev) => ({ ...prev, uploading: false, error: true }));
      const message = data?.error || `Upload failed with status ${res.status}`;
      toast.error(message);
    } catch (err) {
      setFileState((prev) => ({ ...prev, uploading: false, error: true }));
      // Log more details to help debug 404/other network errors
      try {
        console.error('[Uploader] upload error response status:', err?.response?.status, 'data:', err?.response?.data);
      } catch (e) {
        console.error('[Uploader] upload error (no response):', err);
      }
      const message = err?.response?.data?.error || err.message || 'Upload failed';
      toast.error(message);
      throw err;
    }
  }

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]

      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectUrl(fileState.objectUrl)
      }

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
  }, [fileState.objectUrl])

  // Sync external `value` (for example when using react-hook-form Controller)
  useEffect(() => {
    if (typeof value === 'string' && value) {
      // If the current preview is different from the external value, update it.
      if (fileState.objectUrl !== value) {
        setFileState((prev) => ({ ...prev, objectUrl: value, url: value }));
      }
    }
    // only react when `value` changes intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  async function handleRemoveFile() {

    // If already deleting or there's nothing to delete, bail out
    if (fileState.isDeleting || !fileState.objectUrl) return;

    try {
      setFileState((prev) => ({ ...prev, isDeleting: true }));

      // If server-side path is present (uploaded), request deletion
      if (fileState.path) {
        await axios.delete('/api/admin/upload', { data: { path: fileState.path } });
      }

      // Revoke local object URL if it was created locally
      if (fileState.objectUrl && !fileState.objectUrl.startsWith('http')) {
        try { URL.revokeObjectURL(fileState.objectUrl); } catch (e) {
          console.error('Error revoking object URL:', e);
        }
      }

      // Reset state
      setFileState({
        error: false,
        file: null,
        id: null,
        uploading: false,
        progress: 0,
        isDeleting: false,
        fileType: 'image',
      });
      // notify parent/form that the value has been cleared
      // use empty string instead of null/undefined to be compatible with zod string expectation
      onChange?.("");
      toast.success('File deleted');
    } catch (err) {
      setFileState((prev) => ({ ...prev, isDeleting: false }));
      const message = err?.response?.data?.error || err?.message || 'Delete failed';
      toast.error(message);
    }

  }
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

  function renderContent() {
    if (fileState.uploading) {
      return (
        <RenderUploadingState
          file={fileState.file}
          progress={fileState.progress}
        />
      );
    }

    if (fileState.error) {
      return <RenderErrorState />;
    }

    if (fileState.objectUrl) {
      return <RenderUploadedState previewUrl={fileState.objectUrl} onDelete={handleRemoveFile} isDeleting={fileState.isDeleting} />
    }
    return <RenderEmptyState isDragActive={isDragActive} />;
  }

  useEffect(() => {
    return () => {
      if (fileState.objectUrl && !fileState.objectUrl.startsWith('http')) {
        try { URL.revokeObjectURL(fileState.objectUrl); } catch (e) { /* ignore */ }
      }
    }
    // We intentionally only want to run cleanup when the component unmounts or objectUrl changes
  }, [fileState.objectUrl])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    maxSize: 5 * 1024 * 1024, //5MB upload limit
    onDropRejected: rejectedFiles,
    disabled: fileState.uploading || !!fileState.objectUrl,
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
        {renderContent()}
      </CardContent>
    </Card>
  )
}