import { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  title?: string;
  description?: string;
}

export function Lightbox({
  isOpen,
  onClose,
  imageSrc,
  imageAlt,
  title,
  description,
}: LightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, zoom]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${imageAlt.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex-1 text-white">
            {title && <h3 className="font-semibold text-lg">{title}</h3>}
            {description && (
              <p className="text-sm text-white/70">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Image Container */}
        <div
          className="flex items-center justify-center h-[90vh] overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className={cn(
              'max-w-full max-h-full object-contain transition-transform duration-200',
              isDragging && 'cursor-grabbing'
            )}
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            }}
            draggable={false}
          />
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-2 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-white text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-white/20 mx-2" />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

