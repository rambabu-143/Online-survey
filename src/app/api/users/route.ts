// app/api/users/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/app/database/utils/mongodb';
import User from '@/app/database/models/user';
import { hash } from 'bcryptjs'

type UserRole = 'admin' | 'user';

interface UserUpdatePayload {
    userId: string;
    role: UserRole;
}

export async function GET() {
    await dbConnect();

    try {
        const users = await User.find(); // Fetch all users from the database
        return NextResponse.json(users); // Return users as JSON response
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    await dbConnect();

    const { userId, role }: UserUpdatePayload = await req.json(); // Parse incoming JSON

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true }); // Update user role
        if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({ message: 'User role updated successfully', user: updatedUser }); // Return success message
    } catch (error) {
        console.error("Error updating user role:", error);
        return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }
}
export async function POST(request: Request) {

    const { username, email, password } = await request.json()
    if (!username || !email || !password) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    await dbConnect()

    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
        return NextResponse.json({ message: 'User already exists' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    const newUser = new User({
        username,
        email,
        password: hashedPassword,
    })
    await newUser.save()

    const { password: _, ...userWithoutPassword } = newUser.toObject()
    return NextResponse.json(userWithoutPassword, { status: 201 })
}