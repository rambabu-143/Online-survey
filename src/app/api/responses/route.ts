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

        return NextResponse.json({ message: 'Response submitted successfully' }, {
            status: 201, headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        })
    } catch (error) {
        console.error('Error submitting response:', error)
        return NextResponse.json({ message: 'Error submitting response' }, {
            status: 500, headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        })
    }
}

// export async function GET(request: NextRequest) {
//     try {
//         await dbConnect()

//         const searchParams = request.nextUrl.searchParams
//         const userId = searchParams.get('userId')

//         let query = {}
//         if (userId) {
//             query = { userId }
//         }

//         const responses = await Response.find(query).lean()

//         return NextResponse.json(responses)
//     } catch (error) {
//         console.error('Error fetching responses:', error)
//         return NextResponse.json({ message: 'Error fetching responses' }, { status: 500 })
//     }
// }



export async function GET() {
    try {
        await dbConnect(); // Ensure MongoDB is connected

        // Fetch responses and populate `userId` to get `username`
        const responses = await Response.find()
            .populate('userId', 'username') // Populate only the username field
            .exec();

        // Format the responses for the frontend
        const formattedResponses = responses.map((response) => ({
            _id: response._id,
            surveyId: response.surveyId,
            userId: response.userId?._id || null,
            username: response.userId?.username || 'Anonymous',
            answers: response.answers,
            submittedAt: response.submittedAt,
        }));

        return NextResponse.json(formattedResponses, {
            status: 200, headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        },);
    } catch (error) {
        console.error('Error fetching responses:', error);
        return NextResponse.json({ error: 'Failed to fetch responses' }, {
            status: 500, headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    }
}