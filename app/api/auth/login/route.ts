import { NextResponse } from 'next/server';
import { convex } from '@/lib/convex';
import { comparePassword, signJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { api } from '@/convex/_generated/api';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Get user by email from Convex
    const user = await convex.query(api.users.getUserByEmail, { email });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Note: We allow login even for pending users. The frontend will redirect them to /pending.
    const token = await signJWT({ id: user._id, email: user.email, role: user.role });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return NextResponse.json({
      message: 'Login successful',
      user: { id: user._id, email: user.email, role: user.role, status: user.status }
    });

  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
