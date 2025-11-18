import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useQRCodeGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = async (adCardId: string, url: string): Promise<string | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: { adCardId, url },
      });

      if (error) throw error;
      return data?.qrCodeUrl || null;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateQRCode, isGenerating };
}

