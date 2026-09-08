import { GroomingStyle } from '../types';

export const GROOMING_STYLES: GroomingStyle[] = [
  {
    id: 'teddy',
    name: 'Teddy',
    description: 'Okrągła, puchata główka i wyrównana sierść na całym ciele. Wygląda jak pluszowy miś.',
    emoji: '🧸',
    gradientFrom: '#E8B4A0',
    gradientTo: '#C97B63',
  },
  {
    id: 'puppy-cut',
    name: 'Puppy Cut',
    description: 'Krótsza, jednolita długość na całym ciele. Lekki, młodzieńczy wygląd na co dzień.',
    emoji: '🐾',
    gradientFrom: '#A8C8D8',
    gradientTo: '#5B8FA8',
  },
  {
    id: 'fluffy',
    name: 'Fluffy',
    description: 'Maksymalna objętość sierści, delikatne podcięcie tylko wokół łap i oczu.',
    emoji: '☁️',
    gradientFrom: '#D8C4E8',
    gradientTo: '#9B7BB8',
  },
  {
    id: 'clean',
    name: 'Clean',
    description: 'Wyraźne linie, krótko przy pyszczku i łapach. Schludny, minimalistyczny efekt.',
    emoji: '✨',
    gradientFrom: '#B8D8C4',
    gradientTo: '#5B9B7B',
  },
  {
    id: 'asian-fusion',
    name: 'Asian Fusion',
    description: 'Charakterystyczna, okrągła główka i wyraziste kontury. Efektowny, salonowy styl.',
    emoji: '🌸',
    gradientFrom: '#F0B8C4',
    gradientTo: '#D85B7B',
  },
  {
    id: 'short',
    name: 'Short',
    description: 'Bardzo krótkie strzyżenie na całym ciele. Praktyczne na lato i mniej pielęgnacji.',
    emoji: '🔆',
    gradientFrom: '#F0D8A0',
    gradientTo: '#D8A030',
  },
];

export const getStyleById = (id: string): GroomingStyle | undefined =>
  GROOMING_STYLES.find((s) => s.id === id);
