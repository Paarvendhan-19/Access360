import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMood extends Document {
    userId: string;
    mood: 'happy' | 'neutral' | 'stressed' | 'sad';
    note?: string;
    timestamp: number;
}

const MoodSchema = new Schema<IMood>({
    userId: { type: String, required: true },
    mood: { type: String, enum: ['happy', 'neutral', 'stressed', 'sad'], required: true },
    note: { type: String },
    timestamp: { type: Number, default: Date.now },
});

const Mood: Model<IMood> = mongoose.models.Mood || mongoose.model<IMood>('Mood', MoodSchema);
export default Mood;
