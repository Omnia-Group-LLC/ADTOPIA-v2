import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@modules/ui';
import { Card, CardContent } from '@modules/ui/components/card';
import { QRModal } from './QRModal';

/**
 * GalleryItemCard Component
 * 
 * Displays a gallery item card with Share button functionality.
 * Share button opens QRModal with gallery URL for sharing.
 * 
 * @param gallery - Gallery item data
 * @param onCardClick - Optional click handler for card
 */
export interface GalleryItem {
  id: string;
  title?: string;
  description?: string;
  url: string;
  image_url?: string;
}

interface GalleryItemCardProps {
  gallery: GalleryItem;
  onCardClick?: () => void;
}

export function GalleryItemCard({ gallery, onCardClick }: GalleryItemCardProps) {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  /**
   * Handle Share button click
   * Opens QRModal with gallery URL
   */
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQRModalOpen(true);
  };

  /**
   * Generate gallery URL for QR code
   */
  const galleryUrl = `${window.location.origin}/gallery/${gallery.id}`;

  return (
    <>
      <Card
        className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
        onClick={onCardClick}
        data-testid="gallery-item-card"
      >
        <div className="aspect-[2/3] relative overflow-hidden">
          <img
            src={gallery.image_url || gallery.url || '/placeholder.svg'}
            alt={gallery.title || gallery.description || 'Gallery item'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            data-testid="gallery-thumb"
          />
          
          {/* Share Link Button - Glassy style with indigo glow */}
          <Button
            data-testid="share-button"
            onClick={handleShare}
            className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all z-10 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:border-indigo-400 border border-transparent"
            size="sm"
            variant="ghost"
            aria-label="Share Link"
          >
            <Share2 className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
          </Button>
        </div>
        
        <CardContent className="p-4">
          {gallery.title && (
            <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
              {gallery.title}
            </h3>
          )}
          {gallery.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {gallery.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* QR Modal */}
      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        url={galleryUrl}
        title={gallery.title || 'Gallery Item'}
      />
    </>
  );
}

