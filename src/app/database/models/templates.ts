import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Template || mongoose.model('Template', TemplateSchema);