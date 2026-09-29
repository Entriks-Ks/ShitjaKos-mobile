import type { AppIconName } from '@/components/AppIcon';
import type { HomeLocale } from '@/constants/home';

type Label = Record<HomeLocale, string>;

export type CatalogGroup = {
  id: string;
  icon: AppIconName;
  label: Label;
  children: { id: string; label: Label }[];
};

function item(id: string, sq: string, en: string, de: string) {
  return { id, label: { sq, en, de } };
}

export const catalogGroups: CatalogGroup[] = [
  {
    id: 'tickets',
    icon: 'ticket',
    label: { sq: 'Bileta', en: 'Tickets', de: 'Tickets & Eintrittskarten' },
    children: [
      item('concerts', 'Koncerte', 'Concerts', 'Konzerte'),
      item('theatre-music', 'Teatër dhe muzikë', 'Theatre & Musik', 'Theater & Musik'),
      item('vouchers', 'Kuponë', 'Voucher', 'Gutscheine'),
      item('sport-tickets', 'Sport', 'Sport', 'Sport'),
    ],
  },
  {
    id: 'home',
    icon: 'house',
    label: { sq: 'Shtëpi dhe kopsht', en: 'Home & Garden', de: 'Haus & Garten' },
    children: [
      item('furniture', 'Dhomë ndenjeje', 'Living room', 'Wohnzimmer'),
      item('appliances', 'Kuzhinë dhe dhomë ngrënieje', 'Kitchen & Dining room', 'Küche & Esszimmer'),
      item('bathroom', 'Banjë', 'Bathroom', 'Badezimmer'),
      item('decoration', 'Dekorime', 'Decoration', 'Dekoration'),
      item('garden', 'Pajisje kopshti dhe bimë', 'Garden accessories & plants', 'Gartenzubehör & Pflanzen'),
    ],
  },
  {
    id: 'business-equipment',
    icon: 'briefcase',
    label: { sq: 'Biznes dhe pajisje', en: 'Business & Equipment', de: 'Gewerbe & Einzelhandel' },
    children: [
      item('machines', 'Makineri', 'Machine', 'Maschinen'),
      item('office-supplies', 'Pajisje zyre', 'Office', 'Bürobedarf'),
      item('agriculture', 'Bujqësi', 'Agriculture', 'Landwirtschaft'),
    ],
  },
  {
    id: 'auto',
    icon: 'car',
    label: { sq: 'Automjete, biçikleta dhe varka', en: 'Auto', de: 'Auto, Rad & Boot' },
    children: [
      item('cars', 'Vetura', 'Cars', 'Autos'),
      item('bicycles', 'Biçikleta', 'Bicycles', 'Fahrräder'),
      item('motorcycles', 'Motoçikleta', 'Motorcycles', 'Motorräder'),
      item('car-parts', 'Pjesë dhe aksesorë veturash', 'Car parts', 'Autoteile & Zubehör'),
    ],
  },
  {
    id: 'electronics',
    icon: 'phone',
    label: { sq: 'Elektronikë', en: 'Electronics', de: 'Elektronik' },
    children: [
      item('phones', 'Telefona dhe tableta', 'Mobile phones & Tablets', 'Smartphones & Tablets'),
      item('computers', 'Kompjuterë dhe laptopë', 'PCs, Laptop & Notebooks', 'PCs, Laptops & Notebooks'),
      item('tvs', 'Televizorë', 'TVs', 'TV & Fernseher'),
      item('gaming', 'Videolojëra dhe konzola', 'Gaming', 'Videospiele & Konsolen'),
      item('audio', 'Audio dhe fotografi', 'Audio & Photo', 'Audio & Foto'),
    ],
  },
  {
    id: 'family',
    icon: 'person',
    label: { sq: 'Familje, fëmijë dhe bebe', en: 'Family, Kid & Baby', de: 'Familie, Kind & Baby' },
    children: [
      item('children-clothing', 'Rroba për bebe dhe fëmijë', 'Baby & Children’s clothing', 'Baby- & Kinderkleidung'),
      item('toys', 'Lodra', 'Toys', 'Spielzeug'),
      item('baby', 'Pajisje për bebe', 'Baby equipment', 'Babyausstattung'),
    ],
  },
  {
    id: 'pets',
    icon: 'heart',
    label: { sq: 'Kafshë shtëpiake', en: 'Pets', de: 'Haustiere' },
    children: [
      item('dogs', 'Qen', 'Dogs', 'Hunde'),
      item('cats', 'Mace', 'Cats', 'Katzen'),
      item('pet-care', 'Kujdes dhe aksesorë për kafshë', 'Pet care & Accessories', 'Tierpflege & Zubehör'),
    ],
  },
  {
    id: 'sports',
    icon: 'basketball',
    label: { sq: 'Kohë e lirë, hobi dhe fqinjësi', en: 'Free time & hobbies', de: 'Freizeit & Hobby' },
    children: [
      item('food-drinks', 'Ushqime dhe pije', 'Food & Drinks', 'Essen & Trinken'),
      item('outdoors', 'Sport dhe kamping', 'Sport & Camping', 'Sport & Camping'),
      item('handmade', 'Punime me dorë', 'Handcraft & Handmade', 'Handarbeit & Bastelei'),
    ],
  },
  {
    id: 'fashion-beauty',
    icon: 'bag',
    label: { sq: 'Modë dhe bukuri', en: 'Mode & Beauty', de: 'Mode & Schönheit' },
    children: [
      item('women-clothing', 'Rroba për gra', 'Women’s clothes', 'Damenbekleidung'),
      item('men-clothing', 'Rroba për burra', 'Man’s clothes', 'Herrenbekleidung'),
      item('bags-accessories', 'Çanta dhe aksesorë', 'Bags & Accessories', 'Tasche & Accessoires'),
    ],
  },
  {
    id: 'books',
    icon: 'tv',
    label: { sq: 'Muzikë, filma dhe libra', en: 'Music, film & books', de: 'Musik, Film & Bücher' },
    children: [
      item('books-media', 'Libra dhe revista', 'Books & Magazines', 'Bücher & Zeitschriften'),
      item('films-dvd', 'Filma dhe DVD', 'Film & DVD', 'Filme & DVDs'),
      item('instruments', 'Instrumente muzikore', 'Music Instruments', 'Musikinstrumente'),
    ],
  },
  {
    id: 'give-away',
    icon: 'tag',
    label: { sq: 'Falas', en: 'Give away', de: 'Zu verschenken' },
    children: [item('free-items', 'Artikuj falas', 'Free / Give away items', 'Kostenlose Artikel')],
  },
];

