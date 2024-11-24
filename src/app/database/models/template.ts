import mongoose, { Document, Schema } from 'mongoose';

interface ITemplate extends Document {
    title: string;
    description?: string;
    questions: {
        id: string;
        type: 'multiple-choice' | 'text-input' | 'rating-scale' | 'dropdown' | 'slider';
        text: string;
        options?: string[];
        required: boolean;
        min?: number;
        max?: number;
        conditionalBranching?: {
            targetQuestionId: string;
            condition: 'equals' | 'greater-than' | 'less-than';
            value: string | number;
        };
    }[];
    createdAt: Date;
}

const templateSchema = new Schema<ITemplate>({
    title: { type: String, required: true },
    description: { type: String },
    questions: [{
        id: String,
        type: {
            type: String,
            enum: ['multiple-choice', 'text-input', 'rating-scale', 'dropdown', 'slider'],
            required: true,
        },
        text: String,
        options: [String],
        required: Boolean,
        min: Number,
        max: Number,
        conditionalBranching: {
            targetQuestionId: String,
            condition: {
                type: String,
                enum: ['equals', 'greater-than', 'less-than']
            },
            value: Schema.Types.Mixed
        }
    }],
    createdAt: { type: Date, default: Date.now }
});

const Template = mongoose.models.Template || mongoose.model<ITemplate>('Template', templateSchema);

export default Template;