import { nanoid } from 'nanoid';
import type { AdCard } from '@/types/ad-cards';
import { R_MOVERS_CARDS } from './r-movers-cards';
import { FRESNO_CARDS } from './fresno-cards';

// Demo card data for empty state - 5 English + 5 Translated
export const DEMO_CARDS: AdCard[] = [
  // English Cards (5) - Professional Business Cards
  {
    id: nanoid(),
    title: "Struggling with Craigslist Marketing?",
    description: "Transform your advertising strategy with our proven Craigslist marketing solutions",
    imageDataUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='craigslistGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23172554'/%3E%3Cstop offset='100%25' stop-color='%230f172a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23craigslistGrad)'/%3E%3Ctext x='50' y='80' fill='%23fbbf24' font-family='Arial, sans-serif' font-size='42' font-weight='bold'%3EStruggling with Craigslist%3C/text%3E%3Ctext x='50' y='130' fill='%23fbbf24' font-family='Arial, sans-serif' font-size='42' font-weight='bold'%3EMarketing? You're Not Alone!%3C/text%3E%3Ctext x='80' y='170' fill='%23fbbf24' font-family='Arial, sans-serif' font-size='28'%3E👋%3C/text%3E%3Ctext x='50' y='240' fill='white' font-family='Arial, sans-serif' font-size='18'%3EHey there, hardworking business owner! We understand the challenges%3C/text%3E%3Ctext x='50' y='270' fill='white' font-family='Arial, sans-serif' font-size='18'%3Eyou're facing in the competitive world of Craigslist advertising.%3C/text%3E%3Crect x='80' y='320' width='30' height='30' fill='%232563eb' rx='4'/%3E%3Ctext x='130' y='340' fill='white' font-family='Arial, sans-serif' font-size='16' font-weight='bold'%3EStanding Out is Getting Harder%3C/text%3E%3Crect x='80' y='380' width='30' height='30' fill='%232563eb' rx='4'/%3E%3Ctext x='130' y='400' fill='white' font-family='Arial, sans-serif' font-size='16' font-weight='bold'%3ETime-Consuming Process%3C/text%3E%3Crect x='80' y='440' width='30' height='30' fill='%232563eb' rx='4'/%3E%3Ctext x='130' y='460' fill='white' font-family='Arial, sans-serif' font-size='16' font-weight='bold'%3EInconsistent Results%3C/text%3E%3Ctext x='50' y='530' fill='white' font-family='Arial, sans-serif' font-size='16'%3EDon't worry - we're here to help you navigate the Craigslist jungle and%3C/text%3E%3Ctext x='50' y='555' fill='white' font-family='Arial, sans-serif' font-size='16'%3Etransform your advertising strategy! 🚀%3C/text%3E%3C/svg%3E",
    language: "en",
    cta: "Get Help Now • Free Consultation",
    keywords: ["craigslist", "marketing", "advertising"],
    category: "Marketing Solutions",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Digital Marketing Agency Built for Cleaning Companies",
    description: "Specialized solutions that help cleaning businesses grow online with proven results",
    language: "en",
    cta: "Get Started • Free Analysis",
    keywords: ["digital", "marketing", "cleaning"],
    category: "Marketing Solutions",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Break Language Barriers, Boost Your Business",
    description: "Transform your reach by connecting with customers in their preferred languages",
    language: "en",
    cta: "Start Multilingual • Free ROI Calc",
    keywords: ["multilingual", "translation", "business"],
    category: "Marketing Solutions",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Unlock the Power of Craigslist: Automated Job Posting",
    description: "Streamline your hiring with our comprehensive Craigslist posting platform",
    imageDataUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='jobGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23172554'/%3E%3Cstop offset='100%25' stop-color='%230f172a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23jobGrad)'/%3E%3Ctext x='60' y='70' fill='%23fbbf24' font-family='Arial, sans-serif' font-size='28' font-weight='bold'%3EUnlock the Power of Craigslist: Your Automated Job Posting%3C/text%3E%3Ctext x='60' y='110' fill='%23fbbf24' font-family='Arial, sans-serif' font-size='28' font-weight='bold'%3ESolution%3C/text%3E%3Ctext x='60' y='170' fill='white' font-family='Arial, sans-serif' font-size='20' font-weight='bold'%3EStreamline Your Hiring with Our Craigslist Posting Platform%3C/text%3E%3Ctext x='60' y='220' fill='white' font-family='Arial, sans-serif' font-size='16'%3ECraigslist is the go-to destination for job seekers, boasting over 50 billion monthly page views.%3C/text%3E%3Ctext x='60' y='250' fill='white' font-family='Arial, sans-serif' font-size='16'%3ELeverage this massive audience to connect with top talent through our automated Craigslist job%3C/text%3E%3Ctext x='60' y='280' fill='white' font-family='Arial, sans-serif' font-size='16'%3Eposting solution.%3C/text%3E%3Crect x='40' y='320' width='30' height='30' fill='%232563eb' rx='4'/%3E%3Ctext x='58' y='340' fill='white' font-family='Arial, sans-serif' font-size='18' font-weight='bold'%3E1%3C/text%3E%3Ctext x='90' y='340' fill='white' font-family='Arial, sans-serif' font-size='16' font-weight='600'%3EEmployment Agencies/Construction Companies%3C/text%3E%3Crect x='40' y='365' width='30' height='30' fill='%232563eb' rx='4'/%3E%3Ctext x='58' y='385' fill='white' font-family='Arial, sans-serif' font-size='18' font-weight='bold'%3E2%3C/text%3E%3Ctext x='90' y='385' fill='white' font-family='Arial, sans-serif' font-size='16' font-weight='600'%3ETruck Driving Companies %26 Recruiting Firms%3C/text%3E%3Crect x='40' y='410' width='30' height='30' fill='%232563eb' rx='4'/%3E%3Ctext x='58' y='430' fill='white' font-family='Arial, sans-serif' font-size='18' font-weight='bold'%3E3%3C/text%3E%3Ctext x='90' y='430' fill='white' font-family='Arial, sans-serif' font-size='16' font-weight='600'%3EBusinesses with Multiple Job Openings%3C/text%3E%3Crect x='40' y='455' width='30' height='30' fill='%232563eb' rx='4'/%3E%3Ctext x='58' y='475' fill='white' font-family='Arial, sans-serif' font-size='18' font-weight='bold'%3E4%3C/text%3E%3Ctext x='90' y='475' fill='white' font-family='Arial, sans-serif' font-size='16' font-weight='600'%3EConstruction Companies%3C/text%3E%3C/svg%3E",
    language: "en",
    cta: "Start Posting • View Templates",
    keywords: ["craigslist", "jobs", "automation"],
    category: "Job Solutions",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Complete Digital Domination Suite",
    description: "Professional marketing solutions and smart automation for business growth",
    imageDataUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='digitalGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23172554'/%3E%3Cstop offset='100%25' stop-color='%230f172a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23digitalGrad)'/%3E%3Ctext x='70' y='80' fill='white' font-family='Arial, sans-serif' font-size='36' font-weight='bold'%3EComplete Digital Domination Suite%3C/text%3E%3Ctext x='70' y='150' fill='white' font-family='Arial, sans-serif' font-size='18' font-weight='bold'%3EProfessional Marketing%3C/text%3E%3Ctext x='70' y='180' fill='%23a1a1aa' font-family='Arial, sans-serif' font-size='16'%3ECustom-built, conversion-focused websites that turn visitors%3C/text%3E%3Ctext x='70' y='205' fill='%23a1a1aa' font-family='Arial, sans-serif' font-size='16'%3Einto clients%3C/text%3E%3Ctext x='629' y='150' fill='white' font-family='Arial, sans-serif' font-size='18' font-weight='bold'%3ESmart Automation%3C/text%3E%3Ctext x='629' y='180' fill='%23a1a1aa' font-family='Arial, sans-serif' font-size='16'%3ESmart marketing automation that fills your schedule 24/7%3C/text%3E%3Crect x='70' y='260' width='30' height='30' fill='%232563eb' rx='4'/%3E%3Ctext x='129' y='280' fill='white' font-family='Arial, sans-serif' font-size='18' font-weight='bold'%3EFull Digital Management%3C/text%3E%3Ctext x='129' y='305' fill='%23a1a1aa' font-family='Arial, sans-serif' font-size='16'%3EFull digital presence management across all platforms%3C/text%3E%3Crect x='629' y='260' width='30' height='30' fill='%232563eb' rx='4'/%3E%3Ctext x='683' y='280' fill='white' font-family='Arial, sans-serif' font-size='18' font-weight='bold'%3ELocal SEO Domination%3C/text%3E%3Ctext x='683' y='305' fill='%23a1a1aa' font-family='Arial, sans-serif' font-size='16'%3EData-driven local SEO to dominate Google searches%3C/text%3E%3Ctext x='80' y='380' fill='%23fbbf24' font-family='Arial, sans-serif' font-size='24' font-weight='bold'%3E⚡ Lightning-Fast Delivery%3C/text%3E%3Crect x='88' y='420' width='30' height='30' fill='%232563eb' rx='4'/%3E%3Ctext x='98' y='440' fill='white' font-family='Arial, sans-serif' font-size='18' font-weight='bold'%3E1%3C/text%3E%3Ctext x='128' y='430' fill='white' font-family='Arial, sans-serif' font-size='16' font-weight='bold'%3E14-Day Website Setup%3C/text%3E%3Ctext x='128' y='450' fill='%23a1a1aa' font-family='Arial, sans-serif' font-size='14'%3EComplete Ad Promotion Website%3C/text%3E%3Ctext x='128' y='470' fill='%23a1a1aa' font-family='Arial, sans-serif' font-size='14'%3ESetup in 14 Days%3C/text%3E%3C/svg%3E",
    language: "en",
    cta: "Get Full Suite • Start Today",
    keywords: ["digital", "domination", "automation"],
    category: "Complete Solutions",
    favorited: false
  },
  
  // Translated Cards (5)
  {
    id: nanoid(),
    title: "Servicio de Limpieza Profesional",
    description: "Servicio de limpieza premium con productos ecológicos y garantía de satisfacción",
    imageDataUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='cleanGradEs' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2306b6d4'/%3E%3Cstop offset='100%25' stop-color='%230891b2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23cleanGradEs)'/%3E%3Crect x='30' y='40' width='340' height='220' fill='white' rx='12' opacity='0.95'/%3E%3Ctext x='200' y='115' text-anchor='middle' fill='%230f172a' font-family='Arial, sans-serif' font-size='20' font-weight='bold'%3ELimpieza Total%3C/text%3E%3Ctext x='200' y='145' text-anchor='middle' fill='%23475569' font-family='Arial, sans-serif' font-size='15'%3EServicio Profesional%3C/text%3E%3Ctext x='200' y='190' text-anchor='middle' fill='%2306b6d4' font-family='Arial, sans-serif' font-size='13' font-weight='600'%3ERESERVAR • COTIZACIÓN GRATIS%3C/text%3E%3C/svg%3E",
    language: "es",
    cta: "Reservar • Cotización gratis",
    keywords: ["limpieza", "profesional", "ecológico"],
    category: "Ad package cards",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Plomberie d'Urgence",
    description: "Service de plomberie disponible 24h/24 avec garantie satisfaction",
    imageDataUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='plumbingGradFr' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%236366f1'/%3E%3Cstop offset='100%25' stop-color='%234338ca'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23plumbingGradFr)'/%3E%3Crect x='30' y='40' width='340' height='220' fill='white' rx='12' opacity='0.95'/%3E%3Ctext x='200' y='115' text-anchor='middle' fill='%230f172a' font-family='Arial, sans-serif' font-size='19' font-weight='bold'%3EAqua Service%3C/text%3E%3Ctext x='200' y='145' text-anchor='middle' fill='%23475569' font-family='Arial, sans-serif' font-size='15'%3EPlomberie 24h/24%3C/text%3E%3Ctext x='200' y='190' text-anchor='middle' fill='%236366f1' font-family='Arial, sans-serif' font-size='13' font-weight='600'%3EAPPELER • DEVIS GRATUIT%3C/text%3E%3C/svg%3E",
    language: "fr",
    cta: "Appeler • Devis gratuit",
    keywords: ["plomberie", "urgence", "24h"],
    category: "Ad package cards",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Professionelle Reinigung",
    description: "Erstklassiger Reinigungsservice mit umweltfreundlichen Produkten",
    imageDataUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='cleanGradDe' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2310b981'/%3E%3Cstop offset='100%25' stop-color='%23059669'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23cleanGradDe)'/%3E%3Crect x='30' y='40' width='340' height='220' fill='white' rx='12' opacity='0.95'/%3E%3Ctext x='200' y='115' text-anchor='middle' fill='%230f172a' font-family='Arial, sans-serif' font-size='19' font-weight='bold'%3EReinKraft%3C/text%3E%3Ctext x='200' y='145' text-anchor='middle' fill='%23475569' font-family='Arial, sans-serif' font-size='15'%3EProfessionelle Reinigung%3C/text%3E%3Ctext x='200' y='190' text-anchor='middle' fill='%2310b981' font-family='Arial, sans-serif' font-size='13' font-weight='600'%3EBUCHEN • KOSTENLOS%3C/text%3E%3C/svg%3E",
    language: "de",
    cta: "Buchen • Kostenlose Beratung",
    keywords: ["reinigung", "professionell", "umweltfreundlich"],
    category: "Ad package cards",
    favorited: false
  },
  {
    id: nanoid(),
    title: "Serviço de Entrega Rápida",
    description: "Entrega expressa em toda a cidade com rastreamento em tempo real",
    category: "Ad package cards",
    favorited: false
  }
];

export function loadDemoCards(): AdCard[] {
  return DEMO_CARDS;
}

export function addRMoversCards(existingCards: AdCard[]): AdCard[] {
  const rMoversCards = R_MOVERS_CARDS.map(card => ({
    ...card,
    id: nanoid()
  }));
  return [...existingCards, ...rMoversCards];
}

export function addFresnoCards(existingCards: AdCard[]): AdCard[] {
  const fresnoCards = FRESNO_CARDS.map(card => ({
    ...card,
    id: nanoid()
  }));
  return [...existingCards, ...fresnoCards];
}
