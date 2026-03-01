import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIncident extends Document {
    userId: string;
    type: 'Flood' | 'Heat' | 'Safety' | 'Other';
    description: string;
    location: {
        lat: number;
        lng: number;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'resolved' | 'approved';
    imageUrl?: string;
    timestamp: number;
}

const IncidentSchema = new Schema<IIncident>({
    userId: { type: String, required: true },
    type: { type: String, enum: ['Flood', 'Heat', 'Safety', 'Other'], required: true },
    description: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    status: { type: String, enum: ['pending', 'resolved', 'approved'], default: 'pending' },
    imageUrl: { type: String },
    timestamp: { type: Number, default: Date.now },
});

const Incident: Model<IIncident> = mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema);
export default Incident;
