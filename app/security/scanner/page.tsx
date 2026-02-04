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
  const [showQRScanner, setShowQRScanner] = useState(false);
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
        }, 1000);
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
      } else if (data.status === 'already_entered') {
        setEntryStatus('already_entered');
        setScannedPerson(null); // Don't show details
        setProcessing(false);
        setTimeout(() => {
          resetScanner();
        }, 1000);
      } else if (data.status === 'allowed') {
        // Automatically mark as entered
        await markAsEntered(code, data.person);
      } else {
        setEntryStatus('denied');
        setProcessing(false);
      }
    } catch (err) {
      console.error("Verification error", err);
      setEntryStatus('denied');
      setProcessing(false);
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
    setShowQRScanner(false);
    processQRCode(qrData);
  };

  const handleQRScanError = (error: string) => {
    console.error("QR Scan Error:", error);
    alert(`QR Scan Error: ${error}`);
  };

  return (
    <div className="min-h-screen space-y-4 sm:space-y-6 py-4 sm:py-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">QR Code Scanner</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">
          Fast and secure guest entry verification
        </p>
      </div>

      {/* QR Scanner Input */}
      <Card className="p-4 sm:p-8 bg-card border-border">
        <form onSubmit={handleQRSubmit} className="space-y-4">
          <label className="block">
            <p className="text-foreground font-medium text-sm sm:text-base mb-2">Scan QR Code</p>
            <Input
              ref={inputRef}
              type="text"
              placeholder="Point camera at QR code or paste here..."
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              className="bg-input text-foreground text-base sm:text-lg p-3 sm:p-4 min-h-12"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Keep this field focused while scanning
            </p>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={() => setShowQRScanner(true)}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 min-h-10 sm:min-h-12 text-sm sm:text-base"
            >
              <Camera className="w-4 h-4 mr-2" />
              Open Camera Scanner
            </Button>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-10 sm:min-h-12 text-sm sm:text-base"
              disabled={!qrInput.trim()}
            >
              Verify Entry
            </Button>
          </div>
        </form>
      </Card>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRCodeScanned}
          onError={handleQRScanError}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Result Display */}
      {(entryStatus === 'success' || entryStatus === 'already_entered' || entryStatus === 'not_found' || entryStatus === 'denied') && (
        <Card
          className={`p-4 sm:p-8 border-2 ${entryStatus === 'success'
            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
            : entryStatus === 'denied' || entryStatus === 'not_found'
              ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
              : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900'
            }`}
        >
          <div className="space-y-4 text-center">
            <div className="flex flex-col items-center gap-3">
              {entryStatus === 'success' && (
                <>
                  <CheckCircle className="w-16 h-16 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">
                    Entered Successfully
                  </p>
                </>
              )}
              {entryStatus === 'already_entered' && (
                <>
                  <AlertTriangle className="w-16 h-16 text-yellow-600" />
                  <p className="text-2xl font-bold text-yellow-600">
                    Already Entered
                  </p>
                </>
              )}
              {entryStatus === 'not_found' && (
                <>
                  <XCircle className="w-16 h-16 text-red-600" />
                  <p className="text-2xl font-bold text-red-600">
                    Guest Not Found
                  </p>
                </>
              )}
              {entryStatus === 'denied' && (
                <>
                  <XCircle className="w-16 h-16 text-red-600" />
                  <p className="text-2xl font-bold text-red-600">
                    Access Denied
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Legacy/Reset State (Hidden mostly due to auto-reset) */}
    </div>
  );
}
