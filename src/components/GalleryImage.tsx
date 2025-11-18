import { useState } from 'react';
import { useSignedUrl, ImageSize } from '@/hooks/useSignedUrl';
import { cn } from '@/lib/utils';

interface GalleryImageProps {
  bucket: string;
  path: string;
  size?: ImageSize;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  fallbackSrc?: string;
}

export function GalleryImage({
  bucket,
  path,
  size = 'medium',
  alt,
  className,
  containerClassName,
  priority = false,
  onLoad,
  onError,
  fallbackSrc = '/placeholder.svg',
}: GalleryImageProps) {
  const [imgError, setImgError] = useState(false);

  const { url, isLoading, error, isFallback } = useSignedUrl({
    bucket,
    path,
    size,
    enabled: !imgError,
  });

  const handleError = () => {
    setImgError(true);
    if (error && onError) {
      onError(error);
    }
  };

  const handleLoad = () => {
    if (onLoad) {
      onLoad();
    }
  };

  if (isLoading) {
    return (
      <div className={cn('animate-pulse bg-muted rounded-lg', containerClassName)}>
        <div className="w-full h-full" />
      </div>
    );
  }

  const displayUrl = imgError ? fallbackSrc : (url || fallbackSrc);

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      <img
        src={displayUrl}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100',
          className
        )}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
      />
      {isFallback && (
        <div className="absolute bottom-0 left-0 right-0 bg-muted/80 text-muted-foreground text-xs px-2 py-1">
          Original
        </div>
      )}
    </div>
  );
}

