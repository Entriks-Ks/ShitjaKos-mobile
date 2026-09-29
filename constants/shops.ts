import type { ImageSourcePropType } from 'react-native';

export type DemoShop = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  image: ImageSourcePropType;
};

export const demoShops: DemoShop[] = [
  {
    slug: 'lule-kopshti',
    name: 'Lule Kopshti',
    tagline: 'Bimë për shtëpi dhe verandë.',
    description: 'Bimë, lule dhe pajisje për kopshtin dhe verandën.',
    city: 'Prishtinë',
    phone: '+383 44 100 200',
    email: 'lule@example.com',
    address: 'Rruga e Kopshtit, Prishtinë',
    openingHours: 'E hënë – E shtunë, 09:00–18:00',
    image: require('../assets/images/shop-garden.png'),
  },
  {
    slug: 'elektro-prishtina',
    name: 'Elektro Prishtina',
    tagline: 'Pajisje të kontrolluara para shitjes.',
    description: 'Telefona dhe pajisje të përdorura, të kontrolluara para shitjes.',
    city: 'Prizren',
    phone: '+383 49 300 400',
    email: 'elektro@example.com',
    address: 'Qendra, Prizren',
    openingHours: 'E hënë – E premte, 10:00–19:00',
    image: require('../assets/images/shop-electronics.png'),
  },
  {
    slug: 'moda-gjakova',
    name: 'Moda Gjakova',
    tagline: 'Veshje dhe aksesorë të përdorur.',
    description: 'Këpucë, ora dhe rroba nga dyqani në qendër.',
    city: 'Gjakovë',
    phone: '+383 44 220 330',
    email: 'moda@example.com',
    address: 'Qendra, Gjakovë',
    openingHours: 'E hënë – E shtunë, 10:00–19:00',
    image: require('../assets/images/shop-clothes.png'),
  },
  {
    slug: 'sport-peja',
    name: 'Sport Peja',
    tagline: 'Pajisje për sport dhe qytet.',
    description: 'Biçikleta, topa dhe gjëra të thjeshta për sport.',
    city: 'Pejë',
    phone: '+383 49 510 610',
    email: 'sport@example.com',
    address: 'Rruga e Sportit, Pejë',
    openingHours: 'E hënë – E premte, 09:00–18:00',
    image: require('../assets/images/shop-sports.png'),
  },
];

export function shopBySlug(slug: string) {
  return demoShops.find((shop) => shop.slug === slug);
}
