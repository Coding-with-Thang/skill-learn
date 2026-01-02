import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { CloudUpload, FileImage, X, Loader2 } from 'lucide-react';

export function RenderEmptyState({ isDragActive }) {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-muted mb-4">
        <CloudUpload className={cn("size-6 text-muted-foreground",
          isDragActive && "text-primary"
        )} />
      </div>
      <p className="text-base font-semibold text-foreground">Drop your files here or <span className="text-primary font-bold cursor-pointer">click to upload</span></p>
      <Button
        type="button"
        className="mt-4"
      >Select File</Button>
    </div>
  )
}

export function RenderErrorState() {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-destructive/30 mb-4">
        <FileImage className="size-6 text-destructive" />
      </div>
      <p className="text-base font-semibold">Upload Failed</p>
      <p className="text-xs mt-1 text-muted-foreground ">Something went wrong</p>
      <Button
        type="button"
        className="mt-4"
      >Retry</Button>
    </div>
  )
}

export function RenderUploadedState({ previewUrl, onDelete, isDeleting }) {
  return (
    <div className="relative w-full h-64">
      <Image src={previewUrl} alt="Uploaded File" fill className="object-contain p-2" sizes="(max-width: 768px) 100vw, 768px" />
      <Button
        variant="destructive"
        size="icon"
        className={cn("absolute top-4 right-4")}
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
  )
}

export function RenderUploadingState({ progress, file }) {
  return (
    <div className="text-center flex flex-col justify-center items-center">
      <p>{progress}</p>
      <p className="mt-2 text-sm font-medium text-foreground">Uploading...</p>
      {file?.name && (
        <p className="mt-1 text-xs text-muted-foreground truncate max-w-xs">{file.name}</p>
      )}
    </div>
  )
}