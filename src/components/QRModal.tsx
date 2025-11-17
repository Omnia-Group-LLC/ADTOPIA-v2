import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@modules/ui';
import { Button } from '@modules/ui';
import { Download, Copy, CheckCircle2, QrCode as QrCodeIcon } from 'lucide-react';
import { useToast } from '@modules/ui/components/use-toast';
import { generateQRCode } from '../lib/qr-codes';
import { Spinner } from '@modules/ui/components/Spinner';

/**
 * QRModal Component
 * 
 * Displays a modal with QR code for sharing gallery items.
 * Generates QR code PNG and allows download.
 * 
 * @param isOpen - Whether modal is open
 * @param onClose - Close handler
 * @param url - URL to encode in QR code
 * @param title - Title for the QR code
 */
interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

export function QRModal({ isOpen, onClose, url, title }: QRModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  /**
   * Generate QR code when modal opens
   */
  useEffect(() => {
    if (isOpen && url) {
      generateQR();
    } else {
      // Reset state when closing
      setQrCodeUrl(null);
      setIsLoading(false);
      setCopied(false);
    }
  }, [isOpen, url]);

  const generateQR = async () => {
    if (!url) return;
    
    setIsLoading(true);
    try {
      // Generate QR code
      const qrDataUrl = await generateQRCode(url);
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('QR generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle QR code download
   */
  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-${title?.replace(/\s+/g, '-').toLowerCase() || 'gallery'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'QR Code Downloaded',
      description: 'Your QR code has been saved successfully.',
    });
  };

  /**
   * Handle URL copy to clipboard
   */
  const handleCopyUrl = async () => {
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: 'Link Copied',
        description: 'URL copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <QrCodeIcon className="h-5 w-5 text-primary" />
            <DialogTitle>Share Gallery Item</DialogTitle>
          </div>
          <DialogDescription>
            Share this gallery item with a scannable QR code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code Display */}
          <div className="flex flex-col items-center justify-center p-6 bg-background rounded-lg border border-border">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Spinner size="lg" />
                <p className="text-sm text-muted-foreground">Generating QR code...</p>
              </div>
            ) : qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-48 h-48 border-4 border-background rounded-lg shadow-lg"
                data-testid="qr-code-image"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <QrCodeIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Failed to generate QR code</p>
              </div>
            )}
          </div>

          {/* Preview URL */}
          {url && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Share Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-muted rounded-md truncate"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyUrl}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleDownloadQR}
              disabled={!qrCodeUrl || isLoading}
              className="flex-1"
              data-testid="download-qr"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

