"use client"

import { useState, useEffect, useMemo } from 'react'
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
import { useUsersStore } from "@skill-learn/lib/stores/usersStore.js"
import { usePermissionsStore } from "@skill-learn/lib/stores/permissionsStore.js"
import UserDetails from "@/components/user/UserDetails"
import UserForm from "@/components/user/UserForm"
import { UserFilters } from "@/components/user/UserFilters"

export default function UsersPage() {
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
  const [editingUser, setEditingUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [errorUsers, setErrorUsers] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users
      .filter(user => {
        const matchesSearch = searchTerm
          ? user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
          : true;

        // Filter by tenant role only
        const matchesRole = roleFilter === 'all'
          ? true
          : user.tenantRole === roleFilter;

        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          case 'role':
            const aRole = a.tenantRole || '';
            const bRole = b.tenantRole || '';
            return aRole.localeCompare(bRole);
          case 'recent':
            return new Date(b.createdAt) - new Date(a.createdAt);
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
    } catch (error) {
      setErrorUsers(error.response?.data?.error || 'An error occurred')
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
  }

  const handleDeleteConfirm = async (user) => {
    if (!user) return
    try {
      await useUsersStore.getState().deleteUser(user.id)
      setUserToDelete(null)
      await fetchUsers(true)
    } catch (error) {
      setErrorUsers(error.response?.data?.error || 'Failed to delete user')
      setUserToDelete(null)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex gap-3">
          <Button type="button" onClick={() => { setEditingUser(null); setShowForm(true); }} variant="default">Add User</Button>
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
                <DialogTitle className="text-lg font-bold">{editingUser ? 'Edit' : 'Create'} User</DialogTitle>
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
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName} (${userToDelete.username})` : 'this user'}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-center sm:justify-center">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteConfirm(userToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
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
        <div className="text-center py-4">Loading users...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <Table>
          <thead>
            <tr className="bg-gray-200">
              <th className="p-4 text-left">Username</th>
              <th className="p-4 text-left">First Name</th>
              <th className="p-4 text-left">Last Name</th>
              <th className="p-4 text-left">Reports to</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Actions</th>
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
                <td className="p-4">{user.tenantRole || 'No role'}</td>
                <td className="p-4 space-x-4">
                  <Button type="button" onClick={() => handleEdit(user)} variant="secondary">
                    Edit
                  </Button>
                  {canDeleteUsers && (
                    <Button type="button" onClick={() => handleDeleteClick(user)} variant="destructive">
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No users found
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
              {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'User details'}
            </DialogTitle>
          </DialogHeader>
          <UserDetails user={selectedUser} />
        </DialogContent>
      </Dialog>
    </div>
  )
}