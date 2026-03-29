"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import api from "@skill-learn/lib/utils/axios"
import { parseApiResponse } from "@skill-learn/lib/utils/apiResponseParser"
import { Button } from "@skill-learn/ui/components/button"
import { Table } from "@skill-learn/ui/components/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@skill-learn/ui/components/dialog"
import { Input } from "@skill-learn/ui/components/input"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@skill-learn/ui/components/alert-dialog"
import { useUsersStore } from "@skill-learn/lib/stores/usersStore"
import { usePermissionsStore } from "@skill-learn/lib/stores/permissionsStore"
import UserDetails from "@/components/user/UserDetails"
import { useAdminUserProgressStore } from "@skill-learn/lib"
import { Textarea } from "@skill-learn/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@skill-learn/ui/components/select"
import { Checkbox } from "@skill-learn/ui/components/checkbox"
import UserForm from "@/components/user/UserForm"
import { UserFilters } from "@/components/user/UserFilters"
import { Link } from "@/i18n/navigation"

type ProgressOptionQuiz = { id: string; title: string; attempts: number; passedAttempts: number; bestScore?: number | null }
type ProgressOptionCourse = { id: string; title: string; completedAt: string | Date | null }
type ProgressOptionPointLog = { id: string; amount: number; reason: string; createdAt: string }
type ProgressOptions = {
  quizzes: ProgressOptionQuiz[]
  courses: ProgressOptionCourse[]
  pointLogs: ProgressOptionPointLog[]
}

type UserItem = {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  tenantRole?: string;
  createdAt?: string;
  isActive?: boolean;
  reportsTo?: { firstName?: string; lastName?: string };
};

