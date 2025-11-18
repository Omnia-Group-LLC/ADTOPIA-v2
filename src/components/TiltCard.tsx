import { ReactNode } from 'react';
import { useCardTilt } from '@/hooks/useCardTilt';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function TiltCard({ children, className, maxTilt = 8 }: TiltCardProps) {
  const { ref, tiltStyle, glowStyle, handleMouseMove, handleMouseLeave } = useCardTilt(maxTilt);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative preserve-3d", className)}
      style={tiltStyle}
    >
      {/* Glow overlay */}
      <div 
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={glowStyle}
      />
      {children}
    </div>
  );
}

