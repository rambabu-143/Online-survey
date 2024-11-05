import { NextResponse } from 'next/server';
import dbConnect from '@/app/database/utils/mongodb';
import Survey from '@/app/database/models/survey';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        await dbConnect();

        const survey = await Survey.findById(id);

        if (!survey) {
            return NextResponse.json({ message: 'Survey not found' }, { status: 404 });
        }

        return NextResponse.json(survey);
    } catch (error) {
        console.error('Error fetching survey:', error);
        return NextResponse.json({ message: 'Failed to fetch survey' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        await dbConnect();

        const body = await request.json();
        const updatedSurvey = await Survey.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!updatedSurvey) {
            return NextResponse.json({ message: 'Survey not found' }, { status: 404 });
        }

        return NextResponse.json(updatedSurvey);
    } catch (error) {
        console.error('Error updating survey:', error);
        return NextResponse.json({ message: 'Failed to update survey' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        await dbConnect();

        const body = await request.json();
        const updatedSurvey = await Survey.findByIdAndUpdate(id, { active: body.active }, { new: true });

        if (!updatedSurvey) {
            return NextResponse.json({ error: 'Survey not found' }, { status: 500 });
        }

        return NextResponse.json(updatedSurvey);
    } catch (error) {
        console.error('Error updating survey:', error);
        return NextResponse.json({ error: 'Failed to update survey' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        await dbConnect();

        const deletedSurvey = await Survey.findByIdAndDelete(id);

        if (!deletedSurvey) {
            return NextResponse.json({ message: 'Survey not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Survey deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting survey:', error);
        return NextResponse.json({ message: 'Failed to delete survey' }, { status: 500 });
    }
}