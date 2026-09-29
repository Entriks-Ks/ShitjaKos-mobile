import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { ProductCard } from '@/components/ProductCard';
import { ReportSheet } from '@/components/ReportSheet';
import { ScreenBack } from '@/components/ScreenBack';
import { homeColors, homeCopy, type HomeLocale } from '@/constants/home';
import { formatPrice, type DemoListing } from '@/constants/listings';
import { useSession } from '@/lib/auth';
import { getListing, searchListings } from '@/lib/market';
import { useSaved } from '@/lib/saved';

function first(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

function localeOf(value: string): HomeLocale {
  return value === 'en' || value === 'de' ? value : 'sq';
}

const copy = {
  sq: {
    negotiable: 'Çmimi diskutohet',
    fixed: 'Çmim fiks',
    condition: 'Gjendja',
    used: 'E përdorur',
    location: 'Lokacioni',
    published: 'Publikuar',
    attributes: 'Atributet',
    category: 'Kategoria',
    sellerKind: 'Lloji i shitësit',
    verified: 'I verifikuar',
    privateSeller: 'Shitës privat',
    shopReply: 'Përgjigjet zakonisht brenda 1 ore',
    privateReply: 'Përgjigjet zakonisht brenda një dite',
    message: 'Mesazh',
    similar: 'Shpallje të ngjashme',
    report: 'Raporto problemin',
    reported: 'Raporti u dërgua.',
    share: 'Shiko këtë shpallje në ShitjaKos',
  },
  en: {
    negotiable: 'Price is negotiable',
    fixed: 'Fixed price',
    condition: 'Condition',
    used: 'Used',
    location: 'Location',
    published: 'Published',
    attributes: 'Attributes',
    category: 'Category',
    sellerKind: 'Seller type',
    verified: 'Verified',
    privateSeller: 'Private seller',
    shopReply: 'Usually replies within 1 hour',
    privateReply: 'Usually replies within a day',
    message: 'Message',
    similar: 'Similar listings',
    report: 'Report a problem',
    reported: 'Report sent.',
    share: 'See this listing on ShitjaKos',
  },
  de: {
    negotiable: 'Preis verhandelbar',
    fixed: 'Festpreis',
    condition: 'Zustand',
    used: 'Gebraucht',
    location: 'Ort',
    published: 'Veröffentlicht',
    attributes: 'Merkmale',
    category: 'Kategorie',
    sellerKind: 'Verkäufertyp',
    verified: 'Verifiziert',
    privateSeller: 'Privater Verkäufer',
    shopReply: 'Antwortet meist innerhalb 1 Stunde',
    privateReply: 'Antwortet meist innerhalb eines Tages',
    message: 'Nachricht',
    similar: 'Ähnliche Anzeigen',
    report: 'Problem melden',
    reported: 'Meldung gesendet.',
    share: 'Diese Anzeige auf ShitjaKos',
  },
};

export default function ListingScreen() {
  const params = useLocalSearchParams<{ id?: string; lang?: string }>();
  const locale = localeOf(first(params.lang));
  const t = homeCopy[locale];
  const text = copy[locale];
  const listingId = first(params.id);
  const { data: session } = useSession();
  const { isSaved, toggleSaved } = useSaved();
  const insets = useSafeAreaInsets();
  const [listing, setListing] = useState<DemoListing | null>(null);
  const [related, setRelated] = useState<DemoListing[]>([]);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [reportOpen, setReportOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const [galleryWidth, setGalleryWidth] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    let cancel = false;
    setPhase('loading');
    setPhotoIndex(0);
    getListing(listingId)
      .then(async (item) => {
        if (cancel) return;
        setListing(item);
        setPhase('ready');
        const items = await searchListings({ category: item.categoryId, limit: 8 }).catch(() => []);
        if (!cancel) setRelated(items.filter((entry) => entry.id !== listingId).slice(0, 4));
      })
      .catch(() => {
        if (!cancel) setPhase('missing');
      });
    return () => {
      cancel = true;
    };
  }, [listingId]);

  if (phase !== 'ready' || !listing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.pad}>
          <ScreenBack title={t.discover} />
          <Text style={styles.muted}>{phase === 'loading' ? 'Duke u ngarkuar…' : t.noResults}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const shop = listing.shopSlug
    ? { slug: listing.shopSlug, name: listing.seller[locale], phone: listing.phone }
    : undefined;
  const phone = listing.phone || shop?.phone;
  const conditionValue = listing.conditionText?.[locale] ?? text.used;
  const negotiable = listing.negotiable !== false;
  const personalName = listing.seller[locale];
  const sellerName =
    shop?.name ?? (personalName === 'Privat' || personalName === 'Private' ? text.privateSeller : personalName);
  const alreadyReported = reported;
  const attributes = [
    { label: text.condition, value: conditionValue },
    { label: text.category, value: listing.category[locale] },
    { label: text.sellerKind, value: listing.seller[locale] },
  ];

  function openMessage() {
    if (!session) {
      router.push('/login');
      return;
    }
    router.push(`/chat/${listingId}` as Href);
  }

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <SafeAreaView edges={['top']} style={styles.pad}>
          <ScreenBack title={listing.title} />
        </SafeAreaView>
        <View onLayout={(event) => setGalleryWidth(event.nativeEvent.layout.width)}>
          {listing.photos && listing.photos.length > 1 && galleryWidth > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const next = Math.round(event.nativeEvent.contentOffset.x / galleryWidth);
                setPhotoIndex(next);
              }}>
              {listing.photos.map((uri, index) => (
                <Image
                  key={`${uri}-${index}`}
                  source={{ uri }}
                  style={[styles.photo, { width: galleryWidth }]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <Image source={listing.image} style={styles.photo} resizeMode="cover" />
          )}
          {listing.photos && listing.photos.length > 1 ? (
            <View style={styles.dots}>
              {listing.photos.map((uri, index) => (
                <View key={`${uri}-${index}`} style={[styles.dot, index === photoIndex && styles.dotOn]} />
              ))}
            </View>
          ) : null}
        </View>
        <View style={styles.pad}>
          <Text style={styles.category}>{listing.category[locale].toUpperCase()}</Text>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.price}>{formatPrice(listing.price)}</Text>
          <Text style={styles.negotiable}>{negotiable ? text.negotiable : text.fixed}</Text>

          <View style={styles.facts}>
            <Fact label={text.condition} value={conditionValue} />
            <Fact label={text.location} value={listing.city} />
            <Fact label={text.published} value={listing.ago[locale]} />
          </View>

          <Text style={styles.description}>{listing.description}</Text>

          <Text style={styles.section}>{text.attributes}</Text>
          <View style={styles.panel}>
            {attributes.map((item) => (
              <View key={item.label} style={styles.attr}>
                <Text style={styles.attrLabel}>{item.label}</Text>
                <Text style={styles.attrValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>{text.sellerKind}</Text>
          <Pressable
            style={styles.seller}
            disabled={!shop}
            onPress={() => shop && router.push(`/shops/${shop.slug}?lang=${locale}` as Href)}>
            <View style={styles.sellerIcon}>
              <AppIcon name={shop ? 'store' : 'person'} size={18} color="#235641" />
            </View>
            <View style={styles.sellerCopy}>
              <Text style={styles.sellerName}>{sellerName}</Text>
              <View style={styles.sellerMeta}>
                {shop ? (
                  <>
                    <AppIcon name="shield" size={12} color={homeColors.leaf} />
                    <Text style={styles.verified}>{text.verified}</Text>
                  </>
                ) : (
                  <Text style={styles.muted}>{listing.seller[locale]}</Text>
                )}
              </View>
              <Text style={styles.reply}>{shop ? text.shopReply : text.privateReply}</Text>
            </View>
            {shop ? <AppIcon name="arrowUpRight" size={16} color={homeColors.muted} /> : null}
          </Pressable>

          <Pressable style={styles.report} onPress={() => setReportOpen(true)}>
            <AppIcon name="flag" size={14} color={homeColors.muted} />
            <Text style={styles.reportText}>{alreadyReported ? text.reported : text.report}</Text>
          </Pressable>

          {related.length ? (
            <>
              <Text style={styles.section}>{text.similar}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.related}>
                {related.map((item) => (
                  <ProductCard
                    key={item.id}
                    listing={item}
                    locale={locale}
                    width={148}
                    liked={isSaved(item.id)}
                    onPress={() => router.push(`/listing/${item.id}?lang=${locale}` as Href)}
                    onToggleSaved={() => toggleSaved(item.id)}
                  />
                ))}
              </ScrollView>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable style={styles.iconButton} onPress={() => toggleSaved(listing.id)} hitSlop={6}>
          <AppIcon
            name={isSaved(listing.id) ? 'heart' : 'heartOutline'}
            size={20}
            color={isSaved(listing.id) ? '#c45b4b' : homeColors.forest}
          />
        </Pressable>
        <Pressable
          style={styles.iconButton}
          hitSlop={6}
          onPress={() =>
            Share.share({
              message: `${listing.title} · ${formatPrice(listing.price)} · ${listing.city}. ${text.share}`,
            })
          }>
          <AppIcon name="share" size={20} color={homeColors.forest} />
        </Pressable>
        {phone ? (
          <Pressable style={styles.iconButton} hitSlop={6} onPress={() => Linking.openURL(`tel:${phone}`)}>
            <AppIcon name="phone" size={20} color={homeColors.forest} />
          </Pressable>
        ) : null}
        <Pressable style={styles.message} onPress={openMessage}>
          <Text style={styles.messageText}>{text.message}</Text>
        </Pressable>
      </View>

      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={() => {
          setReported(true);
          setReportOpen(false);
        }}
      />
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: homeColors.cream,
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  content: {
    paddingBottom: 24,
  },
  pad: {
    paddingHorizontal: 16,
  },
  photo: {
    height: 280,
    width: '100%',
    backgroundColor: '#e7ece3',
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotOn: {
    backgroundColor: '#fff',
    width: 18,
  },
  category: {
    marginTop: 14,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: homeColors.muted,
  },
  title: {
    marginTop: 4,
    fontFamily: 'GeistSemiBold',
    fontSize: 26,
    lineHeight: 30,
    color: '#1f302a',
  },
  price: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '800',
    color: homeColors.forest,
  },
  negotiable: {
    marginTop: 2,
    color: homeColors.leaf,
    fontSize: 13,
    fontWeight: '700',
  },
  facts: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: homeColors.line,
    paddingHorizontal: 14,
  },
  fact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f4ee',
  },
  factLabel: {
    color: homeColors.muted,
    fontSize: 13,
  },
  factValue: {
    color: homeColors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    marginTop: 14,
    color: homeColors.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '800',
    color: homeColors.ink,
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: homeColors.line,
    paddingHorizontal: 14,
  },
  attr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f4ee',
  },
  attrLabel: {
    color: '#7d8c82',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  attrValue: {
    color: homeColors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  seller: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: homeColors.line,
    padding: 14,
  },
  sellerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef4ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerCopy: {
    flex: 1,
    gap: 2,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '800',
    color: homeColors.ink,
  },
  sellerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verified: {
    color: homeColors.leaf,
    fontSize: 12,
    fontWeight: '700',
  },
  reply: {
    color: homeColors.muted,
    fontSize: 12,
  },
  report: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportText: {
    color: homeColors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  related: {
    gap: 12,
    paddingRight: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: homeColors.line,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: homeColors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    backgroundColor: '#235641',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  muted: {
    color: homeColors.muted,
    fontSize: 14,
  },
});
