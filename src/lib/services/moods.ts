import dbConnect from '../mongodb';
import Mood from '../models/Mood';

export interface MoodDoc {
    id?: string;
    userId: string;
    mood: 'happy' | 'neutral' | 'stressed' | 'sad';
    note?: string;
    timestamp: number;
}

export const moodService = {
    async logMood(userId: string, mood: MoodDoc['mood'], note?: string): Promise<MoodDoc> {
        await dbConnect();
        const doc = await Mood.create({
            userId,
            mood,
            note,
            timestamp: Date.now(),
        });
        return { id: doc._id.toString(), ...doc.toObject() } as unknown as MoodDoc;
    },

    async getUserMoods(userId: string, limit: number = 7): Promise<MoodDoc[]> {
        await dbConnect();
        const docs = await Mood.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();

        return docs.map((doc: any) => ({ id: doc._id.toString(), ...doc }) as MoodDoc);
    },

    async getWeeklyStats(): Promise<any[]> {
        await dbConnect();
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const docs = await Mood.find({ timestamp: { $gte: sevenDaysAgo } }).lean();

        const stats: Record<string, { total: number, count: number }> = {};

        docs.forEach((doc: any) => {
            const date = new Date(doc.timestamp).toISOString().split('T')[0];
            const moodValue = doc.mood === 'happy' ? 5 : doc.mood === 'neutral' ? 3 : doc.mood === 'stressed' ? 2 : 1;

            if (!stats[date]) stats[date] = { total: 0, count: 0 };
            stats[date].total += moodValue;
            stats[date].count += 1;
        });

        return Object.entries(stats).map(([date, s]) => ({
            _id: date,
            avgMood: (s.total / s.count).toFixed(1)
        })).sort((a, b) => a._id.localeCompare(b._id));
    }
};
