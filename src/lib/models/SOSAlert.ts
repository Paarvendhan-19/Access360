import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISOSAlert extends Document {
    userId: string;
    location: {
        lat: number;
        lng: number;
    };
    timestamp: number;
    status: 'active' | 'responded' | 'handled';
    urgencyScore?: number;
}

const SOSAlertSchema = new Schema<ISOSAlert>({
    userId: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    timestamp: { type: Number, default: Date.now },
    status: { type: String, enum: ['active', 'responded', 'handled'], default: 'active' },
    urgencyScore: { type: Number },
});

const SOSAlert: Model<ISOSAlert> = mongoose.models.SOSAlert || mongoose.model<ISOSAlert>('SOSAlert', SOSAlertSchema);
export default SOSAlert;
