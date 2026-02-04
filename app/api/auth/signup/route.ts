import { NextResponse } from 'next/server';
import { convex } from '@/lib/convex';
import { hashPassword } from '@/lib/auth';
import { api } from '@/convex/_generated/api';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Role is automatically 'pending'
        const role = 'pending';

        try {
            const hashedPassword = await hashPassword(password);

            // Create user in Convex
            await convex.mutation(api.users.createUser, {
                email,
                password: hashedPassword,
                role,
                status: 'pending'
            });

            return NextResponse.json({ message: 'User registered successfully. Please wait for approval.' }, { status: 201 });
        } catch (mutationError: unknown) {
            if (mutationError instanceof Error && mutationError.message.includes('User already exists')) {
                return NextResponse.json({ error: 'User already exists' }, { status: 409 });
            }
            throw mutationError;
        }
    } catch (error) {
        console.error('Error in signup:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
