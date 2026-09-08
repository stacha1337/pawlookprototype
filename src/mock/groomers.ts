import { Groomer } from '../types';

// UWAGA: Wszystkie poniższe dane są danymi DEMO / fikcyjnymi.
// Nie reprezentują prawdziwych firm ani salonów groomerskich.
export const DEMO_GROOMERS: Groomer[] = [
  {
    id: 'g1',
    name: 'Sierściuch Studio (DEMO)',
    district: 'Krzyki',
    priceFrom: 120,
    rating: 4.9,
    reviewCount: 231,
    styles: ['teddy', 'fluffy', 'puppy-cut'],
    isDemo: true,
  },
  {
    id: 'g2',
    name: 'Pies i Nożyczki (DEMO)',
    district: 'Stare Miasto',
    priceFrom: 150,
    rating: 4.8,
    reviewCount: 187,
    styles: ['clean', 'short', 'asian-fusion'],
    isDemo: true,
  },
  {
    id: 'g3',
    name: 'Fryzjer Futrzaka (DEMO)',
    district: 'Biskupin',
    priceFrom: 100,
    rating: 4.7,
    reviewCount: 142,
    styles: ['teddy', 'puppy-cut', 'clean'],
    isDemo: true,
  },
  {
    id: 'g4',
    name: 'Groom Room WRO (DEMO)',
    district: 'Fabryczna',
    priceFrom: 130,
    rating: 4.9,
    reviewCount: 305,
    styles: ['asian-fusion', 'fluffy', 'teddy'],
    isDemo: true,
  },
  {
    id: 'g5',
    name: 'Łapa w Łapę Salon (DEMO)',
    district: 'Psie Pole',
    priceFrom: 90,
    rating: 4.6,
    reviewCount: 98,
    styles: ['short', 'clean', 'puppy-cut'],
    isDemo: true,
  },
];

export const getGroomersForStyle = (styleId: string): Groomer[] =>
  DEMO_GROOMERS.filter((g) => g.styles.includes(styleId));
