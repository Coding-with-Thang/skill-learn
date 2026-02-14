"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@skill-learn/lib/utils"

function Dialog({
  ...props
}) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}) {
  // Explicitly ensure portal renders to document.body to avoid transform containing block issues
  return <DialogPrimitive.Portal data-slot="dialog-portal" container={typeof document !== 'undefined' ? document.body : undefined} {...props} />;
}

function DialogClose({
  ...props
}) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    (<DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[10050] bg-black/50 pointer-events-none",
        className
      )}
      {...props} />)
  );
}

// Selectors for Radix components that render in a portal (e.g. Select, DropdownMenu, Popover).
// Clicks/focus inside these should not close the dialog.
const RADIX_PORTAL_SELECTOR = [
  "[data-radix-popper-content-wrapper]",
  "[data-radix-select-viewport]",
  "[data-radix-select-content]",
  "[data-radix-menu-content]",
  "[data-radix-dropdown-menu-content]",
  "[data-radix-popover-content]",
  "[data-radix-context-menu-content]",
].join(", ");

function isInsideRadixPortal(el: EventTarget | null): boolean {
  return el?.closest?.(RADIX_PORTAL_SELECTOR) ?? false;
}

function DialogContent({
  className,
  children,
  onPointerDownOutside,
  onInteractOutside,
  onFocusOutside,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  const contentRef = React.useRef(null);

  const handlePointerDownOutside = React.useCallback(
    (e) => {
      const target = e.target;
      // Avoid closing when ref not yet set (e.g. first frame after open)
      if (!contentRef.current) {
        e.preventDefault();
        return;
      }
      const isInsideContent = contentRef.current.contains(target);
      const isInsidePortal = isInsideRadixPortal(target);
      if (isInsideContent || isInsidePortal) {
        e.preventDefault();
        return;
      }
      // Focus may have moved to a portalled dropdown; don't close
      if (typeof document !== "undefined" && document.activeElement && isInsideRadixPortal(document.activeElement)) {
        e.preventDefault();
        return;
      }
      if (typeof document !== "undefined" && contentRef.current.contains(document.activeElement)) {
        e.preventDefault();
        return;
      }
      onPointerDownOutside?.(e);
    },
    [onPointerDownOutside]
  );

  const handleInteractOutside = React.useCallback(
    (e) => {
      const target = e.target;
      if (!contentRef.current) {
        e.preventDefault();
        return;
      }
      const isInsideContent = contentRef.current.contains(target);
      const isInsidePortal = isInsideRadixPortal(target);
      if (isInsideContent || isInsidePortal) {
        e.preventDefault();
        return;
      }
      if (typeof document !== "undefined" && document.activeElement && isInsideRadixPortal(document.activeElement)) {
        e.preventDefault();
        return;
      }
      if (typeof document !== "undefined" && contentRef.current.contains(document.activeElement)) {
        e.preventDefault();
        return;
      }
      onInteractOutside?.(e);
    },
    [onInteractOutside]
  );

  const handleFocusOutside = React.useCallback(
    (e) => {
      // Don't close when focus moved to a portalled element (e.g. Select dropdown)
      if (typeof document !== "undefined" && document.activeElement && isInsideRadixPortal(document.activeElement)) {
        e.preventDefault();
        return;
      }
      if (contentRef.current && typeof document !== "undefined" && document.activeElement && contentRef.current.contains(document.activeElement)) {
        e.preventDefault();
        return;
      }
      onFocusOutside?.(e);
    },
    [onFocusOutside]
  );

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={contentRef}
        data-slot="dialog-content"
        className={cn(
          "fixed z-[10051] grid w-[95vw] max-w-lg gap-4 border bg-background p-6 shadow-lg rounded-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 data-[state=open]:visible data-[state=closed]:invisible sm:w-full sm:rounded-lg",
          className
        )}
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        onPointerDownOutside={handlePointerDownOutside}
        onInteractOutside={handleInteractOutside}
        onFocusOutside={handleFocusOutside}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 opacity-70 ring-offset-background transition-all hover:bg-accent hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <XIcon className="h-4 w-4" />
          <span style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: '0',
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            borderWidth: '0'
          }}>Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    (<div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props} />)
  );
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    (<div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props} />)
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    (<DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props} />)
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    (<DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />)
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
