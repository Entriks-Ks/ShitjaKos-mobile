import type { ImageSourcePropType } from 'react-native';

import { categoryIconName, categoryLabel, type LiveCategoryGroup } from '@/constants/catalog';
import type { DemoListing } from '@/constants/listings';
import type { DemoShop } from '@/constants/shops';
import { apiBaseUrl } from '@/lib/config';
import { ApiError, apiRequest, mediaUrl, readApiToken } from '@/lib/api';

const fallbackPhoto = require('@/assets/images/product-plant.png');
const fallbackShop = require('@/assets/images/shop-garden.png');

const cityToApi: Record<string, string> = {
  Prishtinë: 'Prishtina',
  Pejë: 'Peja',
  Gjakovë: 'Gjakova',
  Mitrovicë: 'Mitrovica',
  Podujevë: 'Podujeva',
};

export function apiCity(city: string) {
  return cityToApi[city] ?? city;
}

export function clientId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

type Media = { id: string; url: string; altText?: string | null };
type Seller = { kind: string; name: string; slug?: string | null };

export type ListingCard = {
  id: string;
  title: string;
  description?: string;
  priceCents: number | null;
  city: string;
  condition?: string | null;
  negotiable?: boolean;
  categoryId: string;
  status?: string;
  version?: number;
  publishedAt?: string | null;
  phoneVisible?: boolean;
  contactPhone?: string | null;
  seller: Seller;
  media: Media[];
};

export type ListingEdit = {
  id: string;
  version: number;
  title: string;
  description: string;
  owner: string;
  categoryId: string;
  intent: string;
  price: string;
  city: string;
  condition: string;
  negotiable: boolean;
  phoneVisible: boolean;
  contactPhone: string;
  attributes: Record<string, unknown>;
  media: Media[];
  status: string;
};

export type CategoryAttribute = {
  id: string;
  key: string;
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN';
  required: boolean;
  unit?: string | null;
  translations: { locale: string; label: string }[];
  options: unknown;
};

export type ApiCategory = {
  id: string;
  parentId: string | null;
  icon?: string | null;
  translations: { locale: string; name: string }[];
  attributes: CategoryAttribute[];
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  profile: {
    displayName: string | null;
    city: string | null;
    bio: string | null;
    phone: string | null;
  } | null;
};

export type Membership = {
  role: string;
  business: {
    id: string;
    publicName: string;
    legalName: string;
    city: string;
    phone: string;
    email: string;
    description: string | null;
    reviewStatus: string;
    shop: { slug: string; address: string | null; openingHours: string | null } | null;
  };
};

export type InboxItem = {
  id: string;
  title: string;
  otherName: string;
  preview: string;
  unread: number;
};

export type ChatMessage = {
  id: string;
  sequence: number;
  body: string;
  mine: boolean;
  createdAt: string;
};

export type ChatView = {
  id: string;
  title: string;
  otherName: string;
  listingId: string | null;
  canSend: boolean;
  blockedByMe: boolean;
  messages: ChatMessage[];
  hasMore: boolean;
};

const conditionText: Record<string, { sq: string; en: string; de: string }> = {
  NEW: { sq: 'E re', en: 'New', de: 'Neu' },
  LIKE_NEW: { sq: 'Si e re', en: 'Like new', de: 'Wie neu' },
  USED: { sq: 'E përdorur', en: 'Used', de: 'Gebraucht' },
  DEFECTIVE: { sq: 'Me defekt', en: 'Defective', de: 'Defekt' },
  FOR_PARTS: { sq: 'Për pjesë', en: 'For parts', de: 'Für Ersatzteile' },
};

function ago(iso?: string | null) {
  if (!iso) return { sq: 'Tani', en: 'Just now', de: 'Gerade' };
  const hours = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 3600000));
  if (hours < 24) {
    return { sq: `${hours} orë më parë`, en: `${hours} hours ago`, de: `vor ${hours} Std.` };
  }
  const days = Math.max(1, Math.round(hours / 24));
  return { sq: `${days} ditë më parë`, en: `${days} days ago`, de: `vor ${days} Tagen` };
}

function categoryTranslation(item: ApiCategory, locale: string) {
  return (
    item.translations.find((row) => row.locale === locale)?.name ??
    item.translations.find((row) => row.locale === 'en')?.name ??
    item.translations[0]?.name ??
    item.id
  );
}

export function groupCategories(items: ApiCategory[], locale: string): LiveCategoryGroup[] {
  return items
    .filter((item) => !item.parentId)
    .map((parent) => ({
      id: parent.id,
      icon: categoryIconName(parent.icon || 'Package'),
      label: categoryTranslation(parent, locale),
      children: items
        .filter((item) => item.parentId === parent.id)
        .map((child) => ({ id: child.id, label: categoryTranslation(child, locale) })),
    }));
}

function listingCategoryLabel(categoryId: string) {
  const item = categoryItems.find((row) => row.id === categoryId);
  if (!item) return categoryLabel(categoryId, 'sq') || categoryId;
  if (!item.parentId) return categoryTranslation(item, 'sq');
  const parent = categoryItems.find((row) => row.id === item.parentId);
  const name = categoryTranslation(item, 'sq');
  return parent ? `${categoryTranslation(parent, 'sq')} · ${name}` : name;
}

