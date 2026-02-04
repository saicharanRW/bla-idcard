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
}

export function QRScanner({ onScan, onError, onClose }: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const qrScannerRef = useRef<QrScanner | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use refs for callbacks to prevent unnecessary scanner re-initialization
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
                if (onScanRef.current) onScanRef.current(result.data);
                qrScanner.stop();
                if (mounted) setIsScanning(false);
            },
            {
                onDecodeError: (error) => {
                    // Don't show decode errors as they're frequent during scanning
                    console.debug("QR decode error:", error);
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
            // We don't set isScanning(false) here because component might be unmounting
        };
    }, []); // Run once on mount

    const startScanning = async () => {
        if (!qrScannerRef.current) return;

        try {
            setError(null);
            await qrScannerRef.current.start();
            setIsScanning(true);
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

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm sm:max-w-md bg-card border-border">
                <div className="flex justify-between items-center p-4 pb-2">
                    <h2 className="text-xl font-semibold text-foreground">Scan QR Code</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="space-y-4 p-4 pt-2">
                    <div className="relative">
                        <video
                            ref={videoRef}
                            className="w-full h-[55vh] bg-muted rounded-lg object-cover"
                            playsInline
                        />
                        {!isScanning && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                                <div className="text-center">
                                    <div className="text-muted-foreground mb-2 text-4xl">📷</div>
                                    <p className="text-muted-foreground">Starting Camera...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                            <p className="text-destructive text-sm">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        {!isScanning ? (
                            <Button
                                onClick={startScanning}
                                disabled={!error}
                                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                            >
                                {error ? "Retry Camera" : "Starting..."}
                            </Button>
                        ) : (
                            <Button
                                onClick={stopScanning}
                                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium"
                            >
                                Stop Camera
                            </Button>
                        )}
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="border-border text-foreground hover:bg-secondary"
                        >
                            Cancel
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        <p>Position the QR code within the camera view</p>
                        <p className="mt-1">The code will be scanned automatically</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
