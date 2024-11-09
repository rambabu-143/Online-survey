import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import dbConnect from '@/app/database/utils/mongodb'
import User from '@/app/database/models/user';

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json()

        // Validate input
        if (!username || !email || !password) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        await dbConnect()

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] })
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 409 })
        }

        // Hash password
        const hashedPassword = await hash(password, 10)

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        })

        await newUser.save()

        return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json({ message: 'An error occurred during signup' }, { status: 500 })
    }
}