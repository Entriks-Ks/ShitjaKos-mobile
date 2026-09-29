import type { ImageSourcePropType } from 'react-native';

import { listingMatchesCategory } from '@/constants/catalog';
import type { HomeLocale } from '@/constants/home';

export type DemoListing = {
  id: string;
  title: string;
  price: number;
  city: string;
  categoryId: string;
  shopSlug?: string;
  description: string;
  icon: 'bag' | 'phone' | 'sofa' | 'bicycle' | 'laptop' | 'tv';
  tone: string;
  image: ImageSourcePropType;
  ago: { sq: string; en: string; de: string };
  seller: { sq: string; en: string; de: string };
  category: { sq: string; en: string; de: string };
  negotiable?: boolean;
  conditionText?: { sq: string; en: string; de: string };
  phone?: string;
  status?: 'draft' | 'published';
  lifecycle?: string;
  photoCount?: number;
  photos?: string[];
};

const sellerPrivate = { sq: 'Privat', en: 'Private', de: 'Privat' };

export const demoListings: DemoListing[] = [
  {
    id: '1',
    title: 'Qese Michael Kors',
    price: 120,
    city: 'Prishtinë',
    categoryId: 'clothes',
    description: 'Qese e përdorur, gjendje e mirë.',
    icon: 'bag',
    tone: '#e7f0e4',
    image: require('../assets/images/product-bag.png'),
    ago: { sq: '2 orë më parë', en: '2 hours ago', de: 'vor 2 Std.' },
    seller: sellerPrivate,
    category: { sq: 'Veshje', en: 'Clothing', de: 'Kleidung' },
  },
  {
    id: '2',
    title: 'iPhone 14 Pro 128GB',
    price: 650,
    city: 'Prizren',
    categoryId: 'electronics',
    shopSlug: 'elektro-prishtina',
    negotiable: false,
    description: 'iPhone 14 Pro, 128GB, me karikues.',
    icon: 'phone',
    tone: '#ece7e2',
    image: require('../assets/images/product-phone.png'),
    ago: { sq: '3 orë më parë', en: '3 hours ago', de: 'vor 3 Std.' },
    seller: { sq: 'Biznes', en: 'Business', de: 'Gewerbe' },
    category: { sq: 'Elektronikë', en: 'Electronics', de: 'Elektronik' },
  },
  {
    id: '3',
    title: 'Divan modern',
    price: 250,
    city: 'Prishtinë',
    categoryId: 'home',
    description: 'Divan i gjërë, ngjyrë e hapur.',
    icon: 'sofa',
    tone: '#f3efe6',
    image: require('../assets/images/product-sofa.png'),
    ago: { sq: '5 orë më parë', en: '5 hours ago', de: 'vor 5 Std.' },
    seller: sellerPrivate,
    category: { sq: 'Shtëpi & Kopsht', en: 'Home & garden', de: 'Haus & Garten' },
  },
  {
    id: '4',
    title: 'Biçikletë gjendje e mirë',
    price: 80,
    city: 'Pejë',
    categoryId: 'sports',
    shopSlug: 'sport-peja',
    description: 'Biçikletë për qytet, e servisuar.',
    icon: 'bicycle',
    tone: '#e4eef2',
    image: require('../assets/images/product-bike.png'),
    ago: { sq: '1 ditë më parë', en: '1 day ago', de: 'vor 1 Tag' },
    seller: { sq: 'Biznes', en: 'Business', de: 'Gewerbe' },
    category: { sq: 'Sport & Hobi', en: 'Sport & hobby', de: 'Sport & Hobby' },
  },
  {
    id: '5',
    title: 'Laptop Dell i5',
    price: 220,
    city: 'Ferizaj',
    categoryId: 'electronics',
    shopSlug: 'elektro-prishtina',
    negotiable: false,
    description: 'Laptop Dell me procesor i5.',
    icon: 'laptop',
    tone: '#e8e8ea',
    image: require('../assets/images/product-laptop.png'),
    ago: { sq: '1 ditë më parë', en: '1 day ago', de: 'vor 1 Tag' },
    seller: { sq: 'Biznes', en: 'Business', de: 'Gewerbe' },
    category: { sq: 'Elektronikë', en: 'Electronics', de: 'Elektronik' },
  },
  {
    id: '6',
    title: 'TV Samsung 50"',
    price: 300,
    city: 'Prishtinë',
    categoryId: 'electronics',
    description: 'Televizor Samsung 50 inç.',
    icon: 'tv',
    tone: '#e9eef1',
    image: require('../assets/images/product-tv.png'),
    ago: { sq: '2 ditë më parë', en: '2 days ago', de: 'vor 2 Tagen' },
    seller: sellerPrivate,
    category: { sq: 'Elektronikë', en: 'Electronics', de: 'Elektronik' },
  },
  {
    id: '7',
    title: 'Këpucë sportive',
    price: 45,
    city: 'Gjakovë',
    categoryId: 'clothes',
    shopSlug: 'moda-gjakova',
    description: 'Këpucë të bardha, të përdorura pak.',
    icon: 'bag',
    tone: '#f4f4f4',
    image: require('../assets/images/product-shoes.png'),
    ago: { sq: '4 orë më parë', en: '4 hours ago', de: 'vor 4 Std.' },
    seller: { sq: 'Biznes', en: 'Business', de: 'Gewerbe' },
    category: { sq: 'Veshje', en: 'Clothing', de: 'Kleidung' },
  },
  {
    id: '8',
    title: 'Kufje wireless',
    price: 35,
    city: 'Prizren',
    categoryId: 'electronics',
    shopSlug: 'elektro-prishtina',
    description: 'Kufje të zeza, me karikim.',
    icon: 'phone',
    tone: '#ececec',
    image: require('../assets/images/product-headphones.png'),
    ago: { sq: '6 orë më parë', en: '6 hours ago', de: 'vor 6 Std.' },
    seller: { sq: 'Biznes', en: 'Business', de: 'Gewerbe' },
    category: { sq: 'Elektronikë', en: 'Electronics', de: 'Elektronik' },
  },
  {
    id: '9',
    title: 'Tavolinë kafeje',
    price: 70,
    city: 'Gjilan',
    categoryId: 'home',
    description: 'Tavolinë e rrumbullakët prej druri.',
    icon: 'sofa',
    tone: '#f3efe6',
    image: require('../assets/images/product-table.png'),
    ago: { sq: '1 ditë më parë', en: '1 day ago', de: 'vor 1 Tag' },
    seller: sellerPrivate,
    category: { sq: 'Shtëpi & Kopsht', en: 'Home & garden', de: 'Haus & Garten' },
  },
  {
    id: '10',
    title: 'Orë dore',
    price: 55,
    city: 'Gjakovë',
    categoryId: 'clothes',
    shopSlug: 'moda-gjakova',
    description: 'Orë me rrip lëkure, funksionon.',
    icon: 'bag',
    tone: '#f6f1ea',
    image: require('../assets/images/product-watch.png'),
    ago: { sq: '1 ditë më parë', en: '1 day ago', de: 'vor 1 Tag' },
    seller: { sq: 'Biznes', en: 'Business', de: 'Gewerbe' },
    category: { sq: 'Veshje', en: 'Clothing', de: 'Kleidung' },
  },
  {
    id: '11',
    title: 'Bimë në vazo',
    price: 18,
    city: 'Prishtinë',
    categoryId: 'home',
    shopSlug: 'lule-kopshti',
    description: 'Bimë e gjelbër për shtëpi.',
    icon: 'sofa',
    tone: '#e7f0e4',
    image: require('../assets/images/product-plant.png'),
    ago: { sq: '3 orë më parë', en: '3 hours ago', de: 'vor 3 Std.' },
    seller: { sq: 'Biznes', en: 'Business', de: 'Gewerbe' },
    category: { sq: 'Shtëpi & Kopsht', en: 'Home & garden', de: 'Haus & Garten' },
  },
  {
    id: '12',
    title: 'Top futbolli',
    price: 15,
    city: 'Pejë',
    categoryId: 'sports',
    shopSlug: 'sport-peja',
    description: 'Top i zi dhe i bardhë, gjendje e mirë.',
    icon: 'bicycle',
    tone: '#f7f7f7',
    image: require('../assets/images/product-ball.png'),
    ago: { sq: '2 ditë më parë', en: '2 days ago', de: 'vor 2 Tagen' },
    seller: { sq: 'Biznes', en: 'Business', de: 'Gewerbe' },
    category: { sq: 'Sport & Hobi', en: 'Sport & hobby', de: 'Sport & Hobby' },
  },
];

export function filterListings(
  listings: DemoListing[],
  query: { q?: string; category?: string; city?: string; sort?: string },
) {
  const words = (query.q ?? '')
    .trim()
    .slice(0, 120)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);

  const filtered = listings.filter((listing) => {
    if (!listingMatchesCategory(listing.categoryId, query.category ?? '')) return false;
    if (query.city && listing.city !== query.city) return false;
    if (!words.length) return true;
    const haystack = [listing.title, listing.description, listing.city, ...Object.values(listing.category)]
      .join(' ')
      .toLowerCase();
    return words.every((word) => haystack.includes(word));
  });

  if (query.sort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price);
  if (query.sort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price);
  return filtered;
}

export function listingCountLabel(count: number, locale: HomeLocale) {
  if (locale === 'en') return `${count} listings`;
  if (locale === 'de') return `${count} Anzeigen`;
  return `${count} shpallje`;
}

export function formatPrice(price: number) {
  return `€${price}`;
}

export function similarListings(listing: DemoListing, limit = 4) {
  return demoListings.filter((item) => item.id !== listing.id && item.categoryId === listing.categoryId).slice(0, limit);
}
