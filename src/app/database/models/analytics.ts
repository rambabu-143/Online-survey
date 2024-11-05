import mongoose, { Document, Schema } from 'mongoose';

interface IAnalytics extends Document {
    surveyId: mongoose.Types.ObjectId;
    totalResponses: number;
    responseRate: number; // Can be calculated based on total invitations sent
    questionBreakdown?: Map<string, number>; // Keyed by Question IDs with response counts
}

const analyticsSchema = new Schema<IAnalytics>({
    surveyId: { type: mongoose.Schema.Types.ObjectId, ref: "Survey", required: true },
    totalResponses: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 }, // Can be calculated based on total invitations sent
    questionBreakdown: { type: Map, of: Number } // Keyed by Question IDs with response counts
});

const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
export default Analytics;