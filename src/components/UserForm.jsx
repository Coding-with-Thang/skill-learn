"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateRandomPassword } from '../utils/generatePassword'

const INITIAL_FORM_STATE = {
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    manager: 'none',
    role: 'AGENT'
}

export function UserForm({
    onSubmit,
    initialData = null,
    managerList = [],
    loading = false,
    onCancel
}) {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...INITIAL_FORM_STATE,
                ...initialData,
                manager: initialData.manager || 'none'
            })
        }
    }, [initialData])

    const generateUsername = (firstName, lastName) => {
        const baseUsername = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`
        let newUsername = baseUsername
        let suffix = 1

        // Note: This should ideally check against the database for uniqueness
        while (false) { // Replace with actual username check
            newUsername = `${baseUsername}${suffix}`
            suffix++
        }

        return newUsername
    }

    useEffect(() => {
        if (formData.firstName && formData.lastName) {
            const newUsername = generateUsername(formData.firstName, formData.lastName)
            setFormData(prev => ({ ...prev, username: newUsername }))
        }
    }, [formData.firstName, formData.lastName])

    const handleGeneratePassword = () => {
        const randomPassword = generateRandomPassword()
        setFormData(prev => ({ ...prev, password: randomPassword }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.firstName || !formData.lastName) {
            setError('First name and last name are required')
            return
        }
        onSubmit(formData)
    }

    const roles = ["AGENT", "MANAGER", "OPERATIONS"]

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <Input
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                />
            </div>
            {!initialData && (
                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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
                <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
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
                <Select
                    value={formData.manager}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, manager: value }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a manager" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">No Manager</SelectItem>
                        {managerList.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                                {m.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    )
}
