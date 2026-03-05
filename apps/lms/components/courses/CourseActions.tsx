"use client"

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@skill-learn/ui/components/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@skill-learn/ui/components/dialog"
import { Button } from "@skill-learn/ui/components/button"
import { MoreVertical, Pencil, Eye, Trash2, Loader2 } from "lucide-react"
import { Link } from "@/i18n/navigation";

export default function CourseActions({ courseId, courseSlug }) {
  const t = useTranslations("courseActions");
  const slugOrId = courseSlug ?? courseId;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.delete(`/api/admin/courses/${slugOrId}`);
      if (response.data?.status === 'success') {
        toast.success(t("toastDeleted"));
        setShowDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(response.data?.message || t("toastError"));
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? (error instanceof Error ? error.message : t("toastError"));
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/courses/${slugOrId}/edit`}>
              <Pencil className="size-4 mr-2" />
              {t("editCourse")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/courses/${slugOrId}/preview`}>
              <Eye className="size-4 mr-2" />
              {t("preview")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="size-4 mr-2" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteCourse")}</DialogTitle>
            <DialogDescription>
              {t("deleteConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  {t("deleting")}
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                t("delete")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

