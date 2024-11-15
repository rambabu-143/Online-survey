// app/api/surveys/[surveyId]/analytics/route.ts
import { NextResponse } from 'next/server'
import dbConnect from '@/app/database/utils/mongodb'
import Survey from '@/app/database/models/survey'
import Response from '@/app/database/models/response'

export async function GET(request: Request, { params }: { params: { surveyId: string } }) {
    await dbConnect()

    const { surveyId } = params

    try {
        const survey = await Survey.findById(surveyId)
        if (!survey) {
            return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
        }

        const responses = await Response.find({ surveyId })

        return NextResponse.json({
            title: survey.title,
            questions: survey.questions,
            responses: responses.map(response => ({
                userId: response.userId,
                answers: response.answers
            }))
        })
    } catch (error) {
        console.error('Error fetching survey analytics:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}