import { NextResponse } from 'next/server'
import Group from '@/app/database/models/group'
import dbConnect from '@/app/database/utils/mongodb'

export async function GET() {
    await dbConnect()
    const groups = await Group.find({})
    return NextResponse.json(groups)
}

export async function POST(request: Request) {
    await dbConnect()
    const groupData = await request.json()
    const newGroup = new Group(groupData)
    await newGroup.save()
    return NextResponse.json(newGroup, { status: 201 })
}