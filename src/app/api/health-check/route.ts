import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { userService } from '@/lib/services/user';

export async function GET() {
    try {
        console.log('[Health Check] Testing MongoDB...');
        await dbConnect();
        const testUser = await userService.getUserByEmail('test@test.com');

        return NextResponse.json({
            status: 'ok',
            mongodb: 'connected',
            readyState: mongoose.connection.readyState,
            canQuery: true
        });
    } catch (error: any) {
        console.error('[Health Check] FAIL:', error.message);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
