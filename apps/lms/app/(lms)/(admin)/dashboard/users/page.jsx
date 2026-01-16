"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from "@skill-learn/ui/components/button"
import { Table } from "@skill-learn/ui/components/table"
import { Dialog, DialogContent } from "@skill-learn/ui/components/dialog"
import { useUsersStore } from "@skill-learn/lib/stores/usersStore.js"
import { usePermissions } from "@skill-learn/lib/hooks/usePermissions.js"
import UserDetails from "@/components/user/UserDetails"
import UserForm from "@/components/user/UserForm"
import { UserFilters } from "@/components/user/UserFilters"

export default function UsersPage() {
  const { users, isLoading, error, fetchUsers } = useUsersStore();
  const { hasPermission } = usePermissions();

  // Check for users.delete permission instead of role
  const canDeleteUsers = hasPermission('users.delete');

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers])

  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [errorUsers, setErrorUsers] = useState(null)

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users
      .filter(user => {
        const matchesSearch = searchTerm
          ? user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
          : true;

        const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;

        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          case 'role':
            return a.role.localeCompare(b.role);
          case 'recent':
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });
  }, [users, searchTerm, roleFilter, sortBy]);

  const managerList = useMemo(() =>
    users?.filter(user => user.role === "MANAGER")
      ?.map(user => ({
        value: user.username,
        label: `${user.firstName} ${user.lastName}`
      })) || [],
    [users]
  );

  const handleSubmit = async (formData) => {
    try {
      if (editingUser) {
        await useUsersStore.getState().updateUser(editingUser.id, formData)
        setEditingUser(null)
      } else {
        await useUsersStore.getState().createUser(formData)
      }
      setShowForm(false)
      fetchUsers()
    } catch (error) {
      setErrorUsers(error.response?.data?.error || 'An error occurred')
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      await useUsersStore.getState().deleteUser(userId)
    } catch (error) {
      setErrorUsers(error.response?.data?.error || 'Failed to delete user')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex gap-3">
          <Button onClick={() => setShowForm(true)} variant="default">Add User</Button>
        </div>
      </div>

      {errorUsers && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorUsers}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open) {
          setEditingUser(null)
          setErrorUsers(null)
        }
        setShowForm(open)
      }}>
        <DialogContent>
          <h2 className="text-lg font-bold mb-4">{editingUser ? 'Edit' : 'Create'} User</h2>
          <UserForm
            user={editingUser}
            onSuccess={async () => {
              setShowForm(false)
              setEditingUser(null)
              await fetchUsers()
            }}
          />
        </DialogContent>
      </Dialog>

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
              <th className="p-4 text-left">Manager</th>
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
                  {user.manager ? (() => {
                    const managerUser = users.find(u => u.username === user.manager);
                    return managerUser ? `${managerUser.firstName} ${managerUser.lastName}` : 'No manager';
                  })() : 'No manager'}
                </td>
                <td className="p-4">{user.role || 'AGENT'}</td>
                <td className="p-4 space-x-4">
                  <Button onClick={() => handleEdit(user)} variant="secondary">
                    Edit
                  </Button>
                  {canDeleteUsers && (
                    <Button onClick={() => handleDelete(user.id)} variant="destructive">
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
          <UserDetails user={selectedUser} />
        </DialogContent>
      </Dialog>
    </div>
  )
}