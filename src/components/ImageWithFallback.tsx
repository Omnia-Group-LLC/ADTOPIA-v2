import { useState, useEffect, useRef } from 'react';
import { ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onImageClick?: () => void;
  lazy?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  srcSet?: string;
  sizes?: string;
  priority?: boolean;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.svg',
  onImageClick,
  lazy = true,
  aspectRatio = 'auto',
  srcSet,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
}: ImageWithFallbackProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(src || fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Load images 100px before they come into view
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, priority]);

  useEffect(() => {
    setImageSrc(src || fallbackSrc);
    setHasError(false);
    setIsLoading(true);
  }, [src, fallbackSrc]);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectRatioClasses[aspectRatio],
        className,
        onImageClick && 'cursor-pointer group'
      )}
      onClick={onImageClick}
    >
      {isLoading && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="absolute inset-0" />
          <ImageIcon className="h-8 w-8 text-muted-foreground animate-pulse" />
        </div>
      )}

      {!isInView && lazy ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      ) : (
        <>
          <img
            src={imageSrc || fallbackSrc}
            alt={alt}
            srcSet={srcSet}
            sizes={sizes}
            loading={lazy && !priority ? 'lazy' : 'eager'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : 'auto'}
            onError={handleError}
            onLoad={handleLoad}
            className={cn(
              'w-full h-full object-cover transition-all duration-300',
              isLoading && 'opacity-0',
              !isLoading && 'opacity-100',
              onImageClick && 'group-hover:scale-105'
            )}
          />

          {hasError && imageSrc === fallbackSrc && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Failed to load image</p>
            </div>
          )}

          {onImageClick && !isLoading && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/90 px-3 py-1 rounded-full text-primary-foreground text-sm font-medium">
                Click to enlarge
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

