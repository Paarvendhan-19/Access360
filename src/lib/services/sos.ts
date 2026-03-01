import dbConnect from '../mongodb';
import SOSAlert from '../models/SOSAlert';

export interface SOSAlertDoc {
    id?: string;
    userId: string;
    location: {
        lat: number;
        lng: number;
    };
    timestamp: number;
    status: 'active' | 'responded';
}

export const sosService = {
    async triggerSOS(userId: string, location: SOSAlertDoc['location']): Promise<SOSAlertDoc> {
        await dbConnect();
        const doc = await SOSAlert.create({
            userId,
            location,
            status: 'active',
            timestamp: Date.now(),
        });
        return { id: doc._id.toString(), ...doc.toObject() } as unknown as SOSAlertDoc;
    },

    async getActiveAlerts(): Promise<SOSAlertDoc[]> {
        await dbConnect();
        const docs = await SOSAlert.find({ status: 'active' })
            .sort({ timestamp: -1 })
            .lean();

        return docs.map((doc: any) => ({ id: doc._id.toString(), ...doc }) as SOSAlertDoc);
    }
};
