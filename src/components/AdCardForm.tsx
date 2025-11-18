import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/AuthProvider';
import { AdCard, AdCategory, AdStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useQRCodeGenerator } from '@/hooks/useQRCodeGenerator';
import { useFileUpload } from '@/hooks/useFileUpload';
import { FileUploader } from '@/components/FileUploader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const adCardSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().trim().max(500, 'Description must be less than 500 characters'),
  custom_url: z.string().trim().url('Must be a valid URL').max(500, 'URL must be less than 500 characters').optional().or(z.literal('')),
  template_id: z.string().optional(),
  category: z.enum(['Real Estate', 'Services', 'Products', 'Jobs', 'Automotive', 'Other']),
  status: z.enum(['draft', 'published', 'archived']),
});

type AdCardFormValues = z.infer<typeof adCardSchema>;

interface AdCardFormProps {
  open: boolean;
  onClose: () => void;
  editingCard?: AdCard | null;
}

export function AdCardForm({ open, onClose, editingCard }: AdCardFormProps) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { generateQRCode, isGenerating } = useQRCodeGenerator();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { uploadFile, uploadProgress, isUploading } = useFileUpload({
    bucketName: 'ad-images',
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  });

  const form = useForm<AdCardFormValues>({
    resolver: zodResolver(adCardSchema),
    defaultValues: {
      title: '',
      description: '',
      custom_url: '',
      template_id: '',
      category: 'Other',
      status: 'draft',
    },
  });

  useEffect(() => {
    if (editingCard) {
      form.reset({
        title: editingCard.title,
        description: editingCard.description,
        custom_url: editingCard.custom_url || '',
        template_id: editingCard.template_id || '',
        category: editingCard.metadata?.category || 'Other',
        status: editingCard.status as AdStatus,
      });
      setImagePreview(editingCard.image_url || editingCard.qr_code_url || null);
    } else {
      setImagePreview(null);
      setSelectedFile(null);
    }
  }, [editingCard, form]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlInput = (url: string) => {
    setImagePreview(url);
    setSelectedFile(null);
  };

  const handleClearPreview = () => {
    setImagePreview(null);
    setSelectedFile(null);
  };

  const onSubmit = async (values: AdCardFormValues) => {
    if (!user) return;

    setLoading(true);

    try {
      let adCardId = editingCard?.id;
      let qrCodeUrl = editingCard?.qr_code_url || null;
      let imageUrl = editingCard?.image_url || null;

      // Upload image if a file was selected
      if (selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile, user.id);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      } else if (imagePreview && imagePreview !== editingCard?.image_url && imagePreview !== editingCard?.qr_code_url) {
        // URL was entered manually
        imageUrl = imagePreview;
      }

      // Create or update the ad card first
      const basePayload: any = {
        title: values.title,
        description: values.description,
        custom_url: values.custom_url || null,
        template_id: values.template_id || null,
        status: values.status,
        user_id: user.id,
        ai_generated: false,
        image_url: imageUrl,
        metadata: {
          category: values.category,
        },
        updated_at: new Date().toISOString(),
      };

      if (editingCard) {
        // Update existing card
        const { error } = await supabase
          .from('ad_cards')
          .update(basePayload)
          .eq('id', editingCard.id);

        if (error) throw error;
      } else {
        // Insert new card and get the ID
        const { data, error } = await supabase
          .from('ad_cards')
          .insert([basePayload])
          .select()
          .single();

        if (error) throw error;
        adCardId = data.id;
      }

      // Generate QR code if custom_url is provided and status is published
      if (values.custom_url && values.status === 'published' && adCardId) {
        qrCodeUrl = await generateQRCode(adCardId, values.custom_url);
        
        // Update the ad card with the QR code URL if generation was successful
        if (qrCodeUrl) {
          const { error: qrUpdateError } = await supabase
            .from('ad_cards')
            .update({ qr_code_url: qrCodeUrl })
            .eq('id', adCardId);

          if (qrUpdateError) {
            console.error('Error updating QR code URL:', qrUpdateError);
            // Don't throw - the card was created successfully, just log the QR error
          }
        }
      }

      toast({
        title: 'Success',
        description: editingCard 
          ? 'Ad card updated successfully' 
          : 'Ad card created successfully',
      });

      form.reset();
      onClose();
    } catch (error: any) {
      console.error('Error saving ad card:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save ad card',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCard ? 'Edit Ad Card' : 'Create Ad Card'}</DialogTitle>
          <DialogDescription>
            Fill in the details to {editingCard ? 'update' : 'create'} your ad card
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ad card title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom URL</FormLabel>
                  <FormControl>
                    <Input 
                      type="url"
                      placeholder="https://example.com/your-ad" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a URL to generate a QR code (required for published ads)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Ad Image</FormLabel>
              <FormControl>
                <FileUploader
                  onFileSelect={handleFileSelect}
                  onUrlInput={handleUrlInput}
                  preview={imagePreview}
                  onClearPreview={handleClearPreview}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress.progress}
                  accept="image/*"
                  maxSizeMB={5}
                  allowUrlInput={true}
                />
              </FormControl>
              <FormDescription>
                Upload an image for your ad or enter an image URL
              </FormDescription>
              <FormMessage />
            </FormItem>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Services">Services</SelectItem>
                        <SelectItem value="Products">Products</SelectItem>
                        <SelectItem value="Jobs">Jobs</SelectItem>
                        <SelectItem value="Automotive">Automotive</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || isGenerating || isUploading}>
                {isUploading
                  ? 'Uploading...'
                  : loading || isGenerating 
                    ? (isGenerating ? 'Generating QR...' : 'Saving...') 
                    : editingCard ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

