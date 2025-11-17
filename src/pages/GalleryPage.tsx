import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GalleryItemCard, type GalleryItem } from '../components/GalleryItemCard';
import { supabase } from '@modules/api/supabase/client';
import { Spinner } from '@modules/ui/components/Spinner';

/**
 * GalleryPage Component
 * 
 * Displays a gallery of items, either public or specific gallery container.
 * Shows "Test Public Gallery" with seeded images.
 */
export function GalleryPage() {
  const { id } = useParams<{ id?: string }>();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryName, setGalleryName] = useState<string>('Public Gallery');

  useEffect(() => {
    loadGalleryItems();
  }, [id]);

  /**
   * Load gallery items from Supabase
   */
  const loadGalleryItems = async () => {
    try {
      setIsLoading(true);

      // If no ID, load public gallery (Test Public Gallery)
      if (!id || id === 'public') {
        // Get Test Public Gallery container
        const { data: container } = await supabase
          .from('gallery_containers')
          .select('id, name')
          .eq('name', 'Test Public Gallery')
          .single();

        if (container) {
          setGalleryName(container.name);
          
          // Get gallery images
          const { data: images } = await supabase
            .from('gallery_images')
            .select('id, url, title, description')
            .eq('gallery_container_id', container.id)
            .eq('visible', true)
            .order('created_at', { ascending: true });

          if (images) {
            setGalleryItems(images.map(img => ({
              id: img.id,
              title: img.title || undefined,
              description: img.description || undefined,
              url: img.url,
              image_url: img.url,
            })));
          }
        }
      } else {
        // Load specific gallery by ID
        const { data: images } = await supabase
          .from('gallery_images')
          .select('id, url, title, description')
          .eq('gallery_container_id', id)
          .eq('visible', true)
          .order('created_at', { ascending: true });

        if (images) {
          setGalleryItems(images.map(img => ({
            id: img.id,
            title: img.title || undefined,
            description: img.description || undefined,
            url: img.url,
            image_url: img.url,
          })));
        }
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8" data-testid="test-gallery">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {galleryName}
          </h1>
          <p className="text-muted-foreground">
            Browse our collection of gallery items
          </p>
        </div>

        {/* Gallery Grid */}
        {galleryItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryItems.map((item) => (
              <GalleryItemCard
                key={item.id}
                gallery={item}
                onCardClick={() => {
                  // Handle card click if needed
                  console.log('Card clicked:', item.id);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No items in this gallery yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

