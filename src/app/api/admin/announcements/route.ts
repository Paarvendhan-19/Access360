import dbConnect from '@/lib/mongodb';
import Announcement from '@/lib/models/Announcement';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();
        const docs = await Announcement.find()
            .sort({ timestamp: -1 })
            .limit(10)
            .lean();

        const announcements = docs.map((doc: any) => ({ id: doc._id.toString(), ...doc }));

        return NextResponse.json({ announcements });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, message, priority } = await req.json();
        await dbConnect();
        const doc = await Announcement.create({
            title,
            message,
            priority,
            timestamp: Date.now()
        });

        return NextResponse.json({ success: true, id: doc._id.toString() });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await dbConnect();
        await Announcement.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
