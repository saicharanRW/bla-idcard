'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, BarChart3, QrCode } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'security') {
        router.push('/security/scanner');
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
          <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">Event Access Control</h1>
          <Button
            onClick={() => router.push('/login')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm min-h-9 whitespace-nowrap"
          >
            Log In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:py-16 md:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
            Professional Event Management
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8">
            Secure guest access control and real-time analytics for high-profile events
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm min-h-10"
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="p-6 sm:p-8 bg-card border-border text-center">
            <div className="mb-4 flex justify-center">
              <BarChart3 className="w-10 sm:w-12 h-10 sm:h-12 text-accent" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              Admin Dashboard
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Real-time analytics, crowd flow monitoring, and guest management with comprehensive charts and statistics.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 bg-card border-border text-center">
            <div className="mb-4 flex justify-center">
              <QrCode className="w-10 sm:w-12 h-10 sm:h-12 text-accent" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              QR Code Scanning
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Lightning-fast QR code scanning interface optimized for quick entry verification at checkpoints.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 bg-card border-border text-center sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex justify-center">
              <Shield className="w-10 sm:w-12 h-10 sm:h-12 text-accent" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              Secure Access
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Role-based authentication system ensuring only authorized personnel can access the platform.
            </p>
          </Card>
        </div>
      </section>

      {/* Demo Credentials */}
      {/* <section className="bg-secondary/30 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
            Demo Credentials
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
            <Card className="p-4 sm:p-6 bg-card border-border">
              <h4 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Admin Access</h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div>
                  <p className="text-muted-foreground">Email:</p>
                  <p className="text-foreground font-mono break-all">admin@event.com</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Password:</p>
                  <p className="text-foreground font-mono">password</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 sm:p-6 bg-card border-border">
              <h4 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Security Access</h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div>
                  <p className="text-muted-foreground">Email:</p>
                  <p className="text-foreground font-mono break-all">security@event.com</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Password:</p>
                  <p className="text-foreground font-mono">password</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          Ready to streamline your event?
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8 max-w-2xl mx-auto">
          Start managing your guest access and analytics today
        </p>
        <Button
          onClick={() => router.push('/login')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm min-h-10"
        >
          Log In to Dashboard
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 text-center">
          <p className="text-muted-foreground text-xs sm:text-sm">
            Professional event management system © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
