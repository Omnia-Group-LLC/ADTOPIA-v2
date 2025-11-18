import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GalleryImage } from '@/components/GalleryImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, X } from 'lucide-react';
import { useSignedUrl, ImageSize } from '@/hooks/useSignedUrl';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface GalleryLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  bucket: string;
  imagePath: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  onDownload?: () => void;
  onShare?: () => void;
}

export function GalleryLightbox({
  isOpen,
  onClose,
  bucket,
  imagePath,
  title,
  description,
  category,
  tags = [],
  metadata,
  onDownload,
  onShare,
}: GalleryLightboxProps) {
  const [activeSize, setActiveSize] = useState<ImageSize>('full');
  const { toast } = useToast();
  
  // Get signed URL for download
  const { url: downloadUrl } = useSignedUrl({
    bucket,
    path: imagePath,
    size: activeSize,
  });

  const handleDownload = async () => {
    if (!downloadUrl) {
      toast({
        title: 'Download Failed',
        description: 'Unable to generate download URL',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Fetch the image
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const filename = title 
        ? `${title.toLowerCase().replace(/\s+/g, '-')}-${activeSize}.webp`
        : `image-${activeSize}.webp`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Download Started',
        description: `Downloading ${activeSize} version...`,
      });

      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title || 'Gallery Image'}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Image viewer */}
          <div className="relative rounded-lg overflow-hidden bg-muted">
            <GalleryImage
              bucket={bucket}
              path={imagePath}
              size={activeSize}
              alt={title || 'Gallery image'}
              priority
              containerClassName="min-h-[400px]"
            />
          </div>

          {/* Size selector */}
          <div className="flex gap-2 justify-center flex-wrap">
            {(['thumbnail', 'medium', 'full', 'original'] as const).map((size) => (
              <Button
                key={size}
                variant={activeSize === size ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSize(size)}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </Button>
            ))}
          </div>

          {/* Metadata */}
          <div className="space-y-3 pt-4 border-t">
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {(category || tags.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {category && (
                  <Badge variant="secondary">{category}</Badge>
                )}
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
            {metadata && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="font-medium capitalize">{key}:</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleDownload} variant="default" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download {activeSize}
            </Button>
            {onShare && (
              <Button onClick={onShare} variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

