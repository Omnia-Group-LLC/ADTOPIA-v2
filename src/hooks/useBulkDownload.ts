import { useState } from 'react';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ImageSize } from '@/hooks/useSignedUrl';

interface BulkDownloadOptions {
  images: Array<{
    bucket: string;
    path: string;
    title?: string;
  }>;
  size?: ImageSize;
  zipName?: string;
}

export function useBulkDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  const downloadAsZip = async ({ images, size = 'medium', zipName = 'gallery' }: BulkDownloadOptions) => {
    if (images.length === 0) {
      toast({
        title: 'No Images',
        description: 'No images to download',
        variant: 'destructive',
      });
      return;
    }

    setIsDownloading(true);
    setProgress({ current: 0, total: images.length });

    try {
      const zip = new JSZip();
      const folder = zip.folder('images');

      if (!folder) {
        throw new Error('Failed to create ZIP folder');
      }

      toast({
        title: 'Preparing Download',
        description: `Fetching ${images.length} images...`,
      });

      // Fetch all images
      const downloadPromises = images.map(async (image, index) => {
        try {
          // Get signed URL
          const { data, error } = await supabase.functions.invoke('signed-url', {
            body: {
              bucket: image.bucket,
              path: image.path,
              size,
              expiresIn: 3600,
            },
          });

          if (error || !data?.url) {
            console.error(`Failed to get URL for ${image.path}:`, error);
            return null;
          }

          // Fetch the image
          const response = await fetch(data.url);
          const blob = await response.blob();

          // Generate filename
          const filename = image.title
            ? `${image.title.toLowerCase().replace(/\s+/g, '-')}-${index + 1}.webp`
            : `image-${index + 1}.webp`;

          folder.file(filename, blob);
          
          // Update progress
          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
          
          return filename;
        } catch (error) {
          console.error(`Error downloading ${image.path}:`, error);
          return null;
        }
      });

      const results = await Promise.all(downloadPromises);
      const successCount = results.filter(Boolean).length;

      if (successCount === 0) {
        throw new Error('Failed to download any images');
      }

      toast({
        title: 'Creating ZIP',
        description: `Successfully fetched ${successCount} of ${images.length} images...`,
      });

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Create download link
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${zipName}-${size}.zip`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download Complete',
        description: `Downloaded ${successCount} images as ${zipName}-${size}.zip`,
      });
    } catch (error) {
      console.error('Bulk download error:', error);
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Failed to create ZIP file',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return {
    downloadAsZip,
    isDownloading,
    progress,
  };
}

