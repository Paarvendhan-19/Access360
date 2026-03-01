import dbConnect from '../mongodb';
import HealthLog from '../models/HealthLog';

export interface HealthLogDoc {
    id?: string;
    userId: string;
    moodScore: number;
    note?: string;
    timestamp: number;
}

export const healthService = {
    async createLog(log: Omit<HealthLogDoc, 'timestamp'>): Promise<HealthLogDoc> {
        await dbConnect();
        const doc = await HealthLog.create({
            ...log,
            timestamp: Date.now(),
        });
        return { id: doc._id.toString(), ...doc.toObject() } as unknown as HealthLogDoc;
    },

    async getUserLogs(userId: string, limit: number = 10): Promise<HealthLogDoc[]> {
        await dbConnect();
        const docs = await HealthLog.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();

        return docs.map((doc: any) => ({ id: doc._id.toString(), ...doc }) as HealthLogDoc);
    },

    async getRecentLogs(days: number = 7): Promise<HealthLogDoc[]> {
        await dbConnect();
        const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        const docs = await HealthLog.find({ timestamp: { $gte: startTime } })
            .sort({ timestamp: 1 })
            .lean();

        return docs.map((doc: any) => ({ id: doc._id.toString(), ...doc }) as HealthLogDoc);
    }
};
