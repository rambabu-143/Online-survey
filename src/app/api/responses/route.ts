import { NextResponse } from 'next/server'
import dbConnect from '@/app/database/utils/mongodb'
import Response from '@/app/database/models/response'

export async function POST(request: Request) {
    try {
        await dbConnect()

        const body = await request.json()
        const { surveyId, userId, answers, submittedAt } = body

        const response = new Response({
            surveyId,
            userId,
            answers,
            submittedAt
        })

        await response.save()

        return NextResponse.json({ message: 'Response submitted successfully' }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: 'Error submitting response' }, { status: 500 })
    }
}