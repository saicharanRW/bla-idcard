'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PendingPage() {
    const router = useRouter();
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        // Poll for status changes every 3 seconds
        const checkStatus = async () => {
            try {
                setChecking(true);
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    const user = data.user;

                    // If user is approved and has a valid role, redirect
                    if (user.status === 'approved') {
                        // Update localStorage with new user data
                        localStorage.setItem('user', JSON.stringify(user));

                        if (user.role === 'admin') {
                            router.push('/admin/dashboard');
                        } else if (user.role === 'security') {
                            router.push('/security/scanner');
                        }
                    } else if (user.role !== 'pending' && user.status !== 'pending') {
                        // Role changed to something else, update and redirect
                        localStorage.setItem('user', JSON.stringify(user));
                        if (user.role === 'admin') {
                            router.push('/admin/dashboard');
                        } else if (user.role === 'security') {
                            router.push('/security/scanner');
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking status:', error);
            } finally {
                setChecking(false);
            }
        };

        // Check immediately on mount
        checkStatus();

        // Then poll every 3 seconds
        const interval = setInterval(checkStatus, 3000);
        return () => clearInterval(interval);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full text-center space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                    <svg className="h-8 w-8 text-yellow-600 dark:text-yellow-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Waiting for Approval
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                        Your account has been created and is currently pending approval from an administrator.
                    </p>
                    <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                        {checking ? 'Checking status...' : 'This page will automatically redirect once approved.'}
                    </p>
                </div>
                <div className="mt-6">
                    <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                        &larr; Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
