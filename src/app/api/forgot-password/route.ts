import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        // Generate a unique reset token (you should implement this)
        const resetToken = generateResetToken()

        // Save the reset token to your database, associated with the user's email
        await saveResetTokenToDatabase(email, resetToken)

        // Create the reset password URL
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

        // Send email using Resend
        await resend.emails.send({
            from: 'Your App <noreply@yourdomain.com>',
            to: email,
            subject: 'Reset Your Password',
            html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        })

        return NextResponse.json({ message: 'Reset link sent successfully' })
    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json({ message: 'Failed to send reset link' }, { status: 500 })
    }
}

// Implement these functions based on your application's needs
function generateResetToken(): string {
    // Generate a unique token (e.g., using crypto module)
    return 'unique-reset-token'
}

async function saveResetTokenToDatabase(email: string, token: string): Promise<void> {
    // Save the token to your database, associated with the user's email
}