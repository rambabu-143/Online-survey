import mongoose, { Document, Schema } from 'mongoose';

interface IQuestion extends Document {
    surveyId: mongoose.Types.ObjectId;
    questionText: string;
    questionType: 'multiple-choice' | 'text input' | 'rating scale';
    options?: string[];
    required?: boolean;
    order?: number;
}

const questionSchema = new Schema<IQuestion>({
    surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
    questionText: { type: String, required: true },
    questionType: {
        type: String,
        enum: ['multiple-choice', 'text input', 'rating scale'],
        required: true
    },
    options: [{ type: String }], // For multiple-choice questions
    required: { type: Boolean, default: false },
    order: { type: Number, required: true }
});

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
export default Question;