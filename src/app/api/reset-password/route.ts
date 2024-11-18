import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import User from '@/app/database/models/user'
import dbConnect from '@/app/database/utils/mongodb'
import ResetToken from '@/app/database/models/reset-token'

export async function POST(request: Request) {
    try {
        await dbConnect()
        const { token, password } = await request.json()

        // Find the reset token and check if it's expired
        const resetToken = await ResetToken.findOne({
            token,
            expires: { $gt: new Date() },
        })

        if (!resetToken) {
            return NextResponse.json({ message: 'Invalid or expired reset token' }, { status: 400 })
        }

        // Find the user associated with the reset token
        const user = await User.findById(resetToken.userId)

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Update user's password
        user.password = hashedPassword
        await user.save()

        // Delete the used reset token
        await ResetToken.deleteOne({ _id: resetToken._id })

        return NextResponse.json({ message: 'Password reset successful' })
    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json({ message: 'Failed to reset password' }, { status: 500 })
    }
}