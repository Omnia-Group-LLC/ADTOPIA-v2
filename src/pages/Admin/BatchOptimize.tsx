import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@modules/api/supabase/client';
import { useAuth } from '@modules/auth';
import { Button } from '@modules/ui';
import { Checkbox } from '@modules/ui/components/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@modules/ui/components/table';
import { useToast } from '@modules/ui/components/use-toast';
import { Spinner } from '@modules/ui/components/Spinner';
import { Progress } from '@modules/ui/components/progress';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';

/**
 * Gallery Image Schema
 */
const galleryImageSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  gallery_container_id: z.string().uuid().nullable(),
  visible: z.boolean().nullable(),
  position: z.number().nullable(),
  created_at: z.string(),
});

type GalleryImage = z.infer<typeof galleryImageSchema>;

/**
 * Batch Optimize Request Schema
 */
const batchOptimizeRequestSchema = z.object({
  filePaths: z.array(z.string()).min(1),
});

/**
 * BatchOptimize Admin Page
 * 
 * Route: /admin/batch-optimize
 * 
 * Features:
 * - Fetches 68 gallery_images using useQuery
 * - Sortable table with select all checkbox
 * - Batch optimize with concurrent 3 processing
 * - Progress toast (0-68)
 * - Logs to admin_activity_log
 * 
 * Quality: Zod validation, JSDoc, error boundaries
 */
