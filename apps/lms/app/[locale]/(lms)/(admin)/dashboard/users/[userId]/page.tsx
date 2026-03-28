"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { ArrowLeft, BookOpen, HelpCircle, Coins, Calendar, Pencil, RefreshCw, Trash2, Monitor, CheckCircle2, Smartphone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import api from "@skill-learn/lib/utils/axios";
import { parseApiResponse, parseApiError } from "@skill-learn/lib/utils/apiResponseParser";
import { Button } from "@skill-learn/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@skill-learn/ui/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@skill-learn/ui/components/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@skill-learn/ui/components/table";
import { Badge } from "@skill-learn/ui/components/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@skill-learn/ui/components/dialog";
import { Textarea } from "@skill-learn/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@skill-learn/ui/components/select";
import { Checkbox } from "@skill-learn/ui/components/checkbox";
import { useAdminUserProgressStore } from "@skill-learn/lib";

type ProgressOptionQuiz = {
  id: string;
  title: string;
  attempts: number;
  passedAttempts: number;
  bestScore?: number | null;
};
type ProgressOptionCourse = { id: string; title: string; completedAt: string | Date | null };
type ProgressOptionPointLog = {
  id: string;
  amount: number;
  reason: string;
  reasonDisplay?: string;
  createdAt: string;
};
type ProgressOptions = {
  quizzes: ProgressOptionQuiz[];
  courses: ProgressOptionCourse[];
  pointLogs: ProgressOptionPointLog[];
};

type ContentStatus = "not_started" | "in_progress" | "completed";

type ProfilePayload = {
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    imageUrl?: string | null;
    createdAt: string;
    tenantRole?: string | null;
  };
  points: { current: number; lifetimeEarned: number };
  contentSummary: {
    courses: { total: number; completed: number; inProgress: number; notStarted: number };
    quizzes: { total: number; completed: number; inProgress: number; notStarted: number };
  };
  courses: Array<{
    id: string;
    title: string;
    status: ContentStatus;
    completedLessons: number;
    totalLessons: number;
    progressPercent: number;
    completedAt: string | null;
    coverImageUrl?: string | null;
  }>;
  quizzes: Array<{
    id: string;
    title: string;
    status: ContentStatus;
    attempts: number;
    passedAttempts: number;
    bestScore: number | null;
  }>;
  pointLogs: Array<{
    id: string;
    amount: number;
    reason: string;
    reasonDisplay?: string;
    createdAt: string;
  }>;
  pointLogsPagination: { page: number; limit: number; total: number; pages: number };
  activityLog: Array<{
    id: string;
    occurredAt: string;
    activityType: string;
    details: string;
    deviceLabel: string;
    isMobile: boolean;
    ipAddress: string | null;
    action: string;
    category: string;
  }>;
  activityWindow: { hours: number; limit: number; total: number };
};

