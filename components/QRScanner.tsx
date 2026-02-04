"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface QRScannerProps {
    onScan: (result: string) => void;
    onError?: (error: string) => void;
    onClose?: () => void;
    variant?: 'modal' | 'inline';
    scanDelay?: number;
}

export function QRScanner({
    onScan,
    onError,
    onClose,
    variant = 'modal',
    scanDelay = 2000,
}: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const qrScannerRef = useRef<QrScanner | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use refs for callbacks
    const onScanRef = useRef(onScan);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onScanRef.current = onScan;
        onErrorRef.current = onError;
    }, [onScan, onError]);

    useEffect(() => {
        if (!videoRef.current) return;

        let mounted = true;

        const qrScanner = new QrScanner(
            videoRef.current,
            (result) => {
                if (onScanRef.current) {
                    onScanRef.current(result.data);

                    // Pause scanning temporarily to avoid duplicate scans
                    qrScanner.stop();
                    if (mounted) setIsPaused(true);

                    // Auto-restart after delay
                    setTimeout(() => {
                        if (mounted && qrScannerRef.current) {
                            qrScannerRef.current.start()
                                .then(() => {
                                    if (mounted) setIsPaused(false);
                                })
                                .catch(console.error);
                        }
                    }, scanDelay);
                }
            },
            {
                onDecodeError: (error) => {
                    // Don't show decode errors
                },
                highlightScanRegion: true,
                highlightCodeOutline: true,
            }
        );

        qrScannerRef.current = qrScanner;

        // Auto-start scanning
        qrScanner.start()
            .then(() => {
                if (mounted) setIsScanning(true);
            })
            .catch((err) => {
                if (mounted) {
                    const errorMessage = err instanceof Error ? err.message : "Failed to start camera";
                    setError(errorMessage);
                    onErrorRef.current?.(errorMessage);
                }
            });

        return () => {
            mounted = false;
            qrScanner.destroy();
        };
    }, [scanDelay]);

    const startScanning = async () => {
        if (!qrScannerRef.current) return;
        try {
            setError(null);
            await qrScannerRef.current.start();
            setIsScanning(true);
            setIsPaused(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to start camera";
            setError(errorMessage);
            onErrorRef.current?.(errorMessage);
        }
    };

    const stopScanning = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.stop();
            setIsScanning(false);
        }
    };

    const handleClose = () => {
        stopScanning();
        onClose?.();
    };

    const ScannerContent = (
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
            />
            {(!isScanning && !isPaused) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                    <div className="text-center">
                        <div className="text-4xl mb-2">📷</div>
                        <p>Starting Camera...</p>
                    </div>
                </div>
            )}
            {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                    <div className="text-white text-lg font-medium animate-pulse">
                        Processing...
                    </div>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-4">
                    <div className="text-center text-red-500">
                        <p className="mb-4">{error}</p>
                        <Button onClick={startScanning} variant="outline" className="text-white border-white hover:bg-white/20">
                            Retry Camera
                        </Button>
                    </div>
                </div>
            )}
            {/* Overlay Guidelines */}
            <div className="absolute inset-0 border-2 border-white/30 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/50 rounded-lg">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white"></div>
                </div>
            </div>
        </div>
    );

    if (variant === 'inline') {
        return (
            <div className="w-full max-w-md mx-auto aspect-[3/4] sm:aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                {ScannerContent}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm sm:max-w-md bg-card border-border relative overflow-hidden">
                <div className="flex justify-between items-center p-4 pb-2 absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent">
                    <h2 className="text-xl font-semibold text-white">Scan QR Code</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="text-white hover:bg-white/20"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <div className="w-full aspect-[3/4] bg-black">
                    {ScannerContent}
                </div>
            </Card>
        </div>
    );
}
