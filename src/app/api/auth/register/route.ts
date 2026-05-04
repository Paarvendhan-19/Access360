import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { userService } from '@/lib/services/user';

export async function POST(req: Request) {
    try {
        const { name, email, password, adminCode } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await userService.getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Check if admin code is valid
        const isAdmin = adminCode === process.env.ADMIN_SECRET_CODE;

        const user = await userService.createUser({
            name,
            email,
            password: hashedPassword,
            role: isAdmin ? 'admin' : 'student',
            accessibilityPreferences: {
                highContrast: false,
                fontSize: 'medium',
                dyslexiaFont: false,
                focusMode: false,
                speechEnabled: false,
                language: 'en',
            },
        });

        return NextResponse.json({ message: 'User created successfully', user: { id: user.id, email: user.email } }, { status: 201 });
    } catch (error: any) {
        console.error('Registration error:', error);
        
        // Provide specific error messages based on error type
        let message = 'Server error during registration';
        let status = 500;
        
        if (error.name === 'MongooseServerSelectionError' || error.message?.includes('connect')) {
            message = 'Database connection failed. Please try again later.';
        } else if (error.name === 'MongoServerError' && error.code === 8000) {
            message = 'Database authentication failed. Please contact support.';
        } else if (error.name === 'MongoServerError' && error.code === 11000) {
            message = 'User already exists with this email';
            status = 400;
        }
        
        return NextResponse.json({
            message,
            details: process.env.NODE_ENV === 'development' ? error.message : message,
        }, { status });
    }
}
