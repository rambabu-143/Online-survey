'use client'

import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
    const [isSigningOut, setIsSigningOut] = useState(false)
    const router = useRouter()

    const handleSignOut = async () => {
        setIsSigningOut(true)
        try {
            await signOut({ redirect: false })
            router.push('/')
            router.refresh()
        } catch (error) {
            console.error('Error signing out:', error)
        } finally {
            setIsSigningOut(false)
        }
    }

    return (
        <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
        >
            {isSigningOut ? 'Signing out...' : 'Sign out'}
        </button>
    )
}