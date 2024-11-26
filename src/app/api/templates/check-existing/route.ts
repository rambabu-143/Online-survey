import { NextResponse } from 'next/server'
import dbConnect from '@/app/database/utils/mongodb'
import Template from '@/app/database/models/template'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const { title, description } = await req.json()

        const existingTemplate = await Template.findOne({ title, description })

        return NextResponse.json({ exists: !!existingTemplate })
    } catch (error) {
        console.error('Error checking existing surveys:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

