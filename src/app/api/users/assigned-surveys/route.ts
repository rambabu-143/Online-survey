import { NextResponse } from 'next/server'
import User from '@/app/database/models/user'
import Group from '@/app/database/models/group'
import Survey from '@/app/database/models/survey'
import dbConnect from '@/app/database/utils/mongodb'
import { auth } from '../../../../../auth'

export async function GET() {
    await dbConnect()

    const session = await auth()
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const userGroups = await Group.find({ members: user._id })
        const groupIds = userGroups.map(group => group._id)

        const assignedSurveys = await Survey.find({
            _id: { $in: userGroups.flatMap(group => group.assignedSurveys) }
        }).lean()

        const surveysWithGroupNames = assignedSurveys.map(survey => {
            const group = userGroups.find(group => group.assignedSurveys.includes(survey._id))
            return {
                ...survey,
                groupName: group ? group.name : 'Unknown Group'
            }
        })

        return NextResponse.json(surveysWithGroupNames)
    } catch (error) {
        console.error('Error fetching assigned surveys:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}