const apiIcons: Record<string, AppIconName> = {
  Ticket: 'ticket',
  House: 'house',
  Armchair: 'house',
  Store: 'store',
  BriefcaseBusiness: 'briefcase',
  CarFront: 'car',
  Car: 'car',
  Smartphone: 'phone',
  Laptop: 'phone',
  Baby: 'person',
  PawPrint: 'heart',
  Tent: 'basketball',
  Dumbbell: 'basketball',
  Handbag: 'bag',
  Shirt: 'shirt',
  Clapperboard: 'tv',
  BookOpen: 'tv',
  Gift: 'tag',
  Package: 'grid',
  Wrench: 'briefcase',
};

export function categoryIconName(icon: string): AppIconName {
  return apiIcons[icon] ?? 'grid';
}

export type LiveCategoryGroup = {
  id: string;
  icon: AppIconName;
  label: string;
  children: { id: string; label: string }[];
};

export function localCategoryGroups(locale: HomeLocale): LiveCategoryGroup[] {
  return catalogGroups.map((group) => ({
    id: group.id,
    icon: group.icon,
    label: group.label[locale],
    children: group.children.map((child) => ({ id: child.id, label: child.label[locale] })),
  }));
}

export function groupCategoryLabel(groups: LiveCategoryGroup[], id: string) {
  for (const group of groups) {
    if (group.id === id) return group.label;
    const child = group.children.find((item) => item.id === id);
    if (child) return `${group.label} · ${child.label}`;
  }
  return '';
}

export function categoryLabel(id: string, locale: HomeLocale) {
  for (const group of catalogGroups) {
    if (group.id === id) return group.label[locale];
    const child = group.children.find((item) => item.id === id);
    if (child) return `${group.label[locale]} · ${child.label[locale]}`;
  }
  return '';
}

export function listingMatchesCategory(listingCategoryId: string, selected: string) {
  if (!selected) return true;
  if (listingCategoryId === selected) return true;
  if (
    (selected === 'fashion-beauty' && listingCategoryId === 'clothes') ||
    (selected === 'clothes' && listingCategoryId === 'fashion-beauty')
  ) {
    return true;
  }
  const selectedGroup = catalogGroups.find((group) => group.id === selected);
  if (selectedGroup?.children.some((child) => child.id === listingCategoryId)) return true;
  const parent = catalogGroups.find((group) => group.children.some((child) => child.id === selected));
  return parent?.id === listingCategoryId;
}
