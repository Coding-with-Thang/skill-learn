"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { cn } from "@skill-learn/lib/utils.js";
import { toast } from "sonner";
import axios from "axios";
import { CloudUpload, FileImage, X, Loader2 } from "lucide-react";

// --- Render states (exported for customization if needed) ---

export function RenderEmptyState({ isDragActive }) {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-muted mb-4">
        <CloudUpload
          className={cn("size-6 text-muted-foreground", isDragActive && "text-primary")}
        />
      </div>
      <p className="text-base font-semibold text-foreground">
        Drop your files here or{" "}
        <span className="text-primary font-bold cursor-pointer">click to upload</span>
      </p>
      <Button type="button" className="mt-4">
        Select File
      </Button>
    </div>
  );
}

export function RenderErrorState() {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-destructive/30 mb-4">
        <FileImage className="size-6 text-destructive" />
      </div>
      <p className="text-base font-semibold">Upload Failed</p>
      <p className="text-xs mt-1 text-muted-foreground">Something went wrong</p>
      <Button type="button" className="mt-4">
        Retry
      </Button>
    </div>
  );
}

export function RenderUploadedState({ previewUrl, onDelete, isDeleting }) {
  return (
    <div className="relative w-full h-full min-h-[200px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt="Uploaded file"
        className="w-full h-full min-h-[200px] object-contain p-2"
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-4 right-4"
        onClick={onDelete}
        aria-label="Delete uploaded file"
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <X className="size-4" />
        )}
      </Button>
    </div>
  );
}

export function RenderUploadingState({ progress, file }) {
  return (
    <div className="text-center flex flex-col justify-center items-center">
      <p>{progress}%</p>
      <p className="mt-2 text-sm font-medium text-foreground">Uploading...</p>
      {file?.name && (
        <p className="mt-1 text-xs text-muted-foreground truncate max-w-xs">
          {file.name}
        </p>
      )}
    </div>
  );
}

// --- Main Uploader ---

/**
 * Shared file uploader for LMS and CMS.
 * API: value (url string), onChange(url), onUploadComplete({ url, path }?), uploadEndpoint, optional className, name (for forms).
 */
export function Uploader({
  value,
  onChange,
  onUploadComplete,
  uploadEndpoint = "/api/admin/upload",
  className,
  name,
}) {
  const [url, setUrl] = useState(value ?? undefined);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

  const uploadFile = useCallback(
    async (file) => {
      setUploading(true);
      setProgress(0);
      setCurrentFile(file);
      const form = new FormData();
      form.append("file", file, file.name);
      try {
        const res = await axios.post(uploadEndpoint, form, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
          },
        });
        const data = res?.data;
        const uploadData = data?.data ?? data;
        if (uploadData?.url) {
          setUrl(uploadData.url);
          onChange?.(uploadData.url);
          onUploadComplete?.(uploadData);
          toast.success("Upload successful");
        } else {
          console.error("[Uploader] Invalid response format:", data);
          toast.error("Upload failed: Invalid response format");
        }
      } catch (err) {
        console.error("[Uploader] upload error", err);
        toast.error("Upload failed");
      } finally {
        setUploading(false);
        setProgress(0);
        setCurrentFile(null);
      }
    },
    [uploadEndpoint, onChange, onUploadComplete]
  );

  useEffect(() => {
    if (typeof value === "string" && value !== url) {
      setUrl(value);
    }
  }, [value, url]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const f = acceptedFiles?.[0];
      if (f) uploadFile(f);
    },
    [uploadFile]
  );

  const handleRemoveFile = async () => {
    if (!url || isDeleting) return;
    setIsDeleting(true);
    try {
      setUrl(undefined);
      onChange?.("");
      onUploadComplete?.(undefined);
      toast.success("File removed");
    } catch (err) {
      console.error("[Uploader] delete error", err);
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "image/*": [] },
    disabled: uploading || !!url,
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed w-full min-h-[200px]",
        isDragActive ? "border-primary bg-primary/10" : "border-border",
        className
      )}
    >
      <CardContent className="flex items-center justify-center w-full h-full min-h-[200px] p-4">
        <input {...getInputProps()} name={name} id={name} />
        {uploading ? (
          <RenderUploadingState progress={progress} file={currentFile} />
        ) : url ? (
          <RenderUploadedState
            previewUrl={url}
            onDelete={handleRemoveFile}
            isDeleting={isDeleting}
          />
        ) : (
          <RenderEmptyState isDragActive={isDragActive} />
        )}
      </CardContent>
    </Card>
  );
}
