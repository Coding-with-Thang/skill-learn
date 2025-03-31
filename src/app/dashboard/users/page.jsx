"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
import { generateRandomPassword } from '../../../utils/generatePassword'
import useUsersStore from "../../store/usersStore";

export default function UsersSettingPage() {

  const { users, loading, error, fetchUsers } = useUsersStore();

  useEffect(() => {
    fetchUsers();
    console.log("users: ", users)
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
    <div className="bg-gray-100 p-8 min-w-full">
      <h1 className="text-3xl font-semibold mb-6">Manage Users</h1>
      <Button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700">
        + Add User
      </Button>
      {showForm && (
        <>
          {/* User Form */}
          <form onSubmit={handleSubmit} className="bg-white mt-5 p-6 shadow-md rounded-lg max-w-lg mx-auto space-y-6 transition duration-100 ease-in-out relative">
            <Button
              className="flex absolute right-4 top-3 rounded-lg font-bold p-3 hover:bg-blue-900 hover:text-white transition duration-300 ease-in-out"
              onClick={() => setShowForm(false)}
            >
              X
            </Button>
            <div>
              <Label htmlFor="firstName" className="block text-sm font-medium text-gray-600">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-2 p-3 w-full border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="block text-sm font-medium text-gray-600">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-2 p-3 w-full border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Enter last name"
              />
            </div>
            {/* Manager Dropdown */}
            <div>
              <Label htmlFor="manager" className="block text-sm font-medium text-gray-600">Manager</Label>
              <select
                id="manager"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                className="mt-2 p-3 w-full border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a Manager</option>
                {managerList.map((manager, index) => (
                  <option key={index} value={manager}>
                    {manager}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="role" className="block text-sm font-medium text-gray-600">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 p-3 w-full border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                {roles.map((role, index) => (
                  <option key={index} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className=''>
              <Label htmlFor="username" className="block text-sm font-medium text-gray-600">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                readOnly
                disabled
                className="mt-2 p-3 w-full border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-600">Generated Password</Label>
              <div className="flex items-center">
                <Input
                  id="password"
                  type="text"
                  value={password}
                  readOnly
                  disabled
                  className="mt-2 p-3 w-full border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="ml-4 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700"
                >
                  Generate Password
                </Button>
              </div>
            </div>

            {errorUsers && <p className="text-red-500 text-sm">{errorUsers}</p>}

            <div className="flex justify-center">
              <Button type="submit" className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700">
                {editingUser ? 'Update User' : 'Add User'}
              </Button>
            </div>
          </form>
        </>
      )
      }


      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">User List</h2>
        {!loading ?
          <table className="min-w-full table-auto bg-white shadow-md rounded-md overflow-hidden">
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
          </table>
          :
          <p>Loading...</p>
        }
      </div>
    </div >
  )
}