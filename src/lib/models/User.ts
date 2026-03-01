import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    role: 'student' | 'admin' | 'volunteer';
    accessibilityPreferences: {
        highContrast: boolean;
        fontSize: 'small' | 'medium' | 'large' | 'xl';
        dyslexiaFont: boolean;
        focusMode: boolean;
        speechEnabled: boolean;
        language: 'en' | 'ta' | 'hi';
    };
    createdAt: number;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    role: { type: String, enum: ['student', 'admin', 'volunteer'], default: 'student' },
    accessibilityPreferences: {
        highContrast: { type: Boolean, default: false },
        fontSize: { type: String, enum: ['small', 'medium', 'large', 'xl'], default: 'medium' },
        dyslexiaFont: { type: Boolean, default: false },
        focusMode: { type: Boolean, default: false },
        speechEnabled: { type: Boolean, default: false },
        language: { type: String, enum: ['en', 'ta', 'hi'], default: 'en' },
    },
    createdAt: { type: Number, default: Date.now },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
