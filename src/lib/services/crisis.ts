import dbConnect from '../mongodb';
import CrisisReport from '../models/CrisisReport';

export interface CrisisReportDoc {
    id?: string;
    userId: string;
    location: {
        lat: number;
        lng: number;
    };
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    verified: boolean;
    photoUrl?: string;
    timestamp: number;
}

export const crisisService = {
    async createReport(report: Omit<CrisisReportDoc, 'timestamp' | 'verified'>): Promise<CrisisReportDoc> {
        await dbConnect();
        const doc = await CrisisReport.create({
            ...report,
            verified: false,
            timestamp: Date.now(),
        });
        return { id: doc._id.toString(), ...doc.toObject() } as unknown as CrisisReportDoc;
    },

    async getVerifiedReports(limit: number = 50): Promise<CrisisReportDoc[]> {
        await dbConnect();
        const docs = await CrisisReport.find({ verified: true })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();

        return docs.map((doc: any) => ({ id: doc._id.toString(), ...doc }) as CrisisReportDoc);
    }
};