function statusBadgeClass(status: ContentStatus) {
  switch (status) {
    case "completed":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
    case "in_progress":
      return "bg-amber-500/15 text-amber-800 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function pointLogCategoryLabel(reason: string, tr: (key: string) => string) {
  const r = reason.toLowerCase();
  if (r.startsWith("quiz_completed_") || r.startsWith("perfect_score_bonus_")) {
    return tr("pointCategoryAcademic");
  }
  if (r.startsWith("progress_reset_")) return tr("pointCategoryAdmin");
  if (r.startsWith("points_spent_")) return tr("pointCategoryRedemption");
  if (r.includes("course")) return tr("pointCategoryCourse");
  if (r.includes("quiz")) return tr("pointCategoryAcademic");
  return tr("pointCategoryGeneral");
}

function securityActivityBadgeClass(action: string, category: string) {
  const a = (action || "").toLowerCase();
  const c = (category || "").toLowerCase();
  if (c === "auth" || a === "login" || a === "logout") {
    return "bg-[#ecfdf5] text-[#059669] hover:bg-[#d1fae5] border-0";
  }
  if (a.includes("attempt") || a.includes("quiz")) {
    return "bg-[#e0e7ff] text-[#4338ca] hover:bg-[#c7d2fe] border-0";
  }
  if (a === "delete" || c.includes("rbac")) {
    return "bg-rose-100 text-rose-800 hover:bg-rose-200 border-0";
  }
  return "bg-slate-100 text-slate-600 hover:bg-slate-200 border-0";
}

export default function AdminUserProfilePage() {
  const params = useParams();
  const userId = typeof params?.userId === "string" ? params.userId : "";
  const t = useTranslations("adminUserProfile");
  const tu = useTranslations("adminDashboardUsers");
  const tAudit = useTranslations("adminAuditLogs");

  const [data, setData] = useState<ProfilePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pointsPage, setPointsPage] = useState(1);
  const pointsLimit = 50;

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetReason, setResetReason] = useState("");
  const [resetScope, setResetScope] = useState<"all" | "quiz" | "course" | "points">("all");
  const [resetQuizId, setResetQuizId] = useState("");
  const [resetCourseId, setResetCourseId] = useState("");
  const [resetPointsMode, setResetPointsMode] = useState<"none" | "total" | "logs">("none");
  const [selectedPointLogIds, setSelectedPointLogIds] = useState<string[]>([]);
  const [progressOptions, setProgressOptions] = useState<ProgressOptions | null>(null);
  const [progressOptionsLoading, setProgressOptionsLoading] = useState(false);

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [logToArchive, setLogToArchive] = useState<ProfilePayload["pointLogs"][number] | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archivingLogId, setArchivingLogId] = useState<string | null>(null);

  const {
    resetUserProgress,
    isLoading: isResetting,
    error: resetError,
  } = useAdminUserProgressStore();

  const displayName = useMemo(() => {
    if (!data) return "";
    const n = [data.user.firstName, data.user.lastName].filter(Boolean).join(" ");
    return n || data.user.username;
  }, [data]);

  const avatarInitials = useMemo(() => {
    if (!data) return "";
    const a = data.user.firstName?.[0] ?? "";
    const b = data.user.lastName?.[0] ?? "";
    if (a || b) return `${a}${b}`;
    return (data.user.username?.slice(0, 2) ?? "?").toUpperCase();
  }, [data]);

  const mergedQuizOptions = useMemo((): ProgressOptionQuiz[] => {
    if (!data) return [];
    const fromApi = new Map((progressOptions?.quizzes ?? []).map((q) => [q.id, q]));
    return data.quizzes.map((q) => {
      const row = fromApi.get(q.id);
      return {
        id: q.id,
        title: q.title,
        attempts: row?.attempts ?? q.attempts,
        passedAttempts: row?.passedAttempts ?? q.passedAttempts,
        bestScore: row?.bestScore ?? q.bestScore,
      };
    });
  }, [data, progressOptions]);

  const mergedCourseOptions = useMemo((): ProgressOptionCourse[] => {
    if (!data) return [];
    const fromApi = new Map((progressOptions?.courses ?? []).map((c) => [c.id, c]));
    return data.courses.map((c) => {
      const row = fromApi.get(c.id);
      return {
        id: c.id,
        title: c.title,
        completedAt: row?.completedAt ?? c.completedAt ?? null,
      };
    });
  }, [data, progressOptions]);

  const closeResetDialog = useCallback(() => {
    setResetDialogOpen(false);
    setResetReason("");
    setResetScope("all");
    setResetQuizId("");
    setResetCourseId("");
    setResetPointsMode("none");
    setSelectedPointLogIds([]);
  }, []);

  const openResetDialog = useCallback(
    (preset?: {
      scope?: "all" | "quiz" | "course" | "points";
      quizId?: string;
      courseId?: string;
      resetPointsMode?: "none" | "total" | "logs";
    }) => {
      setResetDialogOpen(true);
      setResetReason("");
      const scope = preset?.scope ?? "all";
      setResetScope(scope);
      setResetQuizId(preset?.quizId ?? "");
      setResetCourseId(preset?.courseId ?? "");
      if (scope === "points") {
        setResetPointsMode(preset?.resetPointsMode === "logs" ? "logs" : "total");
        setSelectedPointLogIds([]);
      } else {
        setResetPointsMode(preset?.resetPointsMode ?? "none");
        setSelectedPointLogIds([]);
      }
    },
    []
  );

  useEffect(() => {
    if (!resetDialogOpen || !userId) return;
    setProgressOptionsLoading(true);
    api
      .get(`/admin/users/${userId}/progress-options`)
      .then((res) => {
        const parsed = parseApiResponse(res) as ProgressOptions | null;
        setProgressOptions(parsed ?? { quizzes: [], courses: [], pointLogs: [] });
      })
      .catch(() => setProgressOptions({ quizzes: [], courses: [], pointLogs: [] }))
      .finally(() => setProgressOptionsLoading(false));
  }, [resetDialogOpen, userId]);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(
        `/admin/users/${userId}/profile?pointsPage=${pointsPage}&pointsLimit=${pointsLimit}&activityHours=24&activityLimit=30`
      );
      const payload = parseApiResponse(res) as ProfilePayload | null;
      setData(
        payload
          ? {
              ...payload,
              activityLog: payload.activityLog ?? [],
              activityWindow: payload.activityWindow ?? { hours: 24, limit: 30, total: 0 },
            }
          : null
      );
    } catch (e) {
      setError(parseApiError(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userId, pointsPage]);

  useEffect(() => {
    void load();
  }, [load]);

  const canConfirmReset =
    resetReason.trim().length > 0 &&
    (resetScope === "all" ||
      (resetScope === "quiz" && !!resetQuizId) ||
      (resetScope === "course" && !!resetCourseId) ||
      (resetScope === "points" &&
        (resetPointsMode === "total" || (resetPointsMode === "logs" && selectedPointLogIds.length > 0))));

  const openArchiveDialog = useCallback((log: ProfilePayload["pointLogs"][number]) => {
    setLogToArchive(log);
    setArchiveReason("");
    setArchiveError(null);
    setArchiveDialogOpen(true);
  }, []);

  const closeArchiveDialog = useCallback(() => {
    setArchiveDialogOpen(false);
    setLogToArchive(null);
    setArchiveReason("");
    setArchiveError(null);
  }, []);

  const handleConfirmArchivePointLog = async () => {
    if (!userId || !logToArchive || archiveReason.trim().length === 0) return;
    setArchiveError(null);
    setArchivingLogId(logToArchive.id);
    try {
      await api.post(`/admin/users/${userId}/point-logs/${logToArchive.id}/archive`, {
        reason: archiveReason.trim(),
      });
      closeArchiveDialog();
      await load();
    } catch (e) {
      setArchiveError(parseApiError(e));
    } finally {
      setArchivingLogId(null);
    }
  };

  const handleConfirmReset = async () => {
    if (!userId || !data || !canConfirmReset) return;
    const result = await resetUserProgress({
      userId,
      reason: resetReason.trim() || tu("defaultResetReason"),
      scope: resetScope,
      quizId: resetScope === "quiz" ? resetQuizId : undefined,
      courseId: resetScope === "course" ? resetCourseId : undefined,
      resetPointsMode:
        resetScope === "all" || resetScope === "quiz" || resetScope === "course"
          ? resetPointsMode
          : resetScope === "points"
            ? resetPointsMode === "none"
              ? "total"
              : resetPointsMode
            : "none",
      pointLogIds: resetPointsMode === "logs" ? selectedPointLogIds : [],
    });
    if (result !== null) {
      closeResetDialog();
      await load();
    }
  };

  if (!userId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">{t("invalidUser")}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/users">{t("backToUsers")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost" size="sm" className="w-fit gap-2 -ml-2">
          <Link href="/dashboard/users">
            <ArrowLeft className="h-4 w-4" />
            {t("backToUsers")}
          </Link>
        </Button>
      </div>

      {loading && !data && (
        <div className="text-center py-16 text-muted-foreground">{tu("loading") || "Loading..."}</div>
      )}

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {data && (
        <div className="space-y-8 max-w-5xl mx-auto font-sans">
          {/* Header Card */}
          <Card className="border-0 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-[104px] w-[104px] rounded-2xl border-4 border-white shadow-sm overflow-hidden bg-slate-100">
                  {data.user.imageUrl ? (
                    <AvatarImage src={data.user.imageUrl} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="rounded-none text-3xl font-semibold text-slate-400 bg-transparent flex items-center justify-center w-full h-full">
                    {avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <Badge
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#008761] hover:bg-[#008761] text-white border-white border-[3px] px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-md uppercase shadow-sm max-w-[90%] truncate"
                  title={data.user.tenantRole ?? undefined}
                >
                  {(data.user.tenantRole ?? "").replace(/_/g, " ") || t("roleMember")}
                </Badge>
              </div>
              <div className="space-y-1.5 pt-1">
                <h2 className="text-[28px] font-bold text-[#2A313C] leading-none">
                  {[data.user.firstName, data.user.lastName].filter(Boolean).join(" ") || data.user.username}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-slate-500 font-medium">
                  <span>@{data.user.username}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-[12px]" title={data.user.id}>
                    {t("userIdLabel")}: {data.user.id.slice(-8)}
                  </span>
                </div>
                {data.user.email ? (
                  <div className="text-[12px] text-slate-500" title={t("userEmailHint")}>
                    {data.user.email}
                  </div>
                ) : null}
                <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mt-2 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {t("memberSince")} {format(new Date(data.user.createdAt), "MMMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-6 sm:mt-0 w-full sm:w-auto">
              <Button
                onClick={() => openResetDialog({ scope: "all" })}
                className="bg-[#008761] hover:bg-[#007050] text-white rounded-xl h-[42px] px-5 flex gap-2 font-bold shadow-sm transition-all w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4" /> {tu("resetProgress")}
              </Button>
              <Button
                variant="secondary"
                className="bg-[#F3F6F9] hover:bg-[#E2E8F0] text-[#475569] rounded-xl h-[42px] px-5 flex gap-2 font-bold transition-all w-full sm:w-auto border border-slate-100"
                asChild
              >
                <Link href={`/dashboard/users?edit=${encodeURIComponent(data.user.id)}`}>
                  <Pencil className="h-4 w-4" /> {t("editProfile")}
                </Link>
              </Button>
            </div>
          </Card>

          {/* Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] rounded-2xl p-7 bg-white relative overflow-hidden group">
              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 tracking-[0.1em] uppercase">
                    {t("currentPoints")}
                  </p>
                  <p className="text-[40px] font-bold text-[#1a56db] leading-none tracking-tight">{data.points.current.toLocaleString()}</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] shadow-sm transform transition-transform group-hover:scale-105">
                  <Coins className="h-6 w-6" />
                </div>
              </div>
            </Card>
            <Card className="border-0 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] rounded-2xl p-7 bg-white relative overflow-hidden group">
              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 tracking-[0.1em] uppercase">
                    {t("lifetimePoints")}
                  </p>
                  <p className="text-[40px] font-bold text-[#008761] leading-none tracking-tight">{data.points.lifetimeEarned.toLocaleString()}</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-[#effaf6] flex items-center justify-center text-[#008761] shadow-sm transform transition-transform group-hover:scale-105">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* Summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] rounded-2xl p-7 bg-white">
              <div className="flex items-center gap-2 mb-6 text-[17px] font-bold text-[#1E293B]">
                <BookOpen className="h-[22px] w-[22px] text-[#008761]" /> {t("coursesSummary")}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F8FAFC] rounded-2xl py-5 px-2 flex flex-col items-center justify-center gap-1.5 border border-slate-50">
                  <span className="text-[28px] font-bold text-[#008761] leading-none">{data.contentSummary.courses.completed}</span>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1 text-center">{t("completed")}</span>
                </div>
                <div className="bg-[#F8FAFC] rounded-2xl py-5 px-2 flex flex-col items-center justify-center gap-1.5 border border-slate-50">
                  <span className="text-[28px] font-bold text-[#3B82F6] leading-none">{data.contentSummary.courses.inProgress}</span>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1 text-center">{t("inProgress")}</span>
                </div>
                <div className="bg-[#F8FAFC] rounded-2xl py-5 px-2 flex flex-col items-center justify-center gap-1.5 border border-slate-50">
                  <span className="text-[28px] font-bold text-[#94A3B8] leading-none">{data.contentSummary.courses.notStarted}</span>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1 text-center">{t("notStarted")}</span>
                </div>
              </div>
            </Card>
            <Card className="border-0 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] rounded-2xl p-7 bg-white">
              <div className="flex items-center gap-2 mb-6 text-[17px] font-bold text-[#1E293B]">
                <HelpCircle className="h-[22px] w-[22px] text-[#6366F1]" /> {t("quizzesSummary")}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="bg-[#F8FAFC] rounded-2xl py-5 px-2 flex flex-col items-center justify-center gap-1.5 border border-slate-50"
                  title={t("quizSummaryPassedDescription")}
                >
                  <span className="text-[28px] font-bold text-[#008761] leading-none">{data.contentSummary.quizzes.completed}</span>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1 text-center">{t("passed")}</span>
                </div>
                <div
                  className="bg-[#F8FAFC] rounded-2xl py-5 px-2 flex flex-col items-center justify-center gap-1.5 border border-slate-50"
                  title={t("quizSummaryNotStartedDescription")}
                >
                  <span className="text-[28px] font-bold text-[#94A3B8] leading-none">{data.contentSummary.quizzes.notStarted}</span>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1 text-center">{t("notStarted")}</span>
                </div>
                <div
                  className="bg-[#F8FAFC] rounded-2xl py-5 px-2 flex flex-col items-center justify-center gap-1.5 border border-slate-50"
                  title={t("quizSummaryInProgressDescription")}
                >
                  <span className="text-[28px] font-bold text-[#3B82F6] leading-none">{data.contentSummary.quizzes.inProgress}</span>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1 text-center">{t("inProgress")}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Course Progress */}
          <div className="space-y-5 pt-3">
            <h3 className="text-xl font-bold text-[#1E293B]">{t("coursesTitle")}</h3>
            <div className="space-y-4">
              {data.courses.length === 0 ? (
                <div className="text-sm text-slate-500 py-4 bg-white rounded-2xl p-6 shadow-sm border-0">
                  {t("noCourseProgressDetail")}
                </div>
              ) : (
                data.courses.map((c, i) => (
                  <Card key={c.id} className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-[20px] p-5 flex items-center gap-6 bg-white overflow-hidden relative">
                    <div
                      className="h-[72px] w-[108px] rounded-xl shrink-0 bg-slate-100 bg-cover bg-center border border-slate-100"
                      style={
                        c.coverImageUrl
                          ? { backgroundImage: `url(${c.coverImageUrl})` }
                          : {
                              backgroundImage:
                                i % 2 === 0
                                  ? "linear-gradient(135deg, #81D4C6 0%, #68BBAE 100%)"
                                  : "linear-gradient(135deg, #F9F1EB 0%, #EFE1D6 100%)",
                            }
                      }
                      aria-hidden
                    />
                    <div className="flex-1 min-w-0 pr-8">
                      <h4 className="font-bold text-[#1E293B] text-[16px] truncate">{c.title}</h4>
                      <p className="text-[12px] text-slate-500 mt-1">
                        {t("lessonsProgressLine", {
                          completed: c.completedLessons,
                          total: c.totalLessons,
                        })}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="h-2 flex-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${c.status === 'completed' ? 'bg-[#008761]' : 'bg-[#3B82F6]'}`} style={{ width: `${c.progressPercent}%` }} />
                        </div>
                        <span className="text-[12px] font-bold text-[#008761] w-8 text-right">{c.progressPercent}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0 z-10">
                      <Badge className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] rounded-full ${
                        c.status === 'completed' ? 'bg-[#5eead4]/40 text-[#0f766e] hover:bg-[#5eead4]/60 border-0' :
                        c.status === 'in_progress' ? 'bg-[#dbeafe] text-[#1d4ed8] hover:bg-[#bfdbfe] border-0' :
                        'bg-slate-100 text-slate-600 hover:bg-slate-200 border-0'
                      }`}>
                        {t(`status.${c.status}`)}
                      </Badge>
                      <Button variant="ghost" size="icon" className="text-[#94A3B8] hover:text-[#0f766e] hover:bg-[#ccfbf1]/50 h-9 w-9 rounded-full" onClick={() => openResetDialog({ scope: "course", courseId: c.id })}>
                        <RefreshCw className="h-[18px] w-[18px]" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Quiz Progress */}
          <div className="space-y-4 pt-3">
            <h3 className="text-xl font-bold text-[#1E293B]">{t("quizzesTitle")}</h3>
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-[#F8FAFC]">
                  <TableRow className="border-b border-white hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest h-14 pl-6">
                      {t("titleCol")}
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest h-14 w-[160px]">
                      {t("statusCol")}
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest h-14 text-center w-[120px]">
                      {t("attempts")}
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest h-14 text-center w-[120px]">
                      {t("bestScore")}
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest h-14 text-right pr-8 w-[100px]">
                      {t("actionsCol")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.quizzes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                        {t("noQuizProgressDetail")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.quizzes.map(q => (
                      <TableRow key={q.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-bold text-[#1E293B] text-[15px] pl-6 h-16">{q.title}</TableCell>
                        <TableCell>
                          <Badge className={`px-3 py-1 text-[9px] font-bold uppercase tracking-[0.1em] rounded-full ${
                            q.status === 'completed' ? 'bg-[#34d399]/30 text-[#047857] hover:bg-[#34d399]/40 border-0' :
                            q.status === 'in_progress' ? 'bg-[#e0e7ff] text-[#4338ca] hover:bg-[#c7d2fe] border-0' :
                            'bg-slate-100 text-slate-600 hover:bg-slate-200 border-0'
                          }`}>
                            {q.status === "completed" ? t("passed") : t(`status.${q.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#475569] text-center text-[14px] font-medium">{q.attempts}</TableCell>
                        <TableCell className="text-center font-bold text-[#008761] text-[14px]">{q.bestScore != null ? `${Math.round(q.bestScore)}%` : '-'}</TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="icon" className="text-[#94A3B8] hover:text-white hover:bg-rose-500 h-[34px] w-[34px] rounded-lg transition-colors" onClick={() => openResetDialog({ scope: "quiz", quizId: q.id })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Point Allocations */}
          <div className="space-y-4 pt-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1E293B]">{t("pointAllocationsTitle")}</h3>
                {data.pointLogsPagination.total > 0 ? (
                  <p className="text-[12px] text-slate-500 mt-1">
                    {t("pointAllocationsDescription", {
                      showing: data.pointLogs.length,
                      total: data.pointLogsPagination.total,
                    })}
                  </p>
                ) : null}
              </div>
              <Button variant="ghost" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-[13px] font-bold flex gap-2 h-9 px-4 rounded-xl w-fit" onClick={() => openResetDialog({ scope: "points", resetPointsMode: "total" })}>
                <RefreshCw className="h-[14px] w-[14px]" /> {t("resetPointsFromProfile")}
              </Button>
            </div>
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-[#F8FAFC]">
                  <TableRow className="border-b border-white hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest h-14 pl-6 w-[20%]">{t("dateCol")}</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest h-14 w-[15%]">{t("amountCol")}</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest h-14 w-[40%]">{t("reasonCol")}</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest h-14 w-[15%]">{t("categoryCol")}</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest h-14 text-right pr-8 w-[100px]">{t("actionCol")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.pointLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                        {t("noPointLogs")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.pointLogs.map(log => (
                      <TableRow key={log.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-[14px] text-[#64748B] pl-6 h-[52px]">
                          {format(new Date(log.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className={`font-bold text-[15px] ${log.amount >= 0 ? "text-[#008761]" : "text-rose-600"}`}>
                          {log.amount > 0 ? "+" : ""}{log.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-[14px] text-[#334155] font-medium">
                          {log.reasonDisplay ?? log.reason}
                        </TableCell>
                        <TableCell>
                          <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">
                            {pointLogCategoryLabel(log.reason, t)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-[#94A3B8] hover:text-white hover:bg-rose-500 h-[34px] w-[34px] rounded-lg transition-colors"
                            disabled={archivingLogId !== null}
                            aria-label={t("removePointLog")}
                            onClick={() => openArchiveDialog(log)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {data.pointLogsPagination.pages > 1 ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-[#F1F5F9]">
                  <span className="text-[12px] text-slate-500">
                    {t("pageOf", {
                      page: data.pointLogsPagination.page,
                      pages: data.pointLogsPagination.pages,
                    })}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pointsPage <= 1 || loading}
                      onClick={() => setPointsPage((p) => Math.max(1, p - 1))}
                    >
                      {t("previous")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pointsPage >= data.pointLogsPagination.pages || loading}
                      onClick={() => setPointsPage((p) => p + 1)}
                    >
                      {t("next")}
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>
          </div>

          {/* User Activity Log */}
          <div className="space-y-4 pt-4 pb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1E293B]">{t("activityLogTitle")}</h3>
              <div
                className="flex items-center gap-2 text-[10px] font-bold text-[#008761] uppercase tracking-widest bg-teal-50 px-3 py-1.5 rounded-full"
                title={t("activityWindowHint", { hours: data.activityWindow?.hours ?? 24 })}
              >
                {t("activityLastHours", { hours: data.activityWindow?.hours ?? 24 })}{" "}
                <div className="h-1.5 w-1.5 rounded-full bg-[#008761]" />
              </div>
            </div>
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white p-0 pb-4">
              <Table>
                <TableHeader className="bg-transparent">
                  <TableRow className="border-b border-[#F1F5F9] hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest h-14 pl-6 border-b-0 w-[20%]">
                      {t("activityDateTimeCol")}
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest h-14 border-b-0 w-[20%]">
                      {t("activityTypeCol")}
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest h-14 border-b-0 w-[40%]">
                      {t("activityDetailsCol")}
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest h-14 border-b-0 w-[20%]">
                      {t("activityDeviceCol")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.activityLog?.length ?? 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500 py-10">
                        {t("activityEmpty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.activityLog.map((row) => (
                      <TableRow
                        key={row.id}
                        className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
                      >
                        <TableCell className="py-4 pl-6">
                          <div className="text-[13px] font-medium text-[#334155]">
                            {format(new Date(row.occurredAt), "MMM d, yyyy")}
                          </div>
                          <div className="text-[11px] text-[#94A3B8] mt-1">
                            {format(new Date(row.occurredAt), "h:mm a")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${securityActivityBadgeClass(row.action, row.category)} text-[10px] font-bold uppercase tracking-[0.05em] px-2.5 py-1 whitespace-nowrap rounded-[6px] max-w-[200px] truncate inline-block`}
                            title={row.activityType}
                          >
                            {row.activityType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[13px] font-medium text-[#475569] max-w-md">
                          <span className="line-clamp-3">{row.details}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-[12px] font-medium text-[#64748B] flex items-center gap-2">
                            {row.isMobile ? (
                              <Smartphone className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                            ) : (
                              <Monitor className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                            )}
                            {row.deviceLabel}
                          </div>
                          {row.ipAddress ? (
                            <div className="text-[10px] text-[#CBD5E1] ml-6 mt-1 tracking-wider font-mono">
                              {row.ipAddress}
                            </div>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="mt-5 text-center">
                <Link
                  href="/dashboard/audit-logs"
                  className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#008761] uppercase tracking-[0.1em] hover:text-[#007050] transition-colors"
                >
                  {tAudit("viewAllAuditLogs")}
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}

      <Dialog
        open={resetDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeResetDialog();
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tu("resetProgressTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {resetError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {resetError}
              </div>
            )}
            <p>
              {displayName
                ? tu("resetProgressDescription", { name: displayName })
                : null}
            </p>

            <div className="space-y-1">
              <label className="text-sm font-medium">{tu("resetScopeLabel")}</label>
              <Select
                value={resetScope}
                onValueChange={(v) => {
                  setResetScope(v as "all" | "quiz" | "course" | "points");
                  setResetQuizId("");
                  setResetCourseId("");
                  if (v === "points") {
                    setResetPointsMode("total");
                  } else {
                    setResetPointsMode("none");
                  }
                  setSelectedPointLogIds([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tu("resetScopeAll")}</SelectItem>
                  <SelectItem value="quiz">{tu("resetScopeQuiz")}</SelectItem>
                  <SelectItem value="course">{tu("resetScopeCourse")}</SelectItem>
                  <SelectItem value="points">{tu("resetScopePoints")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {resetScope === "quiz" && (
              <div className="space-y-1">
                <label className="text-sm font-medium">{tu("resetQuizLabel")}</label>
                <Select
                  value={resetQuizId}
                  onValueChange={setResetQuizId}
                  disabled={!data || progressOptionsLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !data || progressOptionsLoading ? t("loading") : tu("resetQuizPlaceholder")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {mergedQuizOptions.map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.title} (attempts: {q.attempts}, passed: {q.passedAttempts})
                      </SelectItem>
                    ))}
                    {!progressOptionsLoading && mergedQuizOptions.length === 0 && (
                      <SelectItem value="__none" disabled>
                        {tu("noQuizProgress")}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {resetScope === "course" && (
              <div className="space-y-1">
                <label className="text-sm font-medium">{tu("resetCourseLabel")}</label>
                <Select
                  value={resetCourseId}
                  onValueChange={setResetCourseId}
                  disabled={!data || progressOptionsLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !data || progressOptionsLoading ? t("loading") : tu("resetCoursePlaceholder")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {mergedCourseOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title} {c.completedAt ? "✓" : ""}
                      </SelectItem>
                    ))}
                    {!progressOptionsLoading && mergedCourseOptions.length === 0 && (
                      <SelectItem value="__none" disabled>
                        {tu("noCourseProgress")}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {resetScope === "points" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{tu("resetPointsModeLabel")}</label>
                <Select
                  value={resetPointsMode === "none" ? "total" : resetPointsMode}
                  onValueChange={(v) => {
                    setResetPointsMode(v as "total" | "logs");
                    if (v !== "logs") setSelectedPointLogIds([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total">{tu("resetPointsModeTotal")}</SelectItem>
                    <SelectItem value="logs">{tu("resetPointsModeLogs")}</SelectItem>
                  </SelectContent>
                </Select>
                {resetPointsMode === "logs" && (
                  <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
                    <p className="text-xs text-muted-foreground">{tu("selectPointLogs")}</p>
                    {(progressOptions?.pointLogs ?? []).map((log) => (
                      <div key={log.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`profile-log-${log.id}`}
                          checked={selectedPointLogIds.includes(log.id)}
                          onCheckedChange={(checked) =>
                            setSelectedPointLogIds((prev) =>
                              checked ? [...prev, log.id] : prev.filter((id) => id !== log.id)
                            )
                          }
                        />
                        <label htmlFor={`profile-log-${log.id}`} className="text-sm cursor-pointer">
                          {log.amount > 0 ? "+" : ""}
                          {log.amount} — {log.reasonDisplay ?? log.reason}{" "}
                          ({new Date(log.createdAt).toLocaleDateString()})
                        </label>
                      </div>
                    ))}
                    {(progressOptions?.pointLogs?.length ?? 0) === 0 && (
                      <p className="text-sm text-muted-foreground">{tu("noPointLogs")}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {(resetScope === "all" || resetScope === "quiz" || resetScope === "course") && (
              <div className="space-y-1">
                <label className="text-sm font-medium">{tu("resetPointsModeLabel")}</label>
                <Select
                  value={resetPointsMode}
                  onValueChange={(v) => setResetPointsMode(v as "none" | "total" | "logs")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tu("resetPointsModePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{tu("resetPointsModeNone")}</SelectItem>
                    <SelectItem value="total">{tu("resetPointsModeTotal")}</SelectItem>
                    <SelectItem value="logs">{tu("resetPointsModeLogs")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">{tu("resetReasonLabel")}</label>
              <Textarea
                value={resetReason}
                onChange={(e) => setResetReason(e.target.value)}
                placeholder={tu("resetReasonPlaceholder")}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={closeResetDialog}>
                {tu("cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isResetting || !canConfirmReset}
                onClick={() => void handleConfirmReset()}
              >
                {isResetting ? tu("resetting") : tu("confirmReset")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={archiveDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeArchiveDialog();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("removePointLogTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("removePointLogDescription")}</p>
            {logToArchive && (
              <p className="text-sm font-medium text-[#334155]">
                {t("removePointLogConfirmHint", {
                  amount:
                    (logToArchive.amount > 0 ? "+" : "") + logToArchive.amount.toLocaleString(),
                  date: format(new Date(logToArchive.createdAt), "MMM d, yyyy"),
                })}
              </p>
            )}
            {archiveError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                {archiveError}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium">{t("archiveReasonLabel")}</label>
              <Textarea
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder={t("archiveReasonPlaceholder")}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={closeArchiveDialog}>
                {tu("cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={archivingLogId !== null || archiveReason.trim().length === 0}
                onClick={() => void handleConfirmArchivePointLog()}
              >
                {archivingLogId ? t("archivingPointLog") : t("archivePointLog")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
