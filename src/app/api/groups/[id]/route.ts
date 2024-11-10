import { NextResponse } from 'next/server'
import Group from '@/app/database/models/group'
import dbConnect from '@/app/database/utils/mongodb'

export async function GET(request: Request, { params }: { params: { id: string } }) {
    await dbConnect()
    const group = await Group.findById(params.id)
    if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }
    return NextResponse.json(group)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    await dbConnect()
    const groupData = await request.json()
    const updatedGroup = await Group.findByIdAndUpdate(params.id, groupData, { new: true })
    if (!updatedGroup) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }
    return NextResponse.json(updatedGroup)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    await dbConnect()
    const deletedGroup = await Group.findByIdAndDelete(params.id)
    if (!deletedGroup) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Group deleted successfully' })
}