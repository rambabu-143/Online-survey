import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/database/utils/mongodb';
import Template from '@/app/database/models/template';

// Create a new template
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const template = await Template.create(body);
        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error('Error creating template:', error);
        return NextResponse.json(
            { error: 'Error creating template' },
            { status: 500 }
        );
    }
}

// Fetch all templates
export async function GET() {
    try {
        await dbConnect();
        const templates = await Template.find({}).sort({ createdAt: -1 });
        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: 'Error fetching templates' },
            { status: 500 }
        );
    }
}