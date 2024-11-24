import mongoose, { Document, Schema } from 'mongoose';

interface IQuestion extends Document {
    surveyId: mongoose.Types.ObjectId;
    questionText: string;
    questionType: 'multiple-choice' | 'text-input' | 'rating-scale' | 'dropdown' | 'slider';
    options?: string[];
    required: boolean;
    order: number;
    min?: number;
    max?: number;
    conditionalBranching?: {
        targetQuestionId: mongoose.Types.ObjectId;
        condition: 'equals' | 'greater-than' | 'less-than';
        value: string | number;
    };
}

const questionSchema = new Schema<IQuestion>({
    surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
    questionText: { type: String, required: true },
    questionType: {
        type: String,
        enum: ['multiple-choice', 'text-input', 'rating-scale', 'dropdown', 'slider'],
        required: true
    },
    options: [{ type: String }], // For multiple-choice and dropdown questions
    required: { type: Boolean, default: false },
    order: { type: Number, required: true },
    min: { type: Number }, // For rating-scale and slider questions
    max: { type: Number }, // For rating-scale and slider questions
    conditionalBranching: {
        targetQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        condition: {
            type: String,
            enum: ['equals', 'greater-than', 'less-than']
        },
        value: { type: Schema.Types.Mixed } // Can be string or number
    }
});

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
export default Question;