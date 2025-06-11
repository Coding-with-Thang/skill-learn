"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
import { generateRandomPassword } from '../../../utils/generatePassword'
import useUsersStore from "../../store/usersStore";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import UserDetails from "@/components/UserDetails";

export default function UsersPage() {
  const { users, loading, error, fetchUsers } = useUsersStore();

  useEffect(() => {
    fetchUsers();
  }, [])

  useEffect(() => {
    console.log("users: ", users)
  }, [users])

  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [errorUsers, setErrorUsers] = useState(null)
  const [manager, setManager] = useState('')
  const [role, setRole] = useState('')
  const [existingUsernames, setExistingUsernames] = useState([
    'john.doe', //Simulated existing usernames for testing
    'jane.smith',
  ])
  const [editingUser, setEditingUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null);

  const managerList = ["Steph Harrison", "Jack Bowman", "Laura Peleton", "Bob O Neil"]
  const roles = ["AGENT", "MANAGER", "OPERATIONS"]

  const [showForm, setShowForm] = useState(false);

  //Function to generate username from first and last name
  const generateUsername = (firstName, lastName) => {
    const baseUsername = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`
    let newUsername = baseUsername
    let suffix = 1

    //Check if the username already exists and regenerate if necessary
    while (existingUsernames.includes(newUsername) || users.some((user) => user.username === newUsername)) {
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

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!firstName || !lastName) {
      setErrorUsers('First name and last name are required')
      return
    }

    setErrorUsers(null)

    //If editing an existing user, update their info
    if (editingUser) {
      setUsers((prevUsers) =>
        users.map((user) =>
          user.id === editingUser.id
            ? { ...user, username, firstName, lastName, manager, role }
            : user
        )
      )
      setEditingUser(null)
    } else {
      //Check if the username already exists and regenerate if necessary
      const newUsername = generateUsername(firstName, lastName)
      setUsername(newUsername)

      //Add new user with manager assignment
      const newUser = { id: Date.now(), username: newUsername, firstName, lastName, manager, role }
      setUsers((prevUsers) => [...prevUsers, newUser])
    }

    //Clear the form
    setUsername('')
    setFirstName('')
    setLastName('')
    setPassword('')
    setManager('')
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setUsername(user.username)
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setManager(user.manager || '') //If no manager, set as empty
  }

  const handleDelete = (userId) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex gap-3">
          <Button>Export Users</Button>
          <Button>Bulk Actions</Button>
        </div>
      </div>

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
      </Card>

      {/* User Table */}
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
          {users && users.map && users.map((user) => (
            <tr key={user?.id} className="border-b">
              <td className="p-4">{user?.username}</td>
              <td className="p-4">{user?.firstName}</td>
              <td className="p-4">{user?.lastName}</td>
              <td className="p-4">{user?.manager ? user?.manager : 'No manager'}</td>
              <td className="p-4">{user?.role ? user?.role : ''}</td>
              <td className="p-4 space-x-4">
                <Button
                  onClick={() =>
                    handleEdit(user)
                  }
                  className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(user.id)}
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* User Details Modal */}
      <Dialog open={selectedUser !== null} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <UserDetails user={selectedUser} />
        </DialogContent>
      </Dialog>
    </div>
  )
}