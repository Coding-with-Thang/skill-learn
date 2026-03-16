"use client"

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from "next-intl"
import { Button } from "@skill-learn/ui/components/button"
import { Table } from "@skill-learn/ui/components/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@skill-learn/ui/components/dialog"
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
import { Input } from "@skill-learn/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@skill-learn/ui/components/select"
import UserForm from "@/components/user/UserForm"
import { UserFilters } from "@/components/user/UserFilters"

type UserItem = { id: string; firstName?: string; lastName?: string; username?: string; tenantRole?: string; createdAt?: string; reportsTo?: { firstName?: string; lastName?: string } };

export default function UsersPage() {
  const t = useTranslations("adminDashboardUsers");
  const { users, isLoading, error, fetchUsers } = useUsersStore();
  const hasPermission = usePermissionsStore((s) => s.hasPermission);
  const fetchPermissions = usePermissionsStore((s) => s.fetchPermissions);

  const canDeleteUsers = hasPermission("users.delete");

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
  const [resetReason, setResetReason] = useState("")
  const [resetModuleId, setResetModuleId] = useState("")
  const [userToReset, setUserToReset] = useState<UserItem | null>(null)
  const [resetPointsMode, setResetPointsMode] = useState<"none" | "total" | "logs">("none")

  const {
    resetUserProgress,
    isLoading: isResetting,
    error: resetError,
  } = useAdminUserProgressStore()

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
    setResetModuleId("")
    setResetPointsMode("none")
  }

  const handleConfirmReset = async () => {
    if (!userToReset || !resetModuleId.trim()) return

    await resetUserProgress({
      userId: userToReset.id,
      moduleId: resetModuleId.trim(),
      reason: resetReason || t("defaultResetReason"),
      resetPointsMode,
    })
    setUserToReset(null)
    setResetReason("")
    setResetModuleId("")
    setResetPointsMode("none")
  }

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
          <Button type="button" onClick={() => { setEditingUser(null); setShowForm(true); }} variant="default">{t("addUser")}</Button>
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
            setShowForm(false)
            setEditingUser(null)
            setErrorUsers(null)
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
                  setShowForm(false)
                  setEditingUser(null)
                  await fetchUsers(true)
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

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
                <td className="p-4 space-x-4">
                  <Button type="button" onClick={() => handleEdit(user)} variant="secondary">
                    {t("edit")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleResetClick(user)}
                  >
                    {t("resetProgress")}
                  </Button>
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
                <td colSpan={6} className="text-center py-4">
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
          setResetModuleId("")
          setResetPointsMode("none")
        }
      }}>
        <DialogContent>
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
              <label className="text-sm font-medium">
                {t("resetReasonLabel")}
              </label>
              <Textarea
                value={resetReason}
                onChange={(e) => setResetReason(e.target.value)}
                placeholder={t("resetReasonPlaceholder")}
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                {t("resetModuleIdLabel")}
              </label>
              <Input
                value={resetModuleId}
                onChange={(e) => setResetModuleId(e.target.value)}
                placeholder={t("resetModuleIdPlaceholder")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                {t("resetPointsModeLabel")}
              </label>
              <Select
                value={resetPointsMode}
                onValueChange={(value) =>
                  setResetPointsMode(value as "none" | "total" | "logs")
                }
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
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUserToReset(null)
                  setResetReason("")
                }}
              >
                {t("cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isResetting || !resetReason.trim() || !resetModuleId.trim()}
                onClick={handleConfirmReset}
              >
                {isResetting ? t("resetting") : t("confirmReset")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}