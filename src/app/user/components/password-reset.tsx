'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordForm({ token }: { token: string }) {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            if (response.ok) {
                setSuccess(true)
                setTimeout(() => router.push('/'), 3000)
            } else {
                const data = await response.json()
                setError(data.message || 'Failed to reset password')
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        }
    }

    if (success) {
        return <div>Password reset successful. Redirecting to login...</div>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="password" className="block mb-2">New Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                />
            </div>
            <div>
                <label htmlFor="confirmPassword" className="block mb-2">Confirm New Password</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                />
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Reset Password
            </button>
        </form>
    )
}