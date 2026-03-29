"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@skill-learn/ui/components/button";
import { Input } from "@skill-learn/ui/components/input";
import { Label } from "@skill-learn/ui/components/label";
import { toast } from "sonner";

export default function ForcePasswordChangePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const t = useTranslations("forcePasswordChange");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const must =
      (user.publicMetadata as { mustChangePassword?: boolean })?.mustChangePassword === true;
    if (!must) {
      router.replace("/home");
    }
  }, [isLoaded, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (newPassword.length < 8) {
      toast.error(t("passwordMin"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordsMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/user/complete-forced-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        success?: boolean;
        data?: { ok?: boolean };
      };
      if (!res.ok) {
        throw new Error(data?.error || t("updateError"));
      }

      await user.reload();
      toast.success(t("success"));
      router.replace("/home");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("updateError");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isLoaded || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-10 px-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new_password">{t("newPassword")}</Label>
          <Input
            id="new_password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">{t("confirmPassword")}</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </form>
    </div>
  );
}