export default function UsersPage() {
  const t = useTranslations("adminDashboardUsers");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { users, isLoading, error, fetchUsers } = useUsersStore();
  const hasPermission = usePermissionsStore((s) => s.hasPermission);
  const fetchPermissions = usePermissionsStore((s) => s.fetchPermissions);

  const canDeleteUsers = hasPermission("users.delete");
  const canUpdateUsers = hasPermission("users.update");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [errorUsers, setErrorUsers] = useState<string | null>(null)
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null)
  const [userToToggleActive, setUserToToggleActive] = useState<{
    user: UserItem;
    activate: boolean;
  } | null>(null)
  const [resetReason, setResetReason] = useState("")
  const [resetScope, setResetScope] = useState<"all" | "quiz" | "course" | "points">("all")
  const [resetQuizId, setResetQuizId] = useState("")
  const [resetCourseId, setResetCourseId] = useState("")
  const [resetPointsMode, setResetPointsMode] = useState<"none" | "total" | "logs">("none")
  const [selectedPointLogIds, setSelectedPointLogIds] = useState<string[]>([])
  const [userToReset, setUserToReset] = useState<UserItem | null>(null)
  const [progressOptions, setProgressOptions] = useState<ProgressOptions | null>(null)
  const [progressOptionsLoading, setProgressOptionsLoading] = useState(false)
  const [oobRecoveryDialogOpen, setOobRecoveryDialogOpen] = useState(false)
  const [userForOobRecovery, setUserForOobRecovery] = useState<UserItem | null>(null)
  const [oobRecoverySubmitting, setOobRecoverySubmitting] = useState(false)
  const [oobRecoveryError, setOobRecoveryError] = useState<string | null>(null)

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || !users || !Array.isArray(users)) return;
    const list = users as UserItem[];
    const match = list.find((u) => u.id === editId);
    if (!match) return;
    setEditingUser(match);
    setShowForm(true);
  }, [searchParams, users]);

  const stripEditQueryParam = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    if (!next.has("edit")) return;
    next.delete("edit");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, searchParams]);

  const {
    resetUserProgress,
    isLoading: isResetting,
    error: resetError,
  } = useAdminUserProgressStore()

  useEffect(() => {
    if (!userToReset?.id) return
    setProgressOptionsLoading(true)
    api.get(`/admin/users/${userToReset.id}/progress-options`).then((res) => {
      const data = parseApiResponse(res) as ProgressOptions | null
      setProgressOptions(data ?? { quizzes: [], courses: [], pointLogs: [] })
    }).catch(() => setProgressOptions({ quizzes: [], courses: [], pointLogs: [] })).finally(() => setProgressOptionsLoading(false))
  }, [userToReset?.id])

  const activeUserCount = useMemo(() => {
    if (!users || !Array.isArray(users)) return 0;
    return (users as UserItem[]).filter((u) => u.isActive !== false).length;
  }, [users]);

  const cannotDeactivateUser = useCallback(
    (user: UserItem) => user.isActive !== false && activeUserCount <= 1,
    [activeUserCount]
  );

  const filteredUsers = useMemo((): UserItem[] => {
    if (!users || !Array.isArray(users)) return [];
    const list = users as UserItem[];
    return list
      .filter(user => {
        const matchesSearch = searchTerm
          ? (user.firstName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.lastName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.username ?? '').toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        const matchesRole = roleFilter === 'all' ? true : (user.tenantRole ?? '') === roleFilter;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return `${a.firstName ?? ''} ${a.lastName ?? ''}`.localeCompare(`${b.firstName ?? ''} ${b.lastName ?? ''}`);
          case 'role':
            return (a.tenantRole || '').localeCompare(b.tenantRole || '');
          case 'recent':
            return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
          default:
            return 0;
        }
      });
  }, [users, searchTerm, roleFilter, sortBy]);

  const handleSubmit = async (formData) => {
    try {
      if (editingUser) {
        await useUsersStore.getState().updateUser(editingUser.id, formData)
        setEditingUser(null)
      } else {
        await useUsersStore.getState().createUser(formData)
      }
      setShowForm(false)
      await fetchUsers(true)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setErrorUsers(e.response?.data?.error || t("errorGeneric"))
    }
  }

  const handleEdit = (user: UserItem) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDeleteClick = (user: UserItem) => {
    setUserToDelete(user)
  }

  const handleResetClick = (user: UserItem) => {
    setUserToReset(user)
    setResetReason("")
    setResetScope("all")
    setResetQuizId("")
    setResetCourseId("")
    setResetPointsMode("none")
    setSelectedPointLogIds([])
  }

  const canConfirmReset =
    resetReason.trim().length > 0 &&
    (resetScope === "all" ||
      (resetScope === "quiz" && !!resetQuizId) ||
      (resetScope === "course" && !!resetCourseId) ||
      (resetScope === "points" && (resetPointsMode === "total" || (resetPointsMode === "logs" && selectedPointLogIds.length > 0))))

  const handleConfirmReset = async () => {
    if (!userToReset || !canConfirmReset) return

    await resetUserProgress({
      userId: userToReset.id,
      reason: resetReason.trim() || t("defaultResetReason"),
      scope: resetScope,
      ...(resetScope === "quiz" && resetQuizId ? { quizId: resetQuizId } : {}),
      ...(resetScope === "course" && resetCourseId ? { courseId: resetCourseId } : {}),
      resetPointsMode:
        resetScope === "all" || resetScope === "quiz" || resetScope === "course"
          ? resetPointsMode
          : resetScope === "points"
            ? resetPointsMode === "none"
              ? "total"
              : resetPointsMode
            : "none",
      pointLogIds: resetPointsMode === "logs" ? selectedPointLogIds : [],
    })
    setUserToReset(null)
    setResetReason("")
    setResetScope("all")
    setResetQuizId("")
    setResetCourseId("")
    setResetPointsMode("none")
    setSelectedPointLogIds([])
  }

  const handleToggleActiveConfirm = async () => {
    if (!userToToggleActive) return;
    const { user, activate } = userToToggleActive;
    try {
      await useUsersStore.getState().updateUser(user.id, { isActive: activate });
      setUserToToggleActive(null);
      await fetchUsers(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setErrorUsers(e.response?.data?.error || t("toggleActiveError"));
      setUserToToggleActive(null);
    }
  };

  const handleDeleteConfirm = async (user: UserItem | null) => {
    if (!user) return
    try {
      await useUsersStore.getState().deleteUser(user.id)
      setUserToDelete(null)
      await fetchUsers(true)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setErrorUsers(e.response?.data?.error || t("errorDelete"))
      setUserToDelete(null)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => {
              setEditingUser(null);
              setShowForm(true);
              stripEditQueryParam();
            }}
            variant="default"
          >
            {t("addUser")}
          </Button>
        </div>
      </div>

      {errorUsers && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorUsers}
        </div>
      )}

      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false);
            setEditingUser(null);
            setErrorUsers(null);
            stripEditQueryParam();
          }
        }}
      >
        <DialogContent>
          {showForm && (
            <>
              <DialogHeader className="mb-4">
                <DialogTitle className="text-lg font-bold">{editingUser ? t("editUser") : t("createUser")}</DialogTitle>
              </DialogHeader>
              <UserForm
                key={editingUser ? String(editingUser.id) : 'new'}
                user={editingUser}
                onSuccess={async () => {
                  setShowForm(false);
                  setEditingUser(null);
                  stripEditQueryParam();
                  await fetchUsers(true);
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={userToToggleActive !== null}
        onOpenChange={(open) => !open && setUserToToggleActive(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToToggleActive?.activate
                ? t("reactivateConfirmTitle")
                : t("deactivateConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToToggleActive?.activate
                ? t("reactivateConfirmDescription", {
                    name: userToToggleActive
                      ? `${userToToggleActive.user.firstName} ${userToToggleActive.user.lastName} (${userToToggleActive.user.username})`
                      : "",
                  })
                : t("deactivateConfirmDescription", {
                    name: userToToggleActive
                      ? `${userToToggleActive.user.firstName} ${userToToggleActive.user.lastName} (${userToToggleActive.user.username})`
                      : "",
                  })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-center sm:justify-center">
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleToggleActiveConfirm()}
              className={
                userToToggleActive?.activate
                  ? ""
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
            >
              {userToToggleActive?.activate ? t("reactivate") : t("deactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={userToDelete !== null} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmDescription", { name: userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName} (${userToDelete.username})` : t("deleteConfirmThisUser") })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-center sm:justify-center">
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteConfirm(userToDelete)}
              className="bg-destructive text-brand-tealestructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UserFilters
        onFilterChange={(type, value) => {
          switch (type) {
            case 'search':
              setSearchTerm(value);
              break;
            case 'role':
              setRoleFilter(value);
              break;
            case 'sort':
              setSortBy(value);
              break;
          }
        }}
      />

      {isLoading ? (
        <div className="text-center py-4">{t("loading")}</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <Table>
          <thead>
            <tr className="bg-gray-200">
              <th className="p-4 text-left">{t("username")}</th>
              <th className="p-4 text-left">{t("firstName")}</th>
              <th className="p-4 text-left">{t("lastName")}</th>
              <th className="p-4 text-left">{t("reportsTo")}</th>
              <th className="p-4 text-left">{t("role")}</th>
              <th className="p-4 text-left">{t("status")}</th>
              <th className="p-4 text-left">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-4">{user.username}</td>
                <td className="p-4">{user.firstName}</td>
                <td className="p-4">{user.lastName}</td>
                <td className="p-4">
                  {user.reportsTo
                    ? `${user.reportsTo.firstName} ${user.reportsTo.lastName}`
                    : "—"}
                </td>
                <td className="p-4">{user.tenantRole || t("noRole")}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${user.isActive === false ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                  >
                    {user.isActive === false ? t("inactive") : t("active")}
                  </span>
                </td>
                <td className="p-4 space-x-4">
                  <Button type="button" onClick={() => handleEdit(user)} variant="secondary">
                    {t("edit")}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/dashboard/users/${user.id}`}>{t("viewProfile")}</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleResetClick(user)}
                  >
                    {t("resetProgress")}
                  </Button>
                  {canUpdateUsers && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setUserForOobRecovery(user);
                        setOobRecoveryError(null);
                        setOobRecoveryDialogOpen(true);
                      }}
                    >
                      {t("sendSecureRecovery")}
                    </Button>
                  )}
                  {canUpdateUsers && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        user.isActive !== false ? cannotDeactivateUser(user) : false
                      }
                      title={
                        user.isActive !== false && cannotDeactivateUser(user)
                          ? t("cannotDeactivateLastUser")
                          : undefined
                      }
                      onClick={() =>
                        setUserToToggleActive({
                          user,
                          activate: user.isActive === false,
                        })
                      }
                    >
                      {user.isActive === false ? t("reactivate") : t("deactivate")}
                    </Button>
                  )}
                  {canDeleteUsers && (
                    <Button type="button" onClick={() => handleDeleteClick(user)} variant="destructive">
                      {t("delete")}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  {t("noUsersFound")}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <Dialog open={selectedUser !== null} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : t("userDetails")}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && <UserDetails user={selectedUser} />}
        </DialogContent>
      </Dialog>

      <Dialog open={userToReset !== null} onOpenChange={(open) => {
        if (!open) {
          setUserToReset(null)
          setResetReason("")
          setResetScope("all")
          setResetQuizId("")
          setResetCourseId("")
          setResetPointsMode("none")
          setSelectedPointLogIds([])
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("resetProgressTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {resetError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {resetError}
              </div>
            )}
            <p>
              {userToReset
                ? t("resetProgressDescription", {
                    name: `${userToReset.firstName} ${userToReset.lastName} (${userToReset.username})`,
                  })
                : null}
            </p>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t("resetScopeLabel")}</label>
              <Select
                value={resetScope}
                onValueChange={(v) => {
                  setResetScope(v as "all" | "quiz" | "course" | "points")
                  setResetQuizId("")
                  setResetCourseId("")
                  if (v !== "points") setResetPointsMode("none")
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("resetScopeAll")}</SelectItem>
                  <SelectItem value="quiz">{t("resetScopeQuiz")}</SelectItem>
                  <SelectItem value="course">{t("resetScopeCourse")}</SelectItem>
                  <SelectItem value="points">{t("resetScopePoints")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {resetScope === "quiz" && (
              <div className="space-y-1">
                <label className="text-sm font-medium">{t("resetQuizLabel")}</label>
                <Select value={resetQuizId} onValueChange={setResetQuizId} disabled={progressOptionsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={progressOptionsLoading ? t("loading") : t("resetQuizPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(progressOptions?.quizzes ?? []).map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.title} (attempts: {q.attempts}, passed: {q.passedAttempts})
                      </SelectItem>
                    ))}
                    {!progressOptionsLoading && (progressOptions?.quizzes?.length ?? 0) === 0 && (
                      <SelectItem value="__none" disabled>{t("noQuizProgress")}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {resetScope === "course" && (
              <div className="space-y-1">
                <label className="text-sm font-medium">{t("resetCourseLabel")}</label>
                <Select value={resetCourseId} onValueChange={setResetCourseId} disabled={progressOptionsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={progressOptionsLoading ? t("loading") : t("resetCoursePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(progressOptions?.courses ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title} {c.completedAt ? "✓" : ""}
                      </SelectItem>
                    ))}
                    {!progressOptionsLoading && (progressOptions?.courses?.length ?? 0) === 0 && (
                      <SelectItem value="__none" disabled>{t("noCourseProgress")}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {resetScope === "points" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("resetPointsModeLabel")}</label>
                <Select
                  value={resetPointsMode === "none" ? "total" : resetPointsMode}
                  onValueChange={(v) => { setResetPointsMode(v as "total" | "logs"); if (v !== "logs") setSelectedPointLogIds([]) }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total">{t("resetPointsModeTotal")}</SelectItem>
                    <SelectItem value="logs">{t("resetPointsModeLogs")}</SelectItem>
                  </SelectContent>
                </Select>
                {resetPointsMode === "logs" && (
                  <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
                    <p className="text-xs text-muted-foreground">{t("selectPointLogs")}</p>
                    {(progressOptions?.pointLogs ?? []).map((log) => (
                      <div key={log.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`log-${log.id}`}
                          checked={selectedPointLogIds.includes(log.id)}
                          onCheckedChange={(checked) =>
                            setSelectedPointLogIds((prev) =>
                              checked ? [...prev, log.id] : prev.filter((id) => id !== log.id)
                            )
                          }
                        />
                        <label htmlFor={`log-${log.id}`} className="text-sm cursor-pointer">
                          {log.amount > 0 ? "+" : ""}{log.amount} — {log.reason} ({new Date(log.createdAt).toLocaleDateString()})
                        </label>
                      </div>
                    ))}
                    {(progressOptions?.pointLogs?.length ?? 0) === 0 && (
                      <p className="text-sm text-muted-foreground">{t("noPointLogs")}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {(resetScope === "all" || resetScope === "quiz" || resetScope === "course") && (
              <div className="space-y-1">
                <label className="text-sm font-medium">{t("resetPointsModeLabel")}</label>
                <Select
                  value={resetPointsMode}
                  onValueChange={(v) => setResetPointsMode(v as "none" | "total" | "logs")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("resetPointsModePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("resetPointsModeNone")}</SelectItem>
                    <SelectItem value="total">{t("resetPointsModeTotal")}</SelectItem>
                    <SelectItem value="logs">{t("resetPointsModeLogs")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">{t("resetReasonLabel")}</label>
              <Textarea
                value={resetReason}
                onChange={(e) => setResetReason(e.target.value)}
                placeholder={t("resetReasonPlaceholder")}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => { setUserToReset(null); setResetReason("") }}>
                {t("cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isResetting || !canConfirmReset}
                onClick={handleConfirmReset}
              >
                {isResetting ? t("resetting") : t("confirmReset")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={oobRecoveryDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setUserForOobRecovery(null);
            setOobRecoveryError(null);
          }
          setOobRecoveryDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("oobRecoveryTitle")}</DialogTitle>
            <DialogDescription>
              {userForOobRecovery
                ? t("oobRecoveryDescription", {
                    name: `${userForOobRecovery.firstName ?? ""} ${userForOobRecovery.lastName ?? ""} (@${userForOobRecovery.username ?? ""})`.trim(),
                  })
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">{t("oobRecoveryHint")}</p>
            {oobRecoveryError ? (
              <p className="text-sm text-destructive" role="alert">
                {oobRecoveryError}
              </p>
            ) : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOobRecoveryDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              disabled={oobRecoverySubmitting || !userForOobRecovery?.id}
              onClick={async () => {
                if (!userForOobRecovery?.id) return;
                setOobRecoverySubmitting(true);
                setOobRecoveryError(null);
                try {
                  const res = await api.post(`/admin/users/${userForOobRecovery.id}/reset-password`, {});
                  const inner = (res.data?.data ?? res.data) as { message?: string };
                  toast.success(inner?.message || t("oobRecoverySuccess"));
                  setOobRecoveryDialogOpen(false);
                } catch (err: unknown) {
                  const ax = err as { response?: { data?: { error?: string } }; message?: string };
                  setOobRecoveryError(
                    ax.response?.data?.error ||
                      (err instanceof Error ? err.message : t("oobRecoveryError"))
                  );
                } finally {
                  setOobRecoverySubmitting(false);
                }
              }}
            >
              {oobRecoverySubmitting ? t("loadingSubmit") : t("oobRecoverySend")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}