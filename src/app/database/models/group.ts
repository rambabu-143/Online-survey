import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
    name: string;
    description?: string;
    members: mongoose.Types.ObjectId[];
    assignedSurveys: mongoose.Types.ObjectId[]; 
    createdAt: Date;
    updatedAt: Date;
}

const groupSchema = new Schema<IGroup>({
    name: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignedSurveys: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Survey' }], 
        default: [],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Group = mongoose.models.Group || mongoose.model<IGroup>('Group', groupSchema);

export default Group;