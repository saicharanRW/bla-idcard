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
      } else if (data.status === 'already_entered') {
        setEntryStatus('already_entered');
        setScannedPerson(data.person);
      } else if (data.status === 'allowed') {
        setEntryStatus('verified'); // Ready to mark as entered
        setScannedPerson(data.person);
      } else {
        setEntryStatus('denied');
      }
    } catch (err) {
      console.error("Verification error", err);
      setEntryStatus('denied');
    } finally {
      setProcessing(false);
    }
  };

  const markAsEntered = async () => {
    if (!scannedPerson) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/mark-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_data: scannedPerson.qr_data }),
      });
      if (res.ok) {
        setEntryStatus('success');
        const entry: GuestEntry = {
          id: scannedPerson.qr_data,
          name: scannedPerson.bla2_name,
          email: scannedPerson.party_responsibility, // mapping responsibility to email field for display
          isAllowed: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        setScanHistory([entry, ...scanHistory.slice(0, 9)]);
        setTimeout(() => {
          setEntryStatus('idle');
          setScannedPerson(null);
          setQrInput('');
          inputRef.current?.focus();
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
      {scannedPerson && (
        <Card
          className={`p-4 sm:p-8 border-2 ${entryStatus === 'success'
            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
            : entryStatus === 'denied' || entryStatus === 'not_found'
              ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
              : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900'
            }`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {entryStatus === 'success' && (
                <>
                  <CheckCircle className="w-6 sm:w-8 h-6 sm:h-8 text-green-600 flex-shrink-0" />
                  <p className="text-base sm:text-lg font-semibold text-green-600">
                    Entry Recorded
                  </p>
                </>
              )}
              {entryStatus === 'verified' && (
                <>
                  <CheckCircle className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600 flex-shrink-0" />
                  <p className="text-base sm:text-lg font-semibold text-blue-600">
                    Access Granted - Verify Details
                  </p>
                </>
              )}
              {entryStatus === 'already_entered' && (
                <>
                  <AlertTriangle className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-600 flex-shrink-0" />
                  <p className="text-base sm:text-lg font-semibold text-yellow-600">
                    Already Entered
                  </p>
                </>
              )}
              {entryStatus === 'not_found' && (
                <>
                  <XCircle className="w-6 sm:w-8 h-6 sm:h-8 text-red-600 flex-shrink-0" />
                  <p className="text-base sm:text-lg font-semibold text-red-600">
                    Not Found / Invalid QR
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-semibold text-muted-foreground">Name:</span>
                <span className="font-bold text-foreground text-lg">{scannedPerson.bla2_name}</span>

                <span className="font-semibold text-muted-foreground">Responsibility:</span>
                <span>{scannedPerson.party_responsibility}</span>

                <span className="font-semibold text-muted-foreground">District:</span>
                <span>{scannedPerson.party_district}</span>

                <span className="font-semibold text-muted-foreground">Assembly:</span>
                <span>{scannedPerson.assembly_constituency}</span>

                <span className="font-semibold text-muted-foreground">Station:</span>
                <span>{scannedPerson.polling_station_number}</span>
              </div>
            </div>

            {entryStatus === 'verified' && (
              <div className="pt-4">
                <Button
                  onClick={markAsEntered}
                  disabled={processing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white min-h-12 text-lg font-bold shadow-lg"
                >
                  {processing ? 'Processing...' : 'ALLOW ENTRY'}
                </Button>
              </div>
            )}

            {entryStatus !== 'verified' && entryStatus !== 'success' && entryStatus !== 'already_entered' && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEntryStatus('idle');
                    setScannedPerson(null);
                    setQrInput('');
                    inputRef.current?.focus();
                  }}
                  className="w-full"
                >
                  Reset / Scan Next
                </Button>
              </div>
            )}

          </div>
        </Card>
      )}

      {/* Show Not Found state explicitly if scannedPerson is null but status is not_found */}
      {!scannedPerson && entryStatus === 'not_found' && (
        <Card className="p-4 sm:p-8 bg-red-50 border-2 border-red-200">
          <div className="flex flex-col items-center gap-3 text-center">
            <XCircle className="w-12 h-12 text-red-600" />
            <h3 className="text-xl font-bold text-red-600">Guest Not Found</h3>
            <p className="text-muted-foreground">The scanned QR code does not match any record in the database.</p>
            <Button
              variant="outline"
              onClick={() => {
                setEntryStatus('idle');
                setQrInput('');
                inputRef.current?.focus();
              }}
              className="mt-4 w-full"
            >
              Try Again
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
