import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";

interface FavoriteButtonProps {
  adId: string;
  size?: "sm" | "default" | "lg";
  onClick?: (e: React.MouseEvent) => void;
}

const sizeClasses = {
  sm: "p-1.5",
  default: "p-2",
  lg: "p-3",
};

const iconSizeClasses = {
  sm: "w-4 h-4",
  default: "w-5 h-5",
  lg: "w-6 h-6",
};

export function FavoriteButton({ adId, size = "default", onClick }: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite } = useFavorites();

  const favorite = isFavorite(adId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(adId);
    onClick?.(e);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group/heart rounded-full glass transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20",
        favorite 
          ? "bg-red-500/20 hover:bg-red-500/30" 
          : "hover:bg-white/20",
        sizeClasses[size]
      )}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          "transition-all duration-300",
          favorite 
            ? "fill-red-500 text-red-500 scale-110" 
            : "text-foreground group-hover/heart:text-red-400",
          iconSizeClasses[size]
        )}
      />
    </button>
  );
}

