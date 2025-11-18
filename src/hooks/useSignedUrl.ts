import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ImageSize = 'thumbnail' | 'medium' | 'full' | 'original';

interface UseSignedUrlOptions {
  bucket: string;
  path: string;
  size?: ImageSize;
  enabled?: boolean;
}

export function useSignedUrl({ bucket, path, size = 'medium', enabled = true }: UseSignedUrlOptions) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (!enabled || !path) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const getSignedUrl = async () => {
      try {
        // Try to get optimized version first
        if (size !== 'original') {
          const optimizedPath = path.replace(/\.(jpg|jpeg|png|gif)$/i, `-${size}.webp`);
          const optimizedFullPath = optimizedPath.includes('optimized/') 
            ? optimizedPath 
            : path.replace(/([^/]+)$/, 'optimized/$1').replace(/\.(jpg|jpeg|png|gif)$/i, `-${size}.webp`);

          const { data: optimizedData } = await supabase.storage
            .from(bucket)
            .createSignedUrl(optimizedFullPath, 3600);

          if (optimizedData?.signedUrl) {
            setUrl(optimizedData.signedUrl);
            setIsFallback(false);
            setIsLoading(false);
            return;
          }
        }

        // Fallback to original
        const { data, error: urlError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 3600);

        if (urlError) throw urlError;

        if (data?.signedUrl) {
          setUrl(data.signedUrl);
          setIsFallback(size !== 'original');
          setIsLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get signed URL'));
        setIsLoading(false);
        setIsFallback(true);
      }
    };

    getSignedUrl();
  }, [bucket, path, size, enabled]);

  return { url, isLoading, error, isFallback };
}

