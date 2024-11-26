import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/database/utils/mongodb';
import Response from '@/app/database/models/response';
import User from '@/app/database/models/user'; // Ensure the model is imported

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        await dbConnect(); // Connect to the database
        console.log('User model:', User);

        const body = await request.json();
        const { surveyId, userId, answers, submittedAt } = body;

        if (!surveyId || !userId || !answers) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                {
                    status: 400,
                    headers: { 'Cache-Control': 'no-store, max-age=0' },
                }
            );
        }

        // Create a new Response document
        const response = new Response({
            surveyId,
            userId,
            answers,
            submittedAt,
        });

        await response.save(); // Save the response document

        return NextResponse.json(
            { message: 'Response submitted successfully' },
            {
                status: 201,
                headers: { 'Cache-Control': 'no-store, max-age=0' },
            }
        );
    } catch (error) {
        console.error('Error submitting response:', error);
        return NextResponse.json(
            { message: 'Error submitting response' },
            {
                status: 500,
                headers: { 'Cache-Control': 'no-store, max-age=0' },
            }
        );
    }
}

export async function GET(): Promise<NextResponse> {
    try {
        await dbConnect(); // Connect to the database

        // Fetch responses and populate `userId` to get `username`
        const responses = await Response.find()
            .populate('userId', 'username') // Populate only the username field
            .exec();

        // Format the responses for frontend consumption
        const formattedResponses = responses.map((response) => ({
            _id: response._id.toString(),
            surveyId: response.surveyId,
            userId: response.userId?._id.toString() || null,
            username: response.userId?.username || 'Anonymous',
            answers: response.answers,
            submittedAt: response.submittedAt,
        }));

        return NextResponse.json(
            formattedResponses,
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store, max-age=0' },
            }
        );
    } catch (error) {
        console.error('Error fetching responses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch responses' },
            {
                status: 500,
                headers: { 'Cache-Control': 'no-store, max-age=0' },
            }
        );
    }
}
