import mongoose, { Document, Schema } from 'mongoose';

export interface IResetToken extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    expires: Date;
}

const resetTokenSchema = new Schema<IResetToken>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    expires: { type: Date, required: true },
});

const ResetToken = mongoose.models.ResetToken || mongoose.model<IResetToken>('ResetToken', resetTokenSchema);

export default ResetToken;