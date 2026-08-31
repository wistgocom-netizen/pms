'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/context/StoreContext';
import type { Product } from '@/lib/types';
import { Barcode, VideoOff, Loader2, Scan } from 'lucide-react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';
import { cn } from '@/lib/utils';

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan?: (product: Product) => void;
  onRawScan?: (code: string) => void;
}

export function BarcodeScannerDialog({ open, onOpenChange, onScan, onRawScan }: BarcodeScannerDialogProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { products, t } = useStore();
  const [manualBarcode, setManualBarcode] = useState('');
  const [focusRing, setFocusRing] = useState<{ x: number; y: number } | null>(null);
  
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const isProcessingRef = useRef(false);

  // Use refs for handlers to ensure the scanning loop always has access to the latest logic
  const handlersRef = useRef({ onScan, onRawScan, products });
  useEffect(() => {
    handlersRef.current = { onScan, onRawScan, products };
  }, [onScan, onRawScan, products]);

  const stopCamera = useCallback(() => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    isProcessingRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setFocusRing(null);
      setManualBarcode('');
      return;
    }

    let isMounted = true;
    setIsInitializing(true);
    isProcessingRef.current = false;

    // Configure hints for maximum reliability and comprehensive format support
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.QR_CODE,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.ITF,
        BarcodeFormat.DATA_MATRIX
    ]);
    
    const reader = new BrowserMultiFormatReader(hints);
    codeReader.current = reader;

    const startScanning = async () => {
      if (!isMounted) return;
      setHasCameraPermission(null);

      // Check for secure context (required for camera)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          console.warn("Camera access requires HTTPS or localhost.");
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) {
          setHasCameraPermission(false);
          setIsInitializing(false);
          toast({
            variant: 'destructive',
            title: t('Scanner Not Supported'),
            description: t('Your browser does not support camera access or requires HTTPS.'),
          });
        }
        return;
      }

      try {
        // Request higher resolution for better barcode detection
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            aspectRatio: { ideal: 1.7777777778 } // 16:9
          } 
        });

        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = async () => {
            if (!isMounted || !videoRef.current) return;
            
            try {
              await videoRef.current.play();
              if (isMounted) setIsInitializing(false);
              
              reader.decodeFromVideoElement(videoRef.current, (result, error) => {
                if (!isMounted || isProcessingRef.current) return;
                
                if (result) {
                  const scannedCode = result.getText().trim();
                  if (!scannedCode) return;

                  // Prevent rapid multiple triggers
                  isProcessingRef.current = true;
                  
                  // Immediately update UI to show the scanned code
                  setManualBarcode(scannedCode);

                  const { onRawScan: currentOnRawScan, onScan: currentOnScan, products: currentProducts } = handlersRef.current;

                  // Option A: Raw scan (e.g. for Add Product form)
                  if (currentOnRawScan) {
                    currentOnRawScan(scannedCode);
                    toast({ title: t('Barcode Scanned'), description: scannedCode });
                    // Close dialog after showing the result for a moment so user sees it in the input
                    setTimeout(() => { if (isMounted) onOpenChange(false); }, 1000);
                    return;
                  }

                  // Option B: Product lookup (e.g. for Checkout)
                  const product = (currentProducts || []).find(p => p.id === scannedCode);
                  if (product && currentOnScan) {
                    currentOnScan(product);
                    toast({
                        title: t('Product Scanned'),
                        description: `'${product.name}' ${t('has been added.')}`
                    });
                    setTimeout(() => { if (isMounted) onOpenChange(false); }, 1000);
                  } else {
                    toast({
                        variant: 'destructive',
                        title: t('Product Not Found'),
                        description: `${t('Barcode')}: ${scannedCode}`
                    });
                    // Reset processing after a delay to allow re-scanning if not found
                    setTimeout(() => { if (isMounted) isProcessingRef.current = false; }, 2000);
                  }
                }
              });
            } catch (playError) {
              console.error('Error starting video:', playError);
              if (isMounted) setIsInitializing(false);
            }
          };
        }
      } catch (err) {
        console.error('Camera access error:', err);
        if (isMounted) {
          setHasCameraPermission(false);
          setIsInitializing(false);
          toast({
            variant: 'destructive',
            title: t('Camera Access Denied'),
            description: t('Please enable camera permissions in your browser.'),
          });
        }
      }
    };

    // Brief delay to ensure dialog animation finishes
    const initTimer = setTimeout(startScanning, 400);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      stopCamera();
    };
  }, [open, onOpenChange, toast, t, stopCamera]);

  const handleTouchToFocus = async (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!videoRef.current || !videoRef.current.srcObject) return;

    const rect = e.currentTarget.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
        return;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setFocusRing({ x, y });
    setTimeout(() => setFocusRing(null), 1200);

    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      
      if (track && 'applyConstraints' in track) {
        const capabilities = (track as any).getCapabilities?.() || {};
        if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
          await (track as any).applyConstraints({
            advanced: [{ focusMode: 'continuous' }]
          });
        }
      }
    } catch (err) {
      console.warn('Manual focus error:', err);
    }
  };

  const handleManualAdd = () => {
      const trimmedCode = manualBarcode.trim();
      if (!trimmedCode) return;

      if (onRawScan) {
          onRawScan(trimmedCode);
          onOpenChange(false);
          return;
      }

      const product = (products || []).find(p => p.id === trimmedCode);
      if (product && onScan) {
          onScan(product);
          toast({ title: t('Product Added'), description: product.name });
          onOpenChange(false);
      } else {
          toast({ variant: 'destructive', title: t('Product Not Found'), description: trimmedCode });
      }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Scan Barcode')}</DialogTitle>
          <DialogDescription>
            {t('Point camera at barcode.')} {hasCameraPermission && t('Tap to focus.')}
          </DialogDescription>
        </DialogHeader>
        <div 
            className="relative aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center text-muted-foreground cursor-crosshair touch-none"
            onClick={handleTouchToFocus}
            onTouchStart={handleTouchToFocus}
        >
            {(hasCameraPermission === null || isInitializing) && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="animate-pulse text-sm">{t('Initializing camera...')}</p>
              </div>
            )}
            
            <video 
              ref={videoRef} 
              className={cn("w-full h-full object-cover", (hasCameraPermission && !isInitializing) ? 'block' : 'hidden')} 
              autoPlay 
              playsInline 
              muted 
            />
            
            {hasCameraPermission === true && !isInitializing && (
                <>
                    <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
                    {/* Scanning guide line */}
                    <div className="absolute w-full h-full pointer-events-none flex items-center justify-center">
                        <div className="w-3/4 h-0.5 bg-red-500/50 shadow-[0_0_10px_theme(colors.red.500)] animate-pulse" />
                    </div>
                    
                    {/* Scanner overlay corners */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/50" />
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/50" />
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/50" />
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/50" />
                    </div>
                    
                    {focusRing && (
                        <div 
                            className="absolute pointer-events-none flex items-center justify-center"
                            style={{ 
                                left: `${focusRing.x}px`, 
                                top: `${focusRing.y}px`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <div className="w-16 h-16 border-2 border-yellow-400 rounded-md animate-ping duration-700 opacity-70" />
                            <div className="absolute w-12 h-12 border border-yellow-400/50 rounded-md" />
                        </div>
                    )}
                </>
            )}

            {hasCameraPermission === false && (
                <div className="flex flex-col items-center gap-2">
                    <VideoOff className="w-12 h-12" />
                    <p>{t('Camera not available')}</p>
                </div>
            )}
        </div>
        
        {hasCameraPermission === false && (
            <Alert variant="destructive">
                <Barcode className="h-4 w-4" />
                <AlertTitle>{t('Camera Access Required')}</AlertTitle>
                <AlertDescription>
                    {t('Please allow camera access in browser settings.')}
                </AlertDescription>
            </Alert>
        )}

        <div className="mt-4">
            <p className="text-sm text-muted-foreground text-center mb-2">{t('Or enter barcode manually')}</p>
            <div className="flex w-full items-center space-x-2">
                <Input 
                    type="text" 
                    placeholder={t('Enter barcode...')} 
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                />
                <Button type="button" onClick={handleManualAdd}>{t('Add')}</Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
