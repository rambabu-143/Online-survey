import mongoose, { Document, Schema } from 'mongoose';

interface ISurvey extends Document {
    title: string;
    description?: string;
    creatorId: mongoose.Types.ObjectId;
    status: 'draft' | 'active' | 'closed';
    questions: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    theme?: string;
}

const surveySchema = new Schema<ISurvey>({
    title: { type: String, required: true },
    description: { type: String },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    theme: { type: String }
});

const Survey = mongoose.models.Survey || mongoose.model('Survey', surveySchema);
export default Survey;