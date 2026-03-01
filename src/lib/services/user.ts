import dbConnect from '../mongodb';
import User, { IUser } from '../models/User';

export interface UserPreferences {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'xl';
    dyslexiaFont: boolean;
    focusMode: boolean;
    speechEnabled: boolean;
    language: 'en' | 'ta' | 'hi';
}

export interface UserDoc {
    id?: string;
    name: string;
    email: string;
    password?: string;
    image?: string;
    role: 'student' | 'admin' | 'volunteer';
    accessibilityPreferences: UserPreferences;
    createdAt: number;
}

export const userService = {
    async getUserByEmail(email: string): Promise<UserDoc | null> {
        await dbConnect();
        const user = await User.findOne({ email }).lean();
        if (!user) return null;
        return { id: (user as any)._id.toString(), ...user } as unknown as UserDoc;
    },

    async createUser(userData: Omit<UserDoc, 'createdAt'>): Promise<UserDoc> {
        await dbConnect();
        const user = await User.create({
            ...userData,
            createdAt: Date.now(),
        });
        return { id: user._id.toString(), ...user.toObject() } as unknown as UserDoc;
    },

    async updateUser(id: string, updates: Partial<UserDoc>): Promise<void> {
        await dbConnect();
        await User.findByIdAndUpdate(id, updates);
    }
};
