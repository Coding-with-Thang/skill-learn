"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { cn } from "@skill-learn/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { CloudUpload, FileImage, X, Loader2, Link2, FolderOpen } from "lucide-react";

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
        <FileImage className="size-6 text-brand-tealestructive" />
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
    <div className="relative flex flex-col items-center justify-center w-full min-h-[200px] gap-3">
      <div className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Uploaded file"
          className="size-24 sm:size-28 object-contain rounded-4xld border border-border bg-muted/30"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-1 -right-1 size-6 rounded-full"
          onClick={onDelete}
          aria-label="Delete uploaded file"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <X className="size-3" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Image selected</p>
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

const IMAGE_URL_PATTERN = /^https?:\/\/.+/i;

export interface MediaItem {
  url: string;
  path?: string;
  name?: string;
}

export interface UploaderProps {
  value?: string | null;
  onChange?: (url: string) => void;
  onUploadComplete?: (data?: { url?: string; path?: string }) => void;
  uploadEndpoint?: string;
  mediaListEndpoint?: string;
  api?: typeof axios;
  className?: string;
  name?: string;
}

/**
 * Shared file uploader for LMS and CMS.
 * API: value (url string), onChange(url), onUploadComplete({ url, path }?), uploadEndpoint, optional className, name (for forms).
 * Optional mediaListEndpoint: GET endpoint that returns { data: { items: [{ url, path, name }] } } to enable "Browse" mode.
 * Optional api: authenticated axios-like instance (e.g. from @skill-learn/lib) so media list requests include auth.
 * Users can upload an image, set a URL, or (when mediaListEndpoint is set) browse already uploaded media.
 */
export function Uploader({
  value,
  onChange,
  onUploadComplete,
  uploadEndpoint = "/api/admin/upload",
  mediaListEndpoint,
  api,
  className,
  name,
}: UploaderProps) {
  const [url, setUrl] = useState(value ?? undefined);
  const [mode, setMode] = useState("upload"); // "upload" | "url" | "browse"
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  const applyUrlFromInput = useCallback(() => {
    const trimmed = urlInput?.trim();
    if (!trimmed) {
      toast.error("Please enter an image URL");
      return;
    }
    if (!IMAGE_URL_PATTERN.test(trimmed)) {
      toast.error("Please enter a valid URL (e.g. https://example.com/image.png)");
      return;
    }
    setUrl(trimmed);
    onChange?.(trimmed);
    onUploadComplete?.({ url: trimmed });
  }, [urlInput, onChange, onUploadComplete]);

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

  const fetchMediaList = useCallback(async () => {
    if (!mediaListEndpoint) return;
    setMediaLoading(true);
    try {
      // Use authenticated api when provided (includes Clerk Bearer token for tenant-scoped media)
      const mediaPath = mediaListEndpoint.replace(/^\/api/, "") || "/admin/media";
      const client = api || axios;
      const res = await (api ? client.get(mediaPath) : client.get(mediaListEndpoint, { withCredentials: true }));
      const data = res?.data;
      const raw = data?.data ?? data;
      const list = Array.isArray(raw?.items) ? (raw.items as MediaItem[]) : [];
      setMediaItems(list);
    } catch (err) {
      console.error("[Uploader] media list error", err);
      toast.error("Failed to load media");
      setMediaItems([]);
    } finally {
      setMediaLoading(false);
    }
  }, [mediaListEndpoint, api]);

  const openBrowse = useCallback(() => {
    setBrowseOpen(true);
    fetchMediaList();
  }, [fetchMediaList]);

  const selectMediaItem = useCallback(
    (item: MediaItem) => {
      if (!item?.url) return;
      setUrl(item.url);
      onChange?.(item.url);
      onUploadComplete?.({ url: item.url, ...(item.path != null && { path: item.path }) });
      setBrowseOpen(false);
      toast.success("Image selected");
    },
    [onChange, onUploadComplete]
  );

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

  const isUploadMode = mode === "upload";
  const isUrlMode = mode === "url";
  const isBrowseMode = mode === "browse";
  const canDropzone = isUploadMode && !url && !uploading;

  return (
    <>
      <Card
        {...(canDropzone ? getRootProps() : {})}
        className={cn(
          "relative border-2 border-dashed w-full min-h-[200px]",
          canDropzone && isDragActive ? "border-primary bg-primary/10" : "border-border",
          className
        )}
      >
        <CardContent className="flex flex-col items-center justify-center w-full h-full min-h-[200px] p-4">
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
            <>
              <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-muted mb-4 justify-center">
                <Button
                  type="button"
                  variant={isUploadMode ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setMode("upload")}
                >
                  <CloudUpload className="size-4 mr-1.5" />
                  Upload
                </Button>
                <Button
                  type="button"
                  variant={isUrlMode ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setMode("url")}
                >
                  <Link2 className="size-4 mr-1.5" />
                  URL
                </Button>
                {mediaListEndpoint && (
                  <Button
                    type="button"
                    variant={isBrowseMode ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setMode("browse")}
                  >
                    <FolderOpen className="size-4 mr-1.5" />
                    Browse
                  </Button>
                )}
              </div>
              {isUploadMode && (
                <RenderEmptyState isDragActive={isDragActive} />
              )}
              {isUrlMode && (
                <div
                  className="w-full max-w-sm space-y-2"
                  onClick={(e) => e.stopPropagation()}
                  onDragOver={(e) => e.stopPropagation()}
                >
                  <Input
                    type="url"
                    placeholder="https://example.com/image.png"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrlFromInput())}
                  />
                  <Button type="button" onClick={applyUrlFromInput} className="w-full">
                    Use image URL
                  </Button>
                </div>
              )}
              {isBrowseMode && (
                <div
                  className="text-center"
                  onClick={(e) => e.stopPropagation()}
                  onDragOver={(e) => e.stopPropagation()}
                >
                  <p className="text-sm text-muted-foreground mb-3">
                    Choose from previously uploaded images
                  </p>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openBrowse();
                    }}
                  >
                    <FolderOpen className="size-4 mr-1.5" />
                    Browse media
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col z-[200]">
          <DialogHeader>
            <DialogTitle>Select image</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto min-h-0">
            {mediaLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : mediaItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No uploaded media yet. Upload an image first.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {mediaItems.map((item) => (
                  <button
                    key={item.path || item.url}
                    type="button"
                    className="rounded-lg border border-border overflow-hidden bg-muted/30 hover:border-primary hover:ring-2 hover:ring-primary/20 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    onClick={() => selectMediaItem(item)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.name || "Media"}
                      className="w-full aspect-square object-cover"
                    />
                    {item.name && (
                      <p className="text-xs text-muted-foreground truncate px-1.5 py-1">
                        {item.name}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
