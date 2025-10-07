import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"
import { CloudUpload, FileImage } from 'lucide-react';

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