'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated and is security
    const checkAuth = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/login');
        return;
      }

      const parsedUser = JSON.parse(userStr);
      if (parsedUser.role !== 'security') {
        // Role changed, redirect appropriately
        if (parsedUser.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (parsedUser.role === 'pending') {
          router.push('/pending');
        } else {
          router.push('/login');
        }
        return;
      }

      setUser(parsedUser);
      setIsLoading(false);
    };

    checkAuth();

    // Poll for role changes every 5 seconds
    const pollRoleChange = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const currentUser = localStorage.getItem('user');
          if (currentUser) {
            const parsed = JSON.parse(currentUser);
            if (data.user.role !== parsed.role) {
              // Role changed! Update localStorage and redirect
              localStorage.setItem('user', JSON.stringify(data.user));
              if (data.user.role === 'admin') {
                router.push('/admin/dashboard');
              } else if (data.user.role === 'pending') {
                router.push('/pending');
              } else if (data.user.role !== 'security') {
                router.push('/login');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error polling role:', error);
      }
    };

    const interval = setInterval(pollRoleChange, 2000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-sidebar border-b border-sidebar-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/security/scanner" className="text-xl font-bold text-sidebar-foreground">
              Security Scanner
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sidebar-foreground text-sm">{user?.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent bg-transparent">
              Logout
            </Button>
          </div>
        </div>
      </nav>
      <main className="max-w-2xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
