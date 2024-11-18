import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ResetPasswordForm from '../user/components/password-reset'

export default function ResetPasswordPage({ searchParams }: { searchParams: { token: string } }) {
    const { token } = searchParams

    if (!token) {
        return (
            <Card className="w-[350px] mx-auto mt-16">
                <CardHeader>
                    <CardTitle>Invalid Reset Link</CardTitle>
                    <CardDescription>The password reset link is invalid or has expired.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card className="w-[350px] mx-auto mt-16">
            <CardHeader>
                <CardTitle>Reset Your Password</CardTitle>
                <CardDescription>Enter your new password below.</CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordForm token={token} />
                </Suspense>
            </CardContent>
        </Card>
    )
}