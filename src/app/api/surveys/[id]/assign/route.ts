import { NextResponse } from 'next/server'
import Survey from '@/app/database/models/survey'
import Group from '@/app/database/models/group'
import dbConnect from '@/app/database/utils/mongodb'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    await dbConnect()

    // Parse and validate request body
    const { groupIds } = await request.json()
    if (!Array.isArray(groupIds) || groupIds.length === 0) {
        return NextResponse.json({ error: 'groupIds must be a non-empty array' }, { status: 400 })
    }

    try {
        const survey = await Survey.findById(params.id)
        if (!survey) {
            return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
        }

        // Ensure survey.assignedGroups is initialized as an array
        survey.assignedGroups = survey.assignedGroups || []

        // Add unique group IDs to assignedGroups
        survey.assignedGroups = Array.from(new Set([...survey.assignedGroups, ...groupIds]))
        await survey.save()

        // Update the groups' assignedSurveys field with the survey ID
        await Group.updateMany(
            { _id: { $in: groupIds } },
            { $addToSet: { assignedSurveys: survey._id } }
        )

        return NextResponse.json({ message: 'Survey assigned to groups successfully' })
    } catch (error) {
        console.error('Error assigning survey to groups:', error)
        return NextResponse.json({ error: 'Failed to assign survey to groups' }, { status: 500 })
    }
}
