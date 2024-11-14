import dbConnect from '@/app/database/utils/mongodb';
import User from '@/app/database/models/user';
import { Types } from 'mongoose';

export async function DELETE(request: Request,
    { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        await dbConnect();

        if (!Types.ObjectId.isValid(id)) {
            return new Response(JSON.stringify({ message: 'Invalid user ID' }), { status: 400 });
        }

        const result = await User.findByIdAndDelete(id);

        if (!result) {
            return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: 'User deleted successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error deleting user:', error);
        return new Response(JSON.stringify({ message: 'Error deleting user' }), { status: 500 });
    }
}
