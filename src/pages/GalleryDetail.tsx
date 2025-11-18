import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Plus } from 'lucide-react';
import { supabase } from '@modules/api/supabase/client';
import { useAuth } from '@modules/auth';
import { Button } from '@modules/ui';
import { Card, CardContent } from '@modules/ui/components/card';
import { useToast } from '@modules/ui/components/use-toast';
import { Spinner } from '@modules/ui/components/Spinner';
import { GalleryItemCard, type GalleryItem } from '../components/GalleryItemCard';

/**
 * Gallery ID parameter validation schema
 */
const galleryIdSchema = z.string().uuid('Invalid gallery ID format');

/**
 * Gallery Container with Cards
 */
interface GalleryContainer {
  id: string;
  name: string;
  user_id: string | null;
  created_at: string;
}

/**
 * Gallery Card with metadata
 */
interface GalleryCard extends GalleryItem {
  position?: number;
  created_at?: string;
}

/**
 * Sortable Gallery Card Component
 * Wraps GalleryItemCard with drag-and-drop functionality
 */
interface SortableGalleryCardProps {
  card: GalleryCard;
  isOwner: boolean;
  onDelete: (cardId: string) => void;
}

function SortableGalleryCard({ card, isOwner, onDelete }: SortableGalleryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="relative group">
        <GalleryItemCard
          gallery={card}
          onCardClick={() => {
            // Navigate to card detail if needed
            console.log('Card clicked:', card.id);
          }}
        />
        {isOwner && (
          <Button
            data-testid={`delete-card-${card.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            className="absolute top-2 left-2 p-2 rounded-full bg-destructive/80 backdrop-blur-sm hover:bg-destructive transition-all z-10 opacity-0 group-hover:opacity-100"
            size="sm"
            variant="destructive"
            aria-label="Delete Card"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * GalleryDetail Page Component
 * 
 * Displays a gallery by ID with:
 * - Cards grid with lazy-loaded thumbnails
 * - Owner/admin delete and reorder functionality
 * - Drag-and-drop reordering using dnd-kit
 * - "No cards? Create Ad" CTA
 * 
 * @route /gallery/:id
 */
export function GalleryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [gallery, setGallery] = useState<GalleryContainer | null>(null);
  const [cards, setCards] = useState<GalleryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);

  // Validate gallery ID
  useEffect(() => {
    if (!id) {
      toast({
        title: 'Invalid Gallery',
        description: 'Gallery ID is required',
        variant: 'destructive',
      });
      navigate('/gallery');
      return;
    }

    try {
      galleryIdSchema.parse(id);
    } catch (error) {
      toast({
        title: 'Invalid Gallery ID',
        description: 'The gallery ID format is invalid',
        variant: 'destructive',
      });
      navigate('/gallery');
    }
  }, [id, navigate, toast]);

  // Check if current user is owner/admin
  const isOwner = gallery && user && (
    gallery.user_id === user.id || 
    role === 'admin' || 
    role === 'super_admin'
  );

  // Load gallery and cards
  useEffect(() => {
    if (!id) return;
    loadGallery();
  }, [id, user, loadGallery]);

  /**
   * Load gallery container and its cards
   */
  const loadGallery = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      // Fetch gallery container
      const { data: container, error: containerError } = await supabase
        .from('gallery_containers')
        .select('id, name, user_id, created_at')
        .eq('id', id)
        .single();

      if (containerError) {
        throw new Error(`Failed to load gallery: ${containerError.message}`);
      }

      if (!container) {
        toast({
          title: 'Gallery Not Found',
          description: 'The requested gallery does not exist',
          variant: 'destructive',
        });
        navigate('/gallery');
        return;
      }

      setGallery(container);

      // Fetch gallery images/cards
      const { data: images, error: imagesError } = await supabase
        .from('gallery_images')
        .select('id, url, title, description, position, created_at')
        .eq('gallery_container_id', id)
        .eq('visible', true)
        .order('position', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      if (imagesError) {
        console.error('Error loading cards:', imagesError);
        toast({
          title: 'Error Loading Cards',
          description: imagesError.message,
          variant: 'destructive',
        });
        return;
      }

      const galleryCards: GalleryCard[] = (images || []).map((img, index) => ({
        id: img.id,
        title: img.title || undefined,
        description: img.description || undefined,
        url: img.url,
        image_url: img.url,
        position: img.position ?? index,
        created_at: img.created_at,
      }));

      setCards(galleryCards);
    } catch (error) {
      console.error('Error loading gallery:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load gallery',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  /**
   * Handle card deletion
   */
  const handleDeleteCard = async (cardId: string) => {
    if (!isOwner || !id) return;

    // Show confirmation dialog
    if (!confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      // Delete card (soft delete by setting visible = false)
      const { error } = await supabase
        .from('gallery_images')
        .update({ visible: false })
        .eq('id', cardId)
        .eq('gallery_container_id', id);

      if (error) {
        throw error;
      }

      // Remove from local state
      setCards((prev) => prev.filter((card) => card.id !== cardId));

      toast({
        title: 'Card Deleted',
        description: 'The card has been removed from the gallery',
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete card',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle card reordering via drag-and-drop
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    if (!isOwner || !id) return;

    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = cards.findIndex((c) => c.id === active.id);
    const newIndex = cards.findIndex((c) => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic update
    const newCards = arrayMove(cards, oldIndex, newIndex);
    setCards(newCards);
    setIsReordering(true);

    try {
      // Update positions in database
      const updates = newCards.map((card, index) => ({
        id: card.id,
        position: index,
      }));

      // Batch update positions
      for (const update of updates) {
        const { error } = await supabase
          .from('gallery_images')
          .update({ position: update.position })
          .eq('id', update.id)
          .eq('gallery_container_id', id);

        if (error) {
          throw error;
        }
      }

      toast({
        title: 'Cards Reordered',
        description: 'The gallery order has been updated',
      });
    } catch (error) {
      console.error('Error reordering cards:', error);
      // Revert optimistic update
      setCards(cards);
      toast({
        title: 'Reorder Failed',
        description: error instanceof Error ? error.message : 'Failed to reorder cards',
        variant: 'destructive',
      });
    } finally {
      setIsReordering(false);
    }
  };

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  if (!gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Gallery Not Found</h1>
          <Button onClick={() => navigate('/gallery')}>Back to Gallery</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8" data-testid="gallery-detail">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {gallery.name}
          </h1>
          <p className="text-muted-foreground">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'} in this gallery
          </p>
        </div>

        {/* Cards Grid */}
        {cards.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            disabled={!isOwner || isReordering}
          >
            <SortableContext items={cards.map((c) => c.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                  <SortableGalleryCard
                    key={card.id}
                    card={card}
                    isOwner={!!isOwner}
                    onDelete={handleDeleteCard}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-4">
              No cards in this gallery yet.
            </p>
            {isOwner && (
              <Button
                onClick={() => navigate('/dashboard')}
                className="gap-2"
                data-testid="create-ad-cta"
              >
                <Plus className="h-4 w-4" />
                Create Ad
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

