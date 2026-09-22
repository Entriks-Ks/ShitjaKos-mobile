import type { HomeLocale } from '@/constants/home';

export type DemoListing = {
  id: string;
  title: string;
  price: number;
  city: string;
  seller: { sq: string; en: string; de: string };
  category: { sq: string; en: string; de: string };
};

export const demoListings: DemoListing[] = [
  {
    id: '1',
    title: 'Dogss',
    price: 100,
    city: 'Prishtina',
    seller: { sq: 'Privat', en: 'Private', de: 'Privat' },
    category: { sq: 'Qen', en: 'Dogs', de: 'Hunde' },
  },
  {
    id: '2',
    title: 'Lule Kopshti Verande',
    price: 40,
    city: 'Prishtina',
    seller: { sq: 'Biznes', en: 'Business', de: 'Gewerbe' },
    category: { sq: 'Pajisje kopshti dhe bimë', en: 'Garden equipment & plants', de: 'Garten & Pflanzen' },
  },
  {
    id: '3',
    title: 'Sunny Hill',
    price: 120,
    city: 'Prishtina',
    seller: { sq: 'Privat', en: 'Private', de: 'Privat' },
    category: { sq: 'Koncerte', en: 'Concerts', de: 'Konzerte' },
  },
  {
    id: '4',
    title: '[Demo] Samsung Galaxy A54',
    price: 195,
    city: 'Prishtina',
    seller: { sq: 'Privat', en: 'Private', de: 'Privat' },
    category: { sq: 'Telefona dhe tableta', en: 'Phones & tablets', de: 'Telefone & Tablets' },
  },
  {
    id: '5',
    title: '[Demo] iPhone 13 with case',
    price: 280,
    city: 'Prishtina',
    seller: { sq: 'Privat', en: 'Private', de: 'Privat' },
    category: { sq: 'Telefona dhe tableta', en: 'Phones & tablets', de: 'Telefone & Tablets' },
  },
  {
    id: '6',
    title: '[Demo] Lightweight laptop',
    price: 350,
    city: 'Prishtina',
    seller: { sq: 'Privat', en: 'Private', de: 'Privat' },
    category: { sq: 'Kompjuterë dhe laptopë', en: 'Computers & laptops', de: 'Computer & Laptops' },
  },
];

export function listingCountLabel(count: number, locale: HomeLocale) {
  if (locale === 'en') return `${count} listings`;
  if (locale === 'de') return `${count} Anzeigen`;
  return `${count} shpallje`;
}

export function formatPrice(price: number) {
  return `${price} €`;
}
