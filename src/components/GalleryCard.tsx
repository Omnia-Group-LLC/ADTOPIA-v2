import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GalleryImage } from '@/components/GalleryImage';
import { ImageSize } from '@/hooks/useSignedUrl';
import { cn } from '@/lib/utils';

interface GalleryCardProps {
  title?: string;
  description?: string;
  bucket: string;
  imagePath: string;
  imageSize?: ImageSize;
  category?: string;
  tags?: string[];
  onClick?: () => void;
  className?: string;
  priority?: boolean;
}

export function GalleryCard({
  title,
  description,
  bucket,
  imagePath,
  imageSize = 'thumbnail',
  category,
  tags = [],
  onClick,
  className,
  priority = false,
}: GalleryCardProps) {
  return (
    <Card
      variant="gallery-card"
      className={cn(
        'group cursor-pointer overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="aspect-video w-full overflow-hidden">
          <GalleryImage
            bucket={bucket}
            path={imagePath}
            size={imageSize}
            alt={title || 'Gallery image'}
            priority={priority}
            className="group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </CardContent>
      {(title || description || category || tags.length > 0) && (
        <CardHeader className="space-y-2">
          {title && (
            <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          )}
          
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 items-center">
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
            )}
            
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
      )}
    </Card>
  );
}

