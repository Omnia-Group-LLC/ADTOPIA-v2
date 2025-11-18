import { Card } from "@/components/ui/card";

export function LoadingCard() {
  return (
    <Card variant="glass" className="h-80 animate-pulse">
      <div className="h-48 bg-muted/20 rounded-t-lg shimmer" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-muted/20 rounded w-3/4 shimmer" />
        <div className="h-4 bg-muted/20 rounded w-1/2 shimmer" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-muted/20 rounded w-16 shimmer" />
          <div className="h-8 bg-muted/20 rounded w-16 shimmer" />
        </div>
      </div>
    </Card>
  );
}

const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  .shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
`;

// Inject keyframes into document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}

