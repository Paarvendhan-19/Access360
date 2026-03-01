import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncement extends Document {
    title: string;
    message: string;
    priority: string;
    timestamp: number;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, required: true },
    timestamp: { type: Number, default: Date.now },
});

const Announcement: Model<IAnnouncement> = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
export default Announcement;
