import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/app/database/utils/mongodb'
import Response from '@/app/database/models/response'

export async function POST(request: NextRequest) {
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
        console.error('Error submitting response:', error)
        return NextResponse.json({ message: 'Error submitting response' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect()

        const searchParams = request.nextUrl.searchParams
        const userId = searchParams.get('userId')

        let query = {}
        if (userId) {
            query = { userId }
        }

        const responses = await Response.find(query).lean()

        return NextResponse.json(responses)
    } catch (error) {
        console.error('Error fetching responses:', error)
        return NextResponse.json({ message: 'Error fetching responses' }, { status: 500 })
    }
}