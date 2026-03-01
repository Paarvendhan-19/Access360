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
        return NextResponse.json({
            message: 'Server error during registration',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
