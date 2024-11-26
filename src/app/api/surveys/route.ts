import { NextResponse } from 'next/server';
import dbConnect from '@/app/database/utils/mongodb';
import Survey from '@/app/database/models/survey';

export async function GET() {
    try {
        await dbConnect();
        const surveys = await Survey.find({}).sort({ createdAt: -1 }).lean();;
        return NextResponse.json(surveys);
    } catch (error) {
        console.error('Error fetching surveys:', error);
        return NextResponse.json(
            { error: 'Failed to fetch surveys' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const survey = await Survey.create(body);
        return NextResponse.json(survey, { status: 201 });
    } catch (error) {
        console.error('Error creating survey:', error);
        return NextResponse.json(
            { error: 'Error creating survey' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Survey ID is required' },
                { status: 400 }
            );
        }

        const deletedSurvey = await Survey.findByIdAndDelete(id);
        if (!deletedSurvey) {
            return NextResponse.json(
                { error: 'Survey not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting survey:', error);
        return NextResponse.json(
            { error: 'Error deleting survey' },
            { status: 500 }
        );
    }
}