import { nanoid } from 'nanoid';
import type { AdCard } from '@/types/ad-cards';
import modestoUrgency from '@/assets/gallery/modesto-moves-urgency.png';
import modestoWhyChoose from '@/assets/gallery/modesto-why-choose.png';
import modestoValueOffer from '@/assets/gallery/modesto-value-offer.png';
import modestoPianoExpertise from '@/assets/gallery/modesto-piano-expertise.png';
import modestoContactCTA from '@/assets/gallery/modesto-contact-cta.png';

// R Movers Modesto campaign cards
export const R_MOVERS_CARDS: AdCard[] = [
  {
    id: nanoid(),
    title: "Modesto Moves Filling Fast – Secure Your Slot Today!",
    description: "R Movers has been Modesto's trusted moving partner for over 14 years with competitive rates starting at just $99 per hour",
    imageDataUrl: modestoUrgency,
    language: "en",
    cta: "Text 209-809-8541 NOW • Visit RMoversModesto.zone",
    keywords: ["moving", "modesto", "r movers", "urgency"],
    category: "Moving Services",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Why Modesto Families Choose R Movers",
    description: "14+ Years of Excellence, Piano Moving Specialists, and Free Eco-Disposal services",
    imageDataUrl: modestoWhyChoose,
    language: "en",
    cta: "Learn More • Book Now",
    keywords: ["moving", "modesto", "trusted", "excellence"],
    category: "Moving Services",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Unbeatable Value That Won't Last",
    description: "Limited-Time Offer: 10% Off Your First Move with competitive $99/hour rate for local moves",
    imageDataUrl: modestoValueOffer,
    language: "en",
    cta: "Act Fast – Slots Are Limited!",
    keywords: ["moving", "discount", "value", "offer"],
    category: "Moving Services",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Piano Moving Expertise You Can Trust",
    description: "Certified piano movers handling delicate instruments with expert precision, completing most moves in 2-4 hours",
    imageDataUrl: modestoPianoExpertise,
    language: "en",
    cta: "Contact R Movers",
    keywords: ["piano", "moving", "specialist", "expert"],
    category: "Moving Services",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Contact R Movers – Your Move Starts Now!",
    description: "Don't Wait Another Minute - Modesto's most trusted moving company is ready to make your relocation smooth and stress-free",
    imageDataUrl: modestoContactCTA,
    language: "en",
    cta: "Text 209-809-8541 NOW • Book Your Move",
    keywords: ["contact", "moving", "book", "modesto"],
    category: "Moving Services",
    favorited: false
  }
];
