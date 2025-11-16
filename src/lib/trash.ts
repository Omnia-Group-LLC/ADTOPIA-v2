import type { AdCard } from "@/types/ad-cards";

export interface TrashItem {
  card: AdCard;
  deletedAt: number;
  id: string;
}

const TRASH_STORAGE_KEY = "ad_mvp.trash.v1";
const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Load trash items from localStorage
 */
export function loadTrash(): TrashItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(TRASH_STORAGE_KEY);
    if (!data) return [];
    
    const trash: TrashItem[] = JSON.parse(data);
    const now = Date.now();
    
    // Filter out expired items (older than 30 days)
    const validTrash = trash.filter(item => 
      (now - item.deletedAt) < TRASH_RETENTION_MS
    );
    
    // Save cleaned trash back
    if (validTrash.length !== trash.length) {
      saveTrash(validTrash);
    }
    
    return validTrash;
  } catch (error) {
    console.error("Failed to load trash:", error);
    return [];
  }
}

/**
 * Save trash items to localStorage
 */
export function saveTrash(trash: TrashItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trash));
  } catch (error) {
    console.error("Failed to save trash:", error);
  }
}

/**
 * Add card(s) to trash
 */
export function addToTrash(cards: AdCard | AdCard[]): TrashItem[] {
  const trash = loadTrash();
  const cardsArray = Array.isArray(cards) ? cards : [cards];
  const now = Date.now();
  
  const newTrashItems: TrashItem[] = cardsArray.map(card => ({
    card,
    deletedAt: now,
    id: `trash_${card.id}_${now}`
  }));
  
  const updatedTrash = [...newTrashItems, ...trash];
  saveTrash(updatedTrash);
  
  return updatedTrash;
}

/**
 * Restore card(s) from trash
 */
export function restoreFromTrash(trashIds: string | string[]): { 
  restoredCards: AdCard[];
  remainingTrash: TrashItem[];
} {
  const trash = loadTrash();
  const idsArray = Array.isArray(trashIds) ? trashIds : [trashIds];
  const idsSet = new Set(idsArray);
  
  const restoredCards: AdCard[] = [];
  const remainingTrash: TrashItem[] = [];
  
  trash.forEach(item => {
    if (idsSet.has(item.id)) {
      restoredCards.push(item.card);
    } else {
      remainingTrash.push(item);
    }
  });
  
  saveTrash(remainingTrash);
  
  return { restoredCards, remainingTrash };
}

/**
 * Permanently delete from trash
 */
export function permanentlyDelete(trashIds: string | string[]): void {
  const trash = loadTrash();
  const idsArray = Array.isArray(trashIds) ? trashIds : [trashIds];
  const idsSet = new Set(idsArray);
  
  const remainingTrash = trash.filter(item => !idsSet.has(item.id));
  saveTrash(remainingTrash);
}

/**
 * Clear all trash
 */
export function clearTrash(): void {
  saveTrash([]);
}

/**
 * Get trash count
 */
export function getTrashCount(): number {
  return loadTrash().length;
}
