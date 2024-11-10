import { NextResponse } from 'next/server'
import Group from '@/app/database/models/group'
import User from '@/app/database/models/user'
import dbConnect from '@/app/database/utils/mongodb'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    await dbConnect()
    const { userIds } = await request.json()

    try {
        const group = await Group.findById(params.id)
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 })
        }

        // Convert Set to Array, remove duplicates, and combine with existing members
        const updatedMembers = Array.from(new Set([...group.members, ...userIds]))
        group.members = updatedMembers
        await group.save()

        // Update users' groups
        await User.updateMany(
            { _id: { $in: userIds } },
            { $addToSet: { groups: group._id } }
        )

        return NextResponse.json({ message: 'Users assigned to group successfully' })
    } catch (error) {
        console.error('Error assigning users to group:', error)
        return NextResponse.json({ error: 'Failed to assign users to group' }, { status: 500 })
    }
}