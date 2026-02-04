'use client';

import React from "react"

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, AlertTriangle, Camera } from 'lucide-react';
import { QRScanner } from '@/components/QRScanner';

interface GuestEntry {
  id: string;
  name: string;
  email?: string;
  isAllowed: boolean;
  timestamp: string;
}



export default function SecurityScannerPage() {
  const [qrInput, setQrInput] = useState('');
  const [scanHistory, setScanHistory] = useState<GuestEntry[]>([]);
  const [entryStatus, setEntryStatus] = useState<
    'idle' | 'success' | 'denied' | 'not_found' | 'already_entered' | 'verified'
  >('idle');
  const [scannedPerson, setScannedPerson] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const resetScanner = () => {
    setEntryStatus('idle');
    setScannedPerson(null);
    setQrInput('');
    inputRef.current?.focus();
  };

  const markAsEntered = async (qrData: string, person: any) => {
    try {
      const res = await fetch('/api/mark-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_data: qrData }),
      });
      if (res.ok) {
        setEntryStatus('success');
        const entry: GuestEntry = {
          id: qrData,
          name: person.bla2_name,
          email: person.party_responsibility,
          isAllowed: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        setScanHistory([entry, ...scanHistory.slice(0, 9)]);
        setTimeout(() => {
          resetScanner();
        }, 2000);
      } else {
        alert("Failed to record entry");
      }
    } catch (err) {
      console.error("Entry error", err);
      alert("Error recording entry");
    } finally {
      setProcessing(false);
    }
  };

  const verifyQRCode = async (code: string) => {
    setProcessing(true);
    try {
      const res = await fetch('/api/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_data: code }),
      });
      const data = await res.json();

      if (data.status === 'not_found') {
        setEntryStatus('not_found');
        setScannedPerson(null);
        setProcessing(false);
        setTimeout(() => {
          resetScanner();
        }, 2000);
      } else if (data.status === 'already_entered') {
        setEntryStatus('already_entered');
        setScannedPerson(null);
        setProcessing(false);
        setTimeout(() => {
          resetScanner();
        }, 2000);
      } else if (data.status === 'allowed') {
        await markAsEntered(code, data.person);
      } else {
        setEntryStatus('denied');
        setProcessing(false);
        setTimeout(() => {
          resetScanner();
        }, 2000);
      }
    } catch (err) {
      console.error("Verification error", err);
      setEntryStatus('denied');
      setProcessing(false);
      setTimeout(() => {
        resetScanner();
      }, 2000);
    }
  };

  const processQRCode = (code: string) => {
    verifyQRCode(code.trim());
  };

  const handleQRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrInput.trim()) {
      processQRCode(qrInput);
      setQrInput('');
      inputRef.current?.focus();
    }
  };

  const handleQRCodeScanned = (qrData: string) => {
    // Don't close scanner, just process
    processQRCode(qrData);
  };

  const handleQRScanError = (error: string) => {
    console.error("QR Scan Error:", error);
    // Suppress alerts for scan errors as they can be noisy in continuous mode
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Entry Scanner</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Continuous scanning mode enabled
        </p>
      </div>

      <div className="space-y-6">
        {/* Main Scanner Card */}
        <Card className="p-4 sm:p-6 bg-card border-border space-y-4">
          <div className="rounded-lg overflow-hidden bg-muted aspect-square relative">
            <QRScanner
              onScan={handleQRCodeScanned}
              onError={handleQRScanError}
              variant="inline"
              scanDelay={2000}
            />
          </div>

          <form onSubmit={handleQRSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type ID manually..."
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              className="bg-input text-foreground"
              autoComplete="off"
            />
            <Button type="submit" disabled={!qrInput.trim()}>
              Check
            </Button>
          </form>
        </Card>

        {/* Result Display */}
        {entryStatus !== 'idle' && (
          <Card
            className={`p-6 border-2 text-center animate-in fade-in zoom-in duration-300 ${entryStatus === 'success'
                ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                : entryStatus === 'denied' || entryStatus === 'not_found'
                  ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                  : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900'
              }`}
          >
            <div className="flex flex-col items-center gap-2">
              {entryStatus === 'success' && (
                <>
                  <CheckCircle className="w-16 h-16 text-green-600" />
                  <h2 className="text-2xl font-bold text-green-600">ALLOWED</h2>
                  <p className="text-green-700">Entry Recorded</p>
                </>
              )}
              {entryStatus === 'already_entered' && (
                <>
                  <AlertTriangle className="w-16 h-16 text-yellow-600" />
                  <h2 className="text-2xl font-bold text-yellow-600">WARNING</h2>
                  <p className="text-yellow-700">Already Entered</p>
                </>
              )}
              {entryStatus === 'not_found' && (
                <>
                  <XCircle className="w-16 h-16 text-red-600" />
                  <h2 className="text-2xl font-bold text-red-600">INVALID</h2>
                  <p className="text-red-700">Guest Not Found</p>
                </>
              )}
              {entryStatus === 'denied' && (
                <>
                  <XCircle className="w-16 h-16 text-red-600" />
                  <h2 className="text-2xl font-bold text-red-600">DENIED</h2>
                  <p className="text-red-700">Access Denied</p>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
