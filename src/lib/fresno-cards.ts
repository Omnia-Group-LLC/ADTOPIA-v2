import { nanoid } from 'nanoid';
import type { AdCard } from '@/types/ad-cards';
import fresnoAcRescue from '@/assets/gallery/fresno-ac-rescue.png';
import fresnoTrust from '@/assets/gallery/fresno-trust.png';
import fresnoSolutions from '@/assets/gallery/fresno-solutions.png';
import fresnoDifference from '@/assets/gallery/fresno-difference.png';
import fresnoFaq from '@/assets/gallery/fresno-faq.png';
import fresnoSavings from '@/assets/gallery/fresno-savings.png';
import fresnoCta from '@/assets/gallery/fresno-cta.png';

// CoolFix Fresno HVAC campaign cards
export const FRESNO_CARDS: AdCard[] = [
  {
    id: nanoid(),
    title: "Beat Fresno Heat: Reliable AC Rescue + $99 Tune-Up Special",
    description: "CoolFix has been the Valley's trusted HVAC lifeline for over 12 years, delivering 24/7 emergency rescues and $99 tune-up specials",
    imageDataUrl: fresnoAcRescue,
    language: "en",
    cta: "Call Now: 559-XXX-XXXX • Book Online Today",
    keywords: ["hvac", "fresno", "ac repair", "coolfix", "emergency"],
    category: "HVAC Services",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Why 5,000+ Fresno Families Trust CoolFix",
    description: "EPA-Certified Pros, Transparent $99/Hour Pricing, and 5,000+ Families Cooled with 100% satisfaction guarantee",
    imageDataUrl: fresnoTrust,
    language: "en",
    cta: "Learn Why CoolFix is Different",
    keywords: ["hvac", "fresno", "trusted", "certified", "coolfix"],
    category: "HVAC Services",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Complete HVAC Solutions for Every Need",
    description: "Emergency Rescue, Preventive Maintenance with $99 tune-up special, and Modern System Upgrades",
    imageDataUrl: fresnoSolutions,
    language: "en",
    cta: "Explore Our Services",
    keywords: ["hvac", "maintenance", "installation", "fresno"],
    category: "HVAC Services",
    favorited: false
  },
  {
    id: nanoid(),
    title: "See the CoolFix Difference in Action",
    description: "Real results from real Fresno homes - browse our gallery of before-and-after transformations and 4.9-star rated workmanship",
    imageDataUrl: fresnoDifference,
    language: "en",
    cta: "View Our Gallery",
    keywords: ["hvac", "gallery", "results", "fresno"],
    category: "HVAC Services",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Your Questions Answered",
    description: "90-minute emergency response, 100% satisfaction guarantee, and average $180 annual savings on energy bills",
    imageDataUrl: fresnoFaq,
    language: "en",
    cta: "Get Answers",
    keywords: ["hvac", "faq", "warranty", "fresno"],
    category: "HVAC Services",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Exclusive Savings for Fresno Families",
    description: "New Customer Special: Save 10% + free home energy audit. Military & Senior Discount: 15% off all services",
    imageDataUrl: fresnoSavings,
    language: "en",
    cta: "Claim Your Discount",
    keywords: ["hvac", "discount", "savings", "fresno"],
    category: "HVAC Services",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Ready for Reliable Comfort? Let's Get Started",
    description: "Join 5,000+ satisfied Fresno families who trust CoolFix - 12+ years serving, 90-minute response, 100% guaranteed",
    imageDataUrl: fresnoCta,
    language: "en",
    cta: "Call Now: 559-XXX-XXXX • Book $99 Tune-Up",
    keywords: ["hvac", "contact", "book", "fresno", "coolfix"],
    category: "HVAC Services",
    favorited: false
  }
];
