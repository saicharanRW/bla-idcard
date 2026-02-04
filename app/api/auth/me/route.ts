import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Fetch fresh user data from Convex
        let user;
        try {
            user = await convex.query(api.users.getUserById, {
                id: payload.id as Id<"users">
            });
        } catch (error) {
            console.warn("Invalid ID in token (likely from old DB):", payload.id);
            // If the ID format is invalid (e.g. old Postgres integer ID), Convex throws validation error.
            // We treat this as "User not found" / "Invalid token" so client logs out.
            return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Error in /api/auth/me:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
