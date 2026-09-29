import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/AppIcon';
import { AuthScreen } from '@/components/AuthScreen';
import { LoginForm } from '@/components/LoginForm';
import { countries, countryById } from '@/constants/places';
import { formatPrice } from '@/constants/listings';
import { ApiError } from '@/lib/api';
import { refreshSession, signOut, useSession } from '@/lib/auth';
import { useBusinesses } from '@/lib/businesses';
import { apiCity, deleteListing, getProfile, setListingStatus, updateProfile } from '@/lib/market';
import { useMine } from '@/lib/mine';

type Panel = 'hub' | 'overview' | 'details' | 'shops';

const green = '#1f7a46';
const ink = '#1a2e24';
const muted = '#8a938c';

export default function ProfileScreen() {
  const { data: session } = useSession();
  const { mine, reloadMine } = useMine();
  const { businesses } = useBusinesses();
  const [panel, setPanel] = useState<Panel>('hub');
  const [name, setName] = useState(session?.user.name ?? '');
  const [displayName, setDisplayName] = useState(session?.user.name ?? '');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [verified, setVerified] = useState(false);
  const [countryId, setCountryId] = useState('xk');
  const [city, setCity] = useState('Prishtina');
  const [detailError, setDetailError] = useState('');
  const [placeSheet, setPlaceSheet] = useState<'country' | 'city' | null>(null);
  const [menu, setMenu] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [actionError, setActionError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancel = false;
    getProfile()
      .then((profile) => {
        if (cancel) return;
        setVerified(profile.emailVerified);
        setName(profile.name);
        setDisplayName(profile.profile?.displayName || profile.name);
        setPhone(profile.profile?.phone ?? '');
        setBio(profile.profile?.bio ?? '');
        if (profile.profile?.city) {
          setCity(profile.profile.city);
          const match = countries.find((item) =>
            (item.cities as readonly string[]).includes(profile.profile?.city ?? ''),
          );
          if (match) setCountryId(match.id);
        }
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [session]);

  async function saveDetails() {
    if (!session) return;
    if (name.trim().length < 2 || displayName.trim().length < 2) {
      setDetailError('Name and public seller name need at least 2 characters.');
      return;
    }
    try {
      await updateProfile({
        name: name.trim(),
        displayName: displayName.trim(),
        city: apiCity(city),
        bio: bio.trim(),
        phone: phone.trim(),
      });
      await refreshSession();
      setDetailError('');
      setPanel('hub');
    } catch (cause) {
      setDetailError(cause instanceof ApiError ? cause.message : 'Could not save your details.');
    }
  }

  if (!session) {
    return (
      <AuthScreen embedded title="Your Connection to the Western Balkans Marketplaces" subtitle="Log in or register">
        <LoginForm />
      </AuthScreen>
    );
  }

  const firstName = (name || session.user.name).split(' ')[0] || session.user.name;
  const country = countryById(countryId) ?? countries[0];
  const initials = (displayName || name || session.user.name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  const publishedCount = mine.filter((listing) => (listing.lifecycle ?? 'PUBLISHED') === 'PUBLISHED').length;

  async function changeStatus(id: string, status: 'PUBLISHED' | 'PAUSED' | 'SOLD') {
    setBusyId(id);
    setActionError('');
    try {
      await setListingStatus(id, status);
      reloadMine();
    } catch (cause) {
      setActionError(
        cause instanceof ApiError && cause.status === 422
          ? 'Add at least one photo in Edit / photos, then publish again.'
          : cause instanceof ApiError
            ? cause.message
            : 'Could not update the listing.',
      );
    } finally {
      setBusyId('');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    setActionError('');
    try {
      await deleteListing(deleteTarget.id);
      setDeleteTarget(null);
      reloadMine();
    } catch (cause) {
      setActionError(cause instanceof ApiError ? cause.message : 'Could not delete the listing.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.brand}>
          shitja<Text style={styles.brandKos}>kos</Text>
          <Text style={styles.brandDot}>.</Text>
        </Text>
        <View style={styles.headerActions}>
          <Pressable hitSlop={8} onPress={() => router.push('/cart' as Href)}>
            <AppIcon name="heartOutline" size={22} color={ink} />
          </Pressable>
          <Pressable hitSlop={8} onPress={() => setMenu(true)}>
            <AppIcon name="menu" size={22} color={ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {panel === 'hub' ? (
          <>
            <View style={styles.helloCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || 'SK'}</Text>
              </View>
              <View style={styles.helloCopy}>
                <Text style={styles.hello}>{displayName || session.user.name}</Text>
                <Text style={styles.since}>Member since Sept 2026</Text>
                <View style={styles.verified}>
                  <AppIcon name="check" size={12} color={verified ? green : muted} />
                  <Text style={styles.verifiedText}>{verified ? 'Email verified' : 'Email not verified'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your details</Text>
              <Detail icon="person" text={displayName || session.user.name} />
              <Detail icon="mail" text={session.user.email} />
              <Detail icon="phone" text={phone || 'No phone number added'} />
              <Detail icon="pin" text={city ? `${city}, ${country.names.en}` : 'City not added'} />
              <Pressable style={styles.editBar} onPress={() => setPanel('details')}>
                <AppIcon name="pencil" size={16} color={green} />
                <Text style={styles.editText}>Edit your details</Text>
                <AppIcon name="chevronRight" size={16} color={green} />
              </Pressable>
            </View>

            <View style={styles.card}>
              <Option icon="grid" label="Overview" onPress={() => setPanel('overview')} />
              <Option icon="person" label="Personal details" onPress={() => setPanel('details')} />
              <Option icon="heart" label="My favorites" onPress={() => router.push('/cart' as Href)} />
              <Option icon="store" label="My shops" onPress={() => setPanel('shops')} />
              <Option icon="bubble" label="Messages" onPress={() => router.navigate('/(tabs)/messages' as Href)} />
              <Option icon="house" label="Back to marketplace" onPress={() => router.navigate('/(tabs)' as Href)} />
              <Option icon="logout" label="Sign out" onPress={() => signOut()} />
            </View>
          </>
        ) : null}

        {panel === 'details' ? (
          <View style={styles.card}>
            <Pressable onPress={() => setPanel('hub')} hitSlop={8}>
              <Text style={styles.back}>← Back</Text>
            </Pressable>
            <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
            <Text style={styles.hello}>Make yourself at home.</Text>
            <Text style={styles.lead}>A few details help make your account feel like yours.</Text>
            <Text style={styles.cardTitle}>Personal details</Text>
            <Text style={styles.lead}>Your account information and how buyers know you.</Text>
            <Text style={styles.fieldLabel}>Your name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              autoComplete="name"
              maxLength={100}
              placeholder="Your name"
              placeholderTextColor="#b0b7b2"
              style={styles.input}
            />
            <Text style={styles.hint}>Used for your account greeting.</Text>
            <Text style={styles.fieldLabel}>Public seller name</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={100}
              placeholder="Name shown to buyers"
              placeholderTextColor="#b0b7b2"
              style={styles.input}
            />
            <Text style={styles.hint}>Shown on your personal listings.</Text>
            <Text style={styles.fieldLabel}>Phone number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+383 …"
              placeholderTextColor="#b0b7b2"
              keyboardType="phone-pad"
              maxLength={30}
              style={styles.input}
            />
            <Text style={styles.hint}>Private account detail. Choose phone visibility separately on each listing.</Text>
            <Text style={styles.fieldLabel}>Country</Text>
            <Pressable style={styles.select} onPress={() => setPlaceSheet('country')}>
              <Text style={styles.selectText}>{country.names.en}</Text>
              <AppIcon name="chevronRight" size={16} color="#8a938c" />
            </Pressable>
            <Text style={styles.fieldLabel}>City</Text>
            <Pressable style={styles.select} onPress={() => setPlaceSheet('city')}>
              <Text style={styles.selectText}>{city}</Text>
              <AppIcon name="chevronRight" size={16} color="#8a938c" />
            </Pressable>
            <Text style={styles.fieldLabel}>About you</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="A little about you and what you like to sell."
              placeholderTextColor="#b0b7b2"
              multiline
              maxLength={500}
              style={styles.area}
            />
            <Text style={styles.hint}>{bio.length}/500 characters</Text>
            {detailError ? <Text style={styles.lead}>{detailError}</Text> : null}
            <Pressable style={styles.primary} onPress={() => void saveDetails()}>
              <Text style={styles.primaryText}>Save changes</Text>
            </Pressable>
            <Text style={styles.cardTitle}>Sign-in & security</Text>
            <Text style={styles.lead}>Keep your account accessible and protected.</Text>
            <Text style={styles.fieldLabel}>Email address</Text>
            <Text style={styles.inputRead}>{session.user.email}</Text>
            <Text style={styles.hint}>{verified ? 'Verified' : 'Unverified'}</Text>
            <Text style={styles.fieldLabel}>Password</Text>
            <Text style={styles.hint}>Use an email link to set a new password.</Text>
            <Pressable style={styles.secondary} onPress={() => router.push('/forgot' as Href)}>
              <Text style={styles.secondaryText}>Reset password</Text>
            </Pressable>
          </View>
        ) : null}

        {panel === 'shops' ? (
          <View style={styles.card}>
            <Pressable onPress={() => setPanel('hub')} hitSlop={8}>
              <Text style={styles.back}>← Back</Text>
            </Pressable>
            <Text style={styles.cardTitle}>Your shops</Text>
            <Text style={styles.lead}>Your personal profile and business memberships, in one place.</Text>
            {businesses.length ? (
              businesses.map((business) => (
                <View key={business.id} style={styles.listing}>
                  <Text style={styles.listingTitle}>{business.publicName}</Text>
                  <Text style={styles.listingMeta}>
                    {business.city} · {business.role === 'OWNER' ? 'Owner' : 'Staff'} ·{' '}
                    {business.reviewStatus === 'APPROVED'
                      ? 'Approved'
                      : business.reviewStatus === 'REJECTED'
                        ? 'Review declined'
                        : 'Awaiting review'}
                  </Text>
                  {business.reviewStatus !== 'APPROVED' ? (
                    <Text style={styles.hint}>
                      {business.reviewStatus === 'REJECTED'
                        ? 'This shop is not public because its review was declined.'
                        : 'Your shop will be public once its review is complete.'}
                    </Text>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.lead}>You have not opened a shop yet.</Text>
            )}
            <Pressable style={styles.primary} onPress={() => router.push('/business/new' as Href)}>
              <Text style={styles.primaryText}>Open a shop</Text>
            </Pressable>
          </View>
        ) : null}

        {panel === 'overview' ? (
          <>
            <Pressable onPress={() => setPanel('hub')} hitSlop={8}>
              <Text style={styles.back}>← Back</Text>
            </Pressable>
            <Text style={styles.eyebrow}>YOUR MARKETPLACE CORNER</Text>
            <Text style={styles.hello}>Hello, {firstName}.</Text>
            <Text style={styles.lead}>Your listings, your shops, and everything in between.</Text>
            <Pressable style={styles.editBar} onPress={() => setPanel('details')}>
              <AppIcon name="pencil" size={16} color={green} />
              <Text style={styles.editText}>Edit your profile</Text>
            </Pressable>
            <View style={styles.stats}>
              <Stat value={mine.length} label="Your listings" />
              <Stat value={publishedCount} label="Published" />
              <Stat value={businesses.length} label="Your shops" />
            </View>
            {actionError ? <Text style={styles.lead}>{actionError}</Text> : null}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your listings</Text>
              <Text style={styles.lead}>Manage your items from their first draft to the final sale.</Text>
              {mine.length ? (
                mine.map((listing) => {
                  const life = listing.lifecycle ?? (listing.status === 'draft' ? 'DRAFT' : 'PUBLISHED');
                  const closed = life === 'SOLD' || life === 'CLOSED';
                  return (
                    <View key={listing.id} style={styles.listing}>
                      <Text style={styles.listingTitle} numberOfLines={1}>
                        {listing.title || 'Untitled'}
                      </Text>
                      <Text style={styles.listingMeta}>
                        {life.charAt(0) + life.slice(1).toLowerCase()} · {formatPrice(listing.price)} · {listing.city}
                      </Text>
                      <View style={styles.actions}>
                        {life !== 'DRAFT' ? (
                          <Pressable onPress={() => router.push(`/listing/${listing.id}` as Href)}>
                            <Text style={styles.action}>Preview</Text>
                          </Pressable>
                        ) : null}
                        {!closed ? (
                          <Pressable onPress={() => router.navigate(`/(tabs)/publish?draft=${listing.id}` as Href)}>
                            <Text style={styles.action}>Edit / photos</Text>
                          </Pressable>
                        ) : null}
                        {life === 'DRAFT' || life === 'PAUSED' ? (
                          <Pressable disabled={busyId === listing.id} onPress={() => void changeStatus(listing.id, 'PUBLISHED')}>
                            <Text style={styles.action}>Publish listing</Text>
                          </Pressable>
                        ) : null}
                        {life === 'PUBLISHED' ? (
                          <Pressable disabled={busyId === listing.id} onPress={() => void changeStatus(listing.id, 'PAUSED')}>
                            <Text style={styles.action}>Pause</Text>
                          </Pressable>
                        ) : null}
                        {life === 'PUBLISHED' || life === 'PAUSED' ? (
                          <Pressable disabled={busyId === listing.id} onPress={() => void changeStatus(listing.id, 'SOLD')}>
                            <Text style={styles.action}>Mark sold</Text>
                          </Pressable>
                        ) : null}
                        <Pressable onPress={() => setDeleteTarget({ id: listing.id, title: listing.title })}>
                          <Text style={styles.actionDanger}>Delete listing</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.lead}>Your next chapter starts here. Add a few photos and a description to publish your first listing.</Text>
              )}
              <Pressable style={styles.primary} onPress={() => router.navigate(`/(tabs)/publish?draft=new&t=${Date.now()}` as Href)}>
                <Text style={styles.primaryText}>{mine.length ? 'New listing' : 'Create your first listing'}</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>

      <Modal visible={placeSheet !== null} transparent animationType="slide" onRequestClose={() => setPlaceSheet(null)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setPlaceSheet(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{placeSheet === 'country' ? 'Country' : 'City'}</Text>
            <ScrollView style={styles.sheetList} keyboardShouldPersistTaps="handled">
              {placeSheet === 'country'
                ? countries.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.sheetRow}
                      onPress={() => {
                        setCountryId(item.id);
                        if (!(item.cities as readonly string[]).includes(city)) setCity(item.cities[0]);
                        setPlaceSheet(null);
                      }}>
                      <Text style={[styles.sheetText, countryId === item.id && styles.sheetTextOn]}>{item.names.en}</Text>
                    </Pressable>
                  ))
                : country.cities.map((item) => (
                    <Pressable
                      key={item}
                      style={styles.sheetRow}
                      onPress={() => {
                        setCity(item);
                        setPlaceSheet(null);
                      }}>
                      <Text style={[styles.sheetText, city === item && styles.sheetTextOn]}>{item}</Text>
                    </Pressable>
                  ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={deleteTarget !== null} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <Pressable style={styles.backdrop} onPress={() => setDeleteTarget(null)}>
          <Pressable style={styles.menu} onPress={() => {}}>
            <Text style={styles.cardTitle}>Delete this listing?</Text>
            <Text style={styles.lead}>
              This permanently removes {deleteTarget?.title || 'the listing'} and its photos. This cannot be undone.
            </Text>
            <Pressable style={styles.primary} disabled={busyId === deleteTarget?.id} onPress={() => void confirmDelete()}>
              <Text style={styles.primaryText}>Delete listing</Text>
            </Pressable>
            <Pressable onPress={() => setDeleteTarget(null)}>
              <Text style={styles.action}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenu(false)}>
          <Pressable style={styles.menu} onPress={() => {}}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenu(false);
                router.push('/shops' as Href);
              }}>
              <AppIcon name="store" size={18} color={green} />
              <Text style={styles.menuText}>Dyqanet</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenu(false);
                router.navigate('/(tabs)' as Href);
              }}>
              <AppIcon name="house" size={18} color={green} />
              <Text style={styles.menuText}>Shtëpia</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Detail({ icon, text }: { icon: AppIconName; text: string }) {
  return (
    <View style={styles.detail}>
      <AppIcon name={icon} size={18} color={green} />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

function Option({ icon, label, onPress }: { icon: AppIconName; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.option} onPress={onPress}>
      <AppIcon name={icon} size={18} color={green} />
      <Text style={styles.optionText}>{label}</Text>
      <AppIcon name="chevronRight" size={16} color="#c5ccc6" />
    </Pressable>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f4f6f2',
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    minHeight: 52,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  brand: {
    fontFamily: 'GeistExtraBold',
    fontSize: 26,
    lineHeight: 40,
    color: '#1f302a',
    letterSpacing: -1.4,
    paddingRight: 2,
  },
  brandKos: {
    fontFamily: 'GeistExtraBold',
    color: '#39875c',
  },
  brandDot: {
    fontFamily: 'GeistExtraBold',
    color: '#b2cb6b',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  helloCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#eef3e6',
    borderRadius: 22,
    padding: 16,
  },
  helloIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e4ecd8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helloCopy: {
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e7f2ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: green,
    fontSize: 18,
    fontWeight: '800',
  },
  eyebrow: {
    color: green,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  hello: {
    fontSize: 22,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.4,
  },
  since: {
    marginTop: 2,
    color: muted,
    fontSize: 13,
  },
  verified: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    color: green,
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e6ebe3',
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: ink,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    flex: 1,
    color: '#3d4a44',
    fontSize: 14,
  },
  editBar: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e7f0e3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  editText: {
    flex: 1,
    color: green,
    fontSize: 14,
    fontWeight: '700',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: ink,
  },
  back: {
    color: green,
    fontWeight: '700',
    fontSize: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: ink,
  },
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3e8e1',
    paddingHorizontal: 12,
    fontSize: 15,
    color: ink,
  },
  area: {
    minHeight: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3e8e1',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: ink,
    textAlignVertical: 'top',
  },
  inputRead: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#f4f6f3',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: ink,
  },
  hint: {
    marginTop: -6,
    fontSize: 12,
    lineHeight: 16,
    color: muted,
  },
  secondary: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: green,
    fontSize: 15,
    fontWeight: '700',
  },
  select: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3e8e1',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: ink,
    fontWeight: '600',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(23, 40, 32, 0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 16,
    paddingBottom: 28,
  },
  sheetTitle: {
    paddingHorizontal: 16,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '800',
    color: ink,
  },
  sheetList: {
    flexGrow: 0,
  },
  sheetRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f4ee',
  },
  sheetText: {
    fontSize: 15,
    fontWeight: '600',
    color: ink,
  },
  sheetTextOn: {
    color: green,
    fontWeight: '800',
  },
  primary: {
    marginTop: 4,
    height: 48,
    borderRadius: 12,
    backgroundColor: green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  lead: {
    color: muted,
    fontSize: 14,
    lineHeight: 20,
  },
  listing: {
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e6ebe3',
  },
  listingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ink,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  action: {
    color: green,
    fontSize: 13,
    fontWeight: '700',
  },
  actionDanger: {
    color: '#9a4036',
    fontSize: 13,
    fontWeight: '700',
  },
  listingMeta: {
    marginTop: 2,
    color: muted,
    fontSize: 13,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e6ebe3',
    padding: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: ink,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    color: muted,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(23, 40, 32, 0.28)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 64,
    paddingRight: 16,
  },
  menu: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e6ebe3',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '700',
    color: ink,
  },
});