export function BatchOptimize() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof GalleryImage;
    direction: 'asc' | 'desc';
  }>({ key: 'created_at', direction: 'desc' });

  /**
   * Check admin role using has_role RPC function
   */
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
          return;
        }

        setIsAdmin(data ?? false);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user?.id]);

  /**
   * Fetch gallery images
   * Query key: 'gallery-images-all' as specified
   */
  const { data: images = [], isLoading, refetch } = useQuery<GalleryImage[]>({
    queryKey: ['gallery-images-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('id, url, title, description, gallery_container_id, visible, position, created_at')
        .eq('visible', true)
        .limit(68)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch images: ${error.message}`);
      }

      // Validate and parse
      return (data || []).map((img) => galleryImageSchema.parse(img));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Toggle selection for a single image
   */
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /**
   * Toggle select all
   */
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedImages.map((img) => img.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  /**
   * Sort images
   */
  const sortedImages = useMemo(() => {
    const sorted = [...images];
    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
    return sorted;
  }, [images, sortConfig]);

  /**
   * Handle sort
   */
  const handleSort = (key: keyof GalleryImage) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  /**
   * Extract file path from URL
   */
  const extractFilePath = (url: string): string => {
    try {
      const urlObj = new URL(url);
      // Extract path after bucket name
      const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
      if (pathMatch) {
        return pathMatch[2]; // Return the file path
      }
      // Fallback: use pathname directly
      return urlObj.pathname.replace(/^\//, '');
    } catch {
      // If URL parsing fails, return the URL as-is
      return url;
    }
  };

  /**
   * Batch optimize images
   */
  const handleBatchOptimize = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: 'No Images Selected',
        description: 'Please select at least one image to optimize',
        variant: 'destructive',
      });
      return;
    }

    setIsOptimizing(true);
    setProgress({ current: 0, total: selectedIds.size });

    try {
      // Validate request
      const selectedImages = sortedImages.filter((img) => selectedIds.has(img.id));
      const filePaths = selectedImages.map((img) => extractFilePath(img.url));
      
      batchOptimizeRequestSchema.parse({ filePaths });

      // Process in batches of 3 (concurrent) using p-limit pattern
      const batchSize = 3;
      const batches: string[][] = [];
      
      for (let i = 0; i < filePaths.length; i += batchSize) {
        batches.push(filePaths.slice(i, i + batchSize));
      }

      let completed = 0;
      const results: { success: number; failed: number; reductions: number[] } = {
        success: 0,
        failed: 0,
        reductions: [],
      };

      // Process batches with concurrent limit of 3
      const processBatch = async (batch: string[], batchIndex: number) => {
        try {
          // Use optimize-image-batch Edge Function for batch processing
          const { data, error } = await supabase.functions.invoke('optimize-image-batch', {
            body: {
              filePaths: batch,
              bucket: 'gallery-images',
            },
          });

          if (error) {
            throw error;
          }

          // Process results from batch function
          if (data?.results) {
            data.results.forEach((result: any) => {
              completed++;
              setProgress({ current: completed, total: filePaths.length });

              if (result.success && result.reduction) {
                results.reductions.push(result.reduction);
                results.success++;
              } else {
                results.failed++;
              }
            });
          }

          // Update toast progress
          toast({
            title: 'Optimizing Images',
            description: `Progress: ${completed}/${filePaths.length} images processed`,
          });
        } catch (error) {
          // If batch fails, mark all items in batch as failed
          batch.forEach(() => {
            completed++;
            setProgress({ current: completed, total: filePaths.length });
            results.failed++;
          });
          console.error(`Batch ${batchIndex} failed:`, error);
        }
      };

      // Process batches with concurrent limit of 3
      const concurrentLimit = 3;
      for (let i = 0; i < batches.length; i += concurrentLimit) {
        const concurrentBatches = batches.slice(i, i + concurrentLimit);
        await Promise.all(concurrentBatches.map((batch, idx) => processBatch(batch, i + idx)));
      }

      // Calculate average reduction
      const avgReduction =
        results.reductions.length > 0
          ? results.reductions.reduce((a, b) => a + b, 0) / results.reductions.length
          : 0;

      // Log to admin_activity_log
      if (user) {
        await supabase.from('admin_activity_log').insert({
          user_id: user.id,
          action: 'batch_optimize',
          metadata: {
            count: selectedIds.size,
            success: results.success,
            failed: results.failed,
            avg_reduction: Math.round(avgReduction * 100) / 100,
            reductions: {
              avg: Math.round(avgReduction * 100) / 100,
              min: results.reductions.length > 0 ? Math.min(...results.reductions) : 0,
              max: results.reductions.length > 0 ? Math.max(...results.reductions) : 0,
            },
          },
        });
      }

      // Success toast
      toast({
        title: 'Batch Optimization Complete',
        description: `Successfully optimized ${results.success} images. Average reduction: ${Math.round(avgReduction)}%`,
      });

      // Clear selection
      setSelectedIds(new Set());

      // Refetch images to get updated data
      await refetch();
    } catch (error) {
      console.error('Batch optimize error:', error);
      toast({
        title: 'Optimization Failed',
        description: error instanceof Error ? error.message : 'Failed to optimize images',
        variant: 'destructive',
      });
    } finally {
      setIsOptimizing(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const allSelected = selectedIds.size === sortedImages.length && sortedImages.length > 0;
  const someSelected = selectedIds.size > 0 && selectedIds.size < sortedImages.length;

  // Admin check: redirect if not admin
  if (isAdmin === false) {
    toast({
      title: 'Access Denied',
      description: 'Admin role required to access batch optimization',
      variant: 'destructive',
    });
    return <Navigate to="/unauthorized" replace />;
  }

  // Loading states
  if (isLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">
            {isLoading ? 'Loading gallery images...' : 'Checking permissions...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8" data-testid="batch-optimize-page">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Batch Image Optimization</h1>
          <p className="text-muted-foreground">
            Select images to optimize. Processing runs in batches of 3 concurrently.
          </p>
        </div>

        {/* Progress Bar */}
        {isOptimizing && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Optimizing images...</span>
              <span className="font-medium">
                {progress.current} / {progress.total}
              </span>
            </div>
            <Progress value={(progress.current / progress.total) * 100} className="h-2" />
          </div>
        )}

        {/* Actions Bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Checkbox
              id="select-all"
              checked={allSelected}
              ref={(el) => {
                if (el) {
                  (el as any).indeterminate = someSelected;
                }
              }}
              onCheckedChange={toggleSelectAll}
              data-testid="select-all-checkbox"
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Select All ({sortedImages.length})
            </label>
            {selectedIds.size > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
            )}
          </div>

          <Button
            onClick={handleBatchOptimize}
            disabled={isOptimizing || selectedIds.size === 0}
            data-testid="optimize-button"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Optimize Selected ({selectedIds.size})
              </>
            )}
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <span className="sr-only">Select</span>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('title')}
                >
                  Title
                  {sortConfig.key === 'title' && (
                    <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('created_at')}
                >
                  Created
                  {sortConfig.key === 'created_at' && (
                    <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead>URL</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('position')}
                >
                  Position
                  {sortConfig.key === 'position' && (
                    <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedImages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No images found
                  </TableCell>
                </TableRow>
              ) : (
                sortedImages.map((image) => (
                  <TableRow
                    key={image.id}
                    data-testid={`image-row-${image.id}`}
                    className={selectedIds.has(image.id) ? 'bg-muted/50' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(image.id)}
                        onCheckedChange={() => toggleSelection(image.id)}
                        data-testid={`checkbox-${image.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {image.title || 'Untitled'}
                    </TableCell>
                    <TableCell>
                      {new Date(image.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {image.url}
                      </a>
                    </TableCell>
                    <TableCell>{image.position ?? '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-muted-foreground">
          Total images: {sortedImages.length} | Selected: {selectedIds.size}
        </div>
      </div>
    </div>
  );
}

