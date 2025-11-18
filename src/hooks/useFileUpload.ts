import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseFileUploadOptions {
  bucketName: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export function useFileUpload({ bucketName, maxSizeMB = 5, allowedTypes }: UseFileUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ progress: 0 });

  const uploadFile = async (file: File, userId: string): Promise<string | null> => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    setIsUploading(true);
    setUploadProgress({ progress: 0 });

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      // Trigger image optimization
      try {
        await supabase.functions.invoke('optimize-image', {
          body: { bucket: bucketName, filePath: data.path, userId },
        });
      } catch (optError) {
        console.warn('Image optimization failed:', optError);
      }

      setUploadProgress({ progress: 100 });
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, uploadProgress };
}

