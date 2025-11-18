import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  }, []);

  const toggleFavorite = (adId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(adId)) {
        next.delete(adId);
      } else {
        next.add(adId);
      }
      localStorage.setItem('favorites', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const isFavorite = (adId: string) => favorites.has(adId);

  return { toggleFavorite, isFavorite };
}

