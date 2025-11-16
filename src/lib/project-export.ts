import type { AdCard } from '@/types/ad-cards';
import { loadCards, loadEmail, loadGiftStatus, loadShorts } from './storage';
import { downloadFile } from './file-helpers';

export interface ProjectData {
  version: string;
  exportedAt: string;
  cards: AdCard[];
  email: string;
  giftClaimed: boolean;
  shortLinks: any[];
}

export function exportProject(): ProjectData {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    cards: loadCards(),
    email: loadEmail(),
    giftClaimed: loadGiftStatus(),
    shortLinks: loadShorts()
  };
}

export function downloadProject(): void {
  const projectData = exportProject();
  const filename = `ad-cards-project-${new Date().toISOString().split('T')[0]}.json`;
  const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(projectData, null, 2))}`;
  downloadFile(dataUrl, filename);
}

export function importProject(projectData: Partial<ProjectData>): {
  success: boolean;
  message: string;
  imported: {
    cards: number;
    email: boolean;
    shortLinks: number;
  };
} {
  if (typeof window === 'undefined') {
    return {
      success: false,
      message: 'Import not available in this environment',
      imported: { cards: 0, email: false, shortLinks: 0 }
    };
  }

  try {
    let cardsImported = 0;
    let emailImported = false;
    let shortLinksImported = 0;

    // Import cards if valid
    if (Array.isArray(projectData.cards)) {
      const validCards = projectData.cards.filter(card => 
        card && typeof card === 'object' && 
        card.id && card.title && card.imageDataUrl
      );
      
      if (validCards.length > 0) {
        const existingCards = loadCards();
        const mergedCards = [...validCards, ...existingCards];
        cardsImported = validCards.length;
      }
    }

    // Import email if provided
    if (typeof projectData.email === 'string' && projectData.email.trim()) {
      emailImported = true;
    }

    // Import gift status if provided
    if (typeof projectData.giftClaimed === 'boolean') {
    }

    // Import short links if valid
    if (Array.isArray(projectData.shortLinks)) {
      const validShortLinks = projectData.shortLinks.filter(link =>
        link && typeof link === 'object' && link.slug && link.target
      );
      
      if (validShortLinks.length > 0) {
        shortLinksImported = validShortLinks.length;
      }
    }

    return {
      success: true,
      message: `Successfully imported ${cardsImported} cards, ${emailImported ? 'email, ' : ''}${shortLinksImported} short links`,
      imported: {
        cards: cardsImported,
        email: emailImported,
        shortLinks: shortLinksImported
      }
    };
  } catch (error) {
    console.error('Project import failed:', error);
    return {
      success: false,
      message: 'Failed to import project data. Please check the file format.',
      imported: {
        cards: 0,
        email: false,
        shortLinks: 0
      }
    };
  }
}