import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/database/utils/mongodb';
import Template from '@/app/database/models/template';

// Fetch a single template by ID
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const template = await Template.findById(params.id);

        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(template);
    } catch (error) {
        console.error('Error fetching template:', error);
        return NextResponse.json(
            { error: 'Error fetching template' },
            { status: 500 }
        );
    }
}

// Update a template by ID
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const body = await req.json();
        const updatedTemplate = await Template.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true,
        });

        if (!updatedTemplate) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }     
            );
        }

        return NextResponse.json(updatedTemplate);
    } catch (error) {
        console.error('Error updating template:', error);
        return NextResponse.json(
            { error: 'Error updating template' },
            { status: 500 }
        );
    }
}

// Delete a template by ID
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const deletedTemplate = await Template.findByIdAndDelete(params.id);

        if (!deletedTemplate) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Template deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting template:', error);
        return NextResponse.json(
            { error: 'Error deleting template' },
            { status: 500 }
        );
    }
}