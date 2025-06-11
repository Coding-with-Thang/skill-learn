"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { generateRandomPassword } from '../../../utils/generatePassword'
import useUsersStore from "../../store/usersStore";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import UserDetails from "@/components/UserDetails";

export default function UsersPage() {
  const { users, loading, error, fetchUsers } = useUsersStore();

  useEffect(() => {
    fetchUsers();
  }, [])

  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [errorUsers, setErrorUsers] = useState(null)
  const [manager, setManager] = useState('none')
  const [role, setRole] = useState('AGENT')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null);
  // Get list of users who are managers for the dropdown
  const managerList = users
    ?.filter(user => user.role === "MANAGER")
    ?.map(user => `${user.firstName} ${user.lastName}`) || []

  const roles = ["AGENT", "MANAGER", "OPERATIONS"]
  //Function to generate username from first and name
  const generateUsername = (firstName, lastName) => {
    const baseUsername = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`
    let newUsername = baseUsername
    let suffix = 1

    //Check if the username already exists and regenerate if necessary
    while (users?.some((user) => user.username === newUsername)) {
      newUsername = `${baseUsername}${suffix}`
      suffix++
    }

    return newUsername
  }

  //Automatically generate username whenever first or last name changes
  useEffect(() => {
    if (firstName && lastName) {
      const newUsername = generateUsername(firstName, lastName)
      setUsername(newUsername)
    }
  }, [firstName, lastName])

  const handleGeneratePassword = () => {
    const randomPassword = generateRandomPassword()
    setPassword(randomPassword)
  }
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!firstName || !lastName) {
      setErrorUsers('First name and last name are required')
      return
    } setErrorUsers(null)
    const userData = {
      username,
      firstName,
      lastName,
      password,
      manager,
      role,
    }

    try {
      if (editingUser) {
        await useUsersStore.getState().updateUser(editingUser.id, userData)
        setEditingUser(null)
      } else {
        await useUsersStore.getState().createUser(userData)
      }      //Clear the form
      setUsername('')
      setFirstName('')
      setLastName('')
      setPassword('')
      setManager('none')
      setRole('AGENT')

      // Refresh the users list
      fetchUsers()
    } catch (error) {
      setErrorUsers(error.response?.data?.error || 'An error occurred')
    }
  }
  const handleEdit = (user) => {
    setEditingUser(user)
    setUsername(user.username)
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setManager(user.manager || 'none')
    setRole(user.role || 'AGENT')
    setShowForm(true)
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      await useUsersStore.getState().deleteUser(userId)
      // The store will automatically update the users list
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

      {/* Create/Edit User Form */}
      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open) {
          setEditingUser(null)
          setUsername('')
          setFirstName('')
          setLastName('')
          setPassword('')
          setManager('none')
          setRole('AGENT')
          setErrorUsers(null)
        }
        setShowForm(open)
      }}>
        <DialogContent>
          <h2 className="text-lg font-bold mb-4">{editingUser ? 'Edit' : 'Create'} User</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            {!editingUser && (
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button type="button" onClick={handleGeneratePassword} variant="outline">
                    Generate
                  </Button>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Manager</label>
              <Select value={manager} onValueChange={setManager}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Manager</SelectItem>
                  {managerList.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingUser ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Advanced Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="Search users..." />
            <Select>
              <option>Filter by Role</option>
              <option>Admin</option>
              <option>User</option>
            </Select>
            <Select>
              <option>Sort by</option>
              <option>Points (High to Low)</option>
              <option>Recent Activity</option>
              <option>Join Date</option>
            </Select>
          </div>
        </CardContent>
      </Card>      {/* User Table */}
      {loading ? (
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
            {users?.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-4">{user.username}</td>
                <td className="p-4">{user.firstName}</td>
                <td className="p-4">{user.lastName}</td>
                <td className="p-4">{user.manager || 'No manager'}</td>
                <td className="p-4">{user.role || 'AGENT'}</td>
                <td className="p-4 space-x-4">
                  <Button
                    onClick={() => handleEdit(user)}
                    variant="secondary"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(user.id)}
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {users?.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* User Details Modal */}
      <Dialog open={selectedUser !== null} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <UserDetails user={selectedUser} />
        </DialogContent>
      </Dialog>
    </div>
  )
}