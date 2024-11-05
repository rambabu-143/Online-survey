import mongoose, { Document, Schema } from 'mongoose';

interface IResponse extends Document {
    surveyId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId; // Optional for anonymous responses
    answers?: Map<string, string>; // Keyed by Question IDs
    submittedAt?: Date;
}

const responseSchema = new Schema<IResponse>({
    surveyId: { type: mongoose.Schema.Types.ObjectId, ref: "Survey", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional for anonymous responses
    answers: { type: Map, of: String }, // Keyed by Question IDs
    submittedAt: { type: Date, default: Date.now }
});

const Response = mongoose.models.Response || mongoose.model('Respnse', responseSchema);
export default Response;