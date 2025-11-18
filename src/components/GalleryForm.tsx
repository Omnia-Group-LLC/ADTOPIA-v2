import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/AuthProvider';
import { GalleryContainer } from '@/types';
import { useToast } from '@/hooks/use-toast';
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
import { Switch } from '@/components/ui/switch';

const gallerySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  is_public: z.boolean(),
  requires_passcode: z.boolean(),
  passcode: z.string().optional(),
});

type GalleryFormValues = z.infer<typeof gallerySchema>;

interface GalleryFormProps {
  open: boolean;
  onClose: () => void;
  editingGallery?: GalleryContainer | null;
}

export function GalleryForm({ open, onClose, editingGallery }: GalleryFormProps) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { uploadFile, uploadProgress, isUploading } = useFileUpload({
    bucketName: 'gallery-thumbnails',
    maxSizeMB: 5,
  });

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      name: '',
      description: '',
      is_public: false,
      requires_passcode: false,
      passcode: '',
    },
  });

  const requiresPasscode = form.watch('requires_passcode');

  useEffect(() => {
    if (editingGallery) {
      form.reset({
        name: editingGallery.name,
        description: editingGallery.description || '',
        is_public: editingGallery.is_public,
        requires_passcode: !!editingGallery.access_code,
        passcode: '',
      });
      setThumbnailPreview(editingGallery.metadata?.thumbnail_url || null);
    } else {
      setThumbnailPreview(null);
      setSelectedFile(null);
    }
  }, [editingGallery, form]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlInput = (url: string) => {
    setThumbnailPreview(url);
    setSelectedFile(null);
  };

  const handleClearPreview = () => {
    setThumbnailPreview(null);
    setSelectedFile(null);
  };

  const onSubmit = async (values: GalleryFormValues) => {
    if (!user) return;

    if (values.requires_passcode && !values.passcode && !editingGallery) {
      toast({
        title: 'Error',
        description: 'Passcode is required when passcode protection is enabled',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      let thumbnailUrl = editingGallery?.metadata?.thumbnail_url || null;

      // Upload thumbnail if a file was selected
      if (selectedFile && user) {
        const uploadedUrl = await uploadFile(selectedFile, user.id);
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl;
        }
      } else if (thumbnailPreview && thumbnailPreview !== editingGallery?.metadata?.thumbnail_url) {
        // URL was entered manually
        thumbnailUrl = thumbnailPreview;
      }

      const payload: any = {
        name: values.name,
        description: values.description,
        is_public: values.is_public,
        user_id: user.id,
        card_ids: editingGallery?.card_ids || [],
        display_order: editingGallery?.display_order || [],
        metadata: {
          ...editingGallery?.metadata,
          thumbnail_url: thumbnailUrl,
        },
        updated_at: new Date().toISOString(),
      };

      if (values.passcode && values.requires_passcode) {
        payload.access_code = values.passcode;
      } else if (!values.requires_passcode) {
        payload.access_code = null;
      }

      if (editingGallery) {
        const { error } = await supabase
          .from('gallery_containers')
          .update(payload)
          .eq('id', editingGallery.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Gallery updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('gallery_containers')
          .insert([payload]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Gallery created successfully',
        });
      }

      form.reset();
      onClose();
    } catch (error: any) {
      console.error('Error saving gallery:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save gallery',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editingGallery ? 'Edit Gallery' : 'Create Gallery'}</DialogTitle>
          <DialogDescription>
            Organize your ad cards into a gallery collection
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter gallery name" {...field} />
                  </FormControl>
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
                    <Textarea placeholder="Brief description of this gallery" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Gallery Thumbnail</FormLabel>
              <FormControl>
                <FileUploader
                  onFileSelect={handleFileSelect}
                  onUrlInput={handleUrlInput}
                  preview={thumbnailPreview}
                  onClearPreview={handleClearPreview}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress.progress}
                  accept="image/*"
                  maxSizeMB={5}
                  allowUrlInput={true}
                />
              </FormControl>
              <FormDescription>
                Upload a cover image for this gallery
              </FormDescription>
              <FormMessage />
            </FormItem>
            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Public Gallery</FormLabel>
                    <FormDescription>
                      Make this gallery visible to everyone
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requires_passcode"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Passcode Protection</FormLabel>
                    <FormDescription>
                      Require a passcode to view this gallery
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            {requiresPasscode && (
              <FormField
                control={form.control}
                name="passcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passcode</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter passcode" {...field} />
                    </FormControl>
                    <FormDescription>
                      {editingGallery ? 'Leave blank to keep existing passcode' : 'Required for passcode protection'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingGallery ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

