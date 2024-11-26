import { NextResponse } from 'next/server'
import Survey from '@/app/database/models/survey'
import mongoose from 'mongoose'
import dbConnect from '@/app/database/utils/mongodb'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id

    try {
        await dbConnect()

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json({ error: 'Invalid survey ID' }, { status: 400 })
        }

        const survey = await Survey.findById(id).select('questions')

        if (!survey) {
            return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
        }

        return NextResponse.json(survey.questions)
    } catch (error) {
        console.error('Error fetching survey questions:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