export function cardToListing(item: ListingCard): DemoListing {
  const label = listingCategoryLabel(item.categoryId);
  const photos = item.media.map((media) => mediaUrl(media.url)).filter(Boolean);
  const image: ImageSourcePropType = photos[0] ? { uri: photos[0] } : fallbackPhoto;
  const sellerName = item.seller?.name || 'Shitës';
  return {
    id: item.id,
    title: item.title,
    price: (item.priceCents ?? 0) / 100,
    city: item.city,
    categoryId: item.categoryId,
    shopSlug: item.seller?.slug ?? undefined,
    description: item.description ?? '',
    icon: 'bag',
    tone: '#eef4ee',
    image,
    ago: ago(item.publishedAt),
    seller: { sq: sellerName, en: sellerName, de: sellerName },
    category: { sq: label, en: label, de: label },
    negotiable: item.negotiable,
    conditionText: item.condition ? conditionText[item.condition] : undefined,
    phone: item.contactPhone ?? undefined,
    status: item.status === 'DRAFT' ? 'draft' : 'published',
    lifecycle: item.status,
    photoCount: photos.length,
    photos,
  };
}

let categoriesRequest: Promise<ApiCategory[]> | null = null;
let categoryItems: ApiCategory[] = [];

export function loadCategories() {
  categoriesRequest ??= apiRequest<{ items: ApiCategory[] }>('/api/v1/categories').then((result) => {
    categoryItems = result.items;
    return result.items;
  });
  return categoriesRequest;
}

async function listingsWithCategories(items: ListingCard[]) {
  await loadCategories().catch(() => []);
  return items.map(cardToListing);
}

export async function searchListings(query: {
  q?: string;
  category?: string;
  city?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.category) params.set('category', query.category);
  if (query.city) params.set('city', apiCity(query.city));
  if (query.sort === 'newest' || query.sort === 'price-asc' || query.sort === 'price-desc') {
    params.set('sort', query.sort);
  }
  params.set('page', String(query.page ?? 1));
  params.set('limit', String(query.limit ?? 20));
  const result = await apiRequest<{ items: ListingCard[] }>(`/api/v1/listings?${params}`);
  return listingsWithCategories(result.items);
}

export async function getListing(id: string) {
  const item = await apiRequest<ListingCard>(`/api/v1/listings/${encodeURIComponent(id)}`);
  const [listing] = await listingsWithCategories([item]);
  return listing;
}

export function getListingEdit(id: string) {
  return apiRequest<ListingEdit>(`/api/v1/listings/${encodeURIComponent(id)}/edit`);
}

