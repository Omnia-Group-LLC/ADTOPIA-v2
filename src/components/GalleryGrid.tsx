import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GalleryGridProps {
  children: ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function GalleryGrid({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6,
  className,
}: GalleryGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  const gapClasses = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div
      className={cn(
        'grid',
        columns.sm && `${gridCols[columns.sm]}`,
        columns.md && `md:${gridCols[columns.md]}`,
        columns.lg && `lg:${gridCols[columns.lg]}`,
        columns.xl && `xl:${gridCols[columns.xl]}`,
        gapClasses[gap as keyof typeof gapClasses] || 'gap-6',
        className
      )}
    >
      {children}
    </div>
  );
}

