import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import crypto from 'crypto'
import dbConnect from '@/app/database/utils/mongodb'
import User from '@/app/database/models/user'
import ResetToken from '@/app/database/models/reset-token'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    try {
        await dbConnect()
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 })
        }

        // Find the user by email
        const user = await User.findOne({ email })
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        // Generate a unique reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

        // Save the reset token to the new ResetToken collection
        await ResetToken.create({
            userId: user._id,
            token: resetToken,
            expires: resetTokenExpiry,
        })

        // Create the reset password URL
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: email,
            subject: 'Reset Your Password',
            html: `
                <h1>Reset Your Password</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
            `,
        })

        if (error) {
            console.error('Resend API error:', error)
            return NextResponse.json({ message: 'Failed to send reset link' }, { status: 500 })
        }

        console.log('Email sent successfully:', data)
        return NextResponse.json({ message: 'Reset link sent successfully' })
    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json({ message: 'Failed to send reset link' }, { status: 500 })
    }
}