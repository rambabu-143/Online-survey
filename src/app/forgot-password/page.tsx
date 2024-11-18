'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast'

export default function ForgotPassword() {
    const { toast } = useToast()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/reset-password/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            if (response.ok) {
                toast({
                    title: "Reset link sent",
                    description: "Check your email for the password reset link.",
                })
                router.push('/signin')
            } else {
                const data = await response.json()
                throw new Error(data.message || 'Something went wrong')
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "An error occurred. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-[350px] mx-auto mt-16">
            <CardHeader>
                <CardTitle>Forgot Password</CardTitle>
                <CardDescription>Enter your email to reset your password.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Reset Password'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Link href="/signin" className="text-sm text-primary hover:underline">
                    Back to Sign In
                </Link>
            </CardFooter>
        </Card>
    )
}