export function createListing(body: Record<string, unknown>) {
  return apiRequest<{ id: string }>('/api/v1/listings', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateListing(id: string, body: Record<string, unknown>) {
  return apiRequest<{ id: string }>(`/api/v1/listings/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function setListingStatus(id: string, status: 'PUBLISHED' | 'PAUSED' | 'SOLD' | 'CLOSED') {
  return apiRequest<{ id: string; status: string }>(`/api/v1/listings/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export function publishListing(id: string) {
  return setListingStatus(id, 'PUBLISHED');
}

export function deleteListing(id: string) {
  return apiRequest<{ ok: true }>(`/api/v1/listings/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function deleteListingPhoto(id: string, mediaId: string) {
  return apiRequest<{ ok: true }>(
    `/api/v1/listings/${encodeURIComponent(id)}/media/${encodeURIComponent(mediaId)}`,
    { method: 'DELETE' },
  );
}

function photoPart(uri: string, mime?: string | null) {
  const type = (mime ?? '').toLowerCase();
  if (type === 'image/png') return { name: 'listing.png', type: 'image/png' };
  if (type === 'image/webp') return { name: 'listing.webp', type: 'image/webp' };
  if (type === 'image/jpeg' || type === 'image/jpg') return { name: 'listing.jpg', type: 'image/jpeg' };
  const path = uri.split('?')[0].toLowerCase();
  if (path.endsWith('.png')) return { name: 'listing.png', type: 'image/png' };
  if (path.endsWith('.webp')) return { name: 'listing.webp', type: 'image/webp' };
  return { name: 'listing.jpg', type: 'image/jpeg' };
}

function uploadPhotoFile(url: string, uri: string, name: string, type: string, token: string) {
  return new Promise<void>((resolve, reject) => {
    const form = new FormData();
    form.append('file', { uri, name, type } as unknown as Blob);
    const request = new XMLHttpRequest();
    request.open('POST', url);
    request.setRequestHeader('Accept', 'application/json');
    if (token) request.setRequestHeader('Authorization', `Bearer ${token}`);
    request.onload = () => {
      let message = 'Photo upload failed. Try again.';
      let parsed: { error?: string } = {};
      if (request.responseText) {
        try {
          parsed = JSON.parse(request.responseText) as { error?: string };
        } catch {
          parsed = {};
        }
      }
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }
      reject(new ApiError(request.status, parsed.error || message));
    };
    request.onerror = () => reject(new ApiError(0, 'Photo upload failed. Try again.'));
    request.send(form);
  });
}

export async function uploadListingPhoto(id: string, uri: string, mime?: string | null) {
  const file = photoPart(uri, mime);
  const token = await readApiToken();
  const url = `${apiBaseUrl}/api/v1/listings/${encodeURIComponent(id)}/media`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await uploadPhotoFile(url, uri, file.name, file.type, token);
      return { id: '' };
    } catch (cause) {
      if (!(cause instanceof ApiError) || cause.status !== 409 || attempt === 2) throw cause;
    }
  }
  throw new ApiError(409, 'Conflicting change. Refresh and retry.');
}

export function myListings() {
  return apiRequest<{ items: ListingCard[] }>('/api/v1/me/listings?limit=50').then((result) =>
    listingsWithCategories(result.items),
  );
}

export function favoriteListings() {
  return apiRequest<{ items: ListingCard[] }>('/api/v1/favorites?limit=50').then((result) =>
    listingsWithCategories(result.items),
  );
}

export function setFavorite(id: string, saved: boolean) {
  return apiRequest<{ saved: boolean }>(`/api/v1/favorites/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ saved }),
  });
}

export function getProfile() {
  return apiRequest<Profile>('/api/v1/me');
}

export function updateProfile(body: {
  name: string;
  displayName: string;
  city: string;
  bio: string;
  phone: string;
}) {
  return apiRequest<{ ok: true }>('/api/v1/me', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function myBusinesses() {
  return apiRequest<{ items: Membership[] }>('/api/v1/me/businesses?limit=50');
}

export function createBusiness(body: {
  legalName: string;
  publicName: string;
  city: string;
  phone: string;
  email: string;
  description: string;
  address: string;
  openingHours: string;
}) {
  return apiRequest<{ id: string }>('/api/v1/businesses', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

type ShopRow = {
  slug: string;
  tagline: string | null;
  address: string | null;
  openingHours: string | null;
  business: {
    publicName: string;
    description: string | null;
    city: string;
    phone: string;
    email: string;
  };
};

function shopCard(shop: ShopRow): DemoShop {
  return {
    slug: shop.slug,
    name: shop.business.publicName,
    tagline: shop.tagline || shop.business.description || '',
    description: shop.business.description || '',
    city: shop.business.city,
    phone: shop.business.phone,
    email: shop.business.email,
    address: shop.address || '',
    openingHours: shop.openingHours || '',
    image: fallbackShop,
  };
}

export function publicShops() {
  return apiRequest<{ items: ShopRow[] }>('/api/v1/shops?limit=50').then((result) =>
    result.items.map(shopCard),
  );
}

export async function publicShop(slug: string) {
  const shop = await apiRequest<ShopRow & { listings: { items: ListingCard[] } }>(
    `/api/v1/shops/${encodeURIComponent(slug)}`,
  );
  return { shop: shopCard(shop), listings: await listingsWithCategories(shop.listings.items) };
}

export function inbox() {
  return apiRequest<{ items: InboxItem[]; hasMore: boolean }>('/api/v1/conversations?page=1');
}

export function chatView(id: string) {
  return apiRequest<ChatView>(`/api/v1/conversations/${encodeURIComponent(id)}/messages`);
}

export function startConversation(listingId: string, body: string) {
  return apiRequest<{ conversationId: string }>('/api/v1/conversations', {
    method: 'POST',
    body: JSON.stringify({ listingId, body, clientId: clientId() }),
  });
}

export function sendConversationMessage(id: string, body: string, requestId = clientId()) {
  return apiRequest<ChatMessage>(`/api/v1/conversations/${encodeURIComponent(id)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body, clientId: requestId }),
  });
}

export function markConversationRead(id: string, sequence: number) {
  return apiRequest<{ ok: true }>(`/api/v1/conversations/${encodeURIComponent(id)}/read`, {
    method: 'PUT',
    body: JSON.stringify({ sequence }),
  });
}

export function setConversationBlocked(id: string, blocked: boolean) {
  return apiRequest<{ ok: true }>(`/api/v1/conversations/${encodeURIComponent(id)}/block`, {
    method: 'PUT',
    body: JSON.stringify({ blocked }),
  });
}

export function reportConversationMessage(id: string, messageId: string, reason: string) {
  return apiRequest<{ ok: true }>(
    `/api/v1/conversations/${encodeURIComponent(id)}/messages/${encodeURIComponent(messageId)}/report`,
    { method: 'POST', body: JSON.stringify({ reason }) },
  );
}

const listingConversations = new Map<string, string>();

export function rememberConversation(listingId: string, conversationId: string) {
  if (listingId && conversationId) listingConversations.set(listingId, conversationId);
}

export async function conversationForListing(listingId: string) {
  const known = listingConversations.get(listingId);
  if (known) return known;
  const page = await inbox();
  for (const item of page.items) {
    const view = await chatView(item.id);
    if (view.listingId) listingConversations.set(view.listingId, view.id);
    if (view.listingId === listingId) return view.id;
  }
  return null;
}
