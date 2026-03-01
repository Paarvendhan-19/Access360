import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHealthLog extends Document {
    userId: string;
    moodScore: number;
    note?: string;
    timestamp: number;
}

const HealthLogSchema = new Schema<IHealthLog>({
    userId: { type: String, required: true },
    moodScore: { type: Number, required: true },
    note: { type: String },
    timestamp: { type: Number, default: Date.now },
});

const HealthLog: Model<IHealthLog> = mongoose.models.HealthLog || mongoose.model<IHealthLog>('HealthLog', HealthLogSchema);
export default HealthLog;
