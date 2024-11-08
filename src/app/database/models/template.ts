import mongoose, { Document, Schema } from 'mongoose';

interface ITemplate extends Document {
    title: string;
    description?: string;
    questions: mongoose.Types.ObjectId[];
    createdAt: Date;
}

const templateSchema = new Schema<ITemplate>({
    title: { type: String, required: true },
    description: { type: String },
    questions: [{
        id: String,
        type: {
            type: String,
            enum: ['multiple-choice', 'text-input', 'rating-scale'],
            required: true,
        },
        text: String,
        options: [String],
        required: Boolean,
        min: Number,
        max: Number,
    }],
    createdAt: { type: Date, default: Date.now }
});

const Template = mongoose.models.Template || mongoose.model<ITemplate>('Template', templateSchema);

export default Template;