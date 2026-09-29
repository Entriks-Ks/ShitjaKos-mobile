import { useEffect, useRef, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { localCategoryGroups, type LiveCategoryGroup } from '@/constants/catalog';
import { countries, countryById } from '@/constants/places';
import { ApiError, currentApiToken, mediaUrl } from '@/lib/api';
import { useSession } from '@/lib/auth';
import { useBusinesses } from '@/lib/businesses';
import { useMine } from '@/lib/mine';
import {
  apiCity,
  createListing,
  deleteListingPhoto,
  getListingEdit,
  groupCategories,
  loadCategories,
  publishListing,
  updateListing,
  uploadListingPhoto,
  type CategoryAttribute,
} from '@/lib/market';

const green = '#1f7a46';
const ink = '#1a2e24';
const line = '#e3e8e1';

const conditions = [
  { id: 'NEW', label: 'NEW' },
  { id: 'LIKE_NEW', label: 'LIKE NEW' },
  { id: 'USED', label: 'USED' },
  { id: 'DEFECTIVE', label: 'DEFECTIVE' },
  { id: 'FOR_PARTS', label: 'FOR PARTS' },
];

const intents = [
  { id: 'FOR_SALE', label: 'For sale' },
  { id: 'WANTED', label: 'Wanted — looking to buy' },
];

function countryForCity(city: string) {
  return countries.find((country) => (country.cities as readonly string[]).includes(city));
}

function mediaIdFromUrl(uri: string) {
  return uri.match(/\/api\/v1\/media\/([^/?]+)/)?.[1] ?? '';
}

function photoSource(uri: string) {
  if (!uri.includes('/api/v1/media/')) return { uri };
  const token = currentApiToken();
  return token ? { uri, headers: { Authorization: `Bearer ${token}` } } : { uri };
}

function choice(option: unknown) {
  if (typeof option === 'string') return { value: option, label: option };
  if (option && typeof option === 'object') {
    const row = option as { value?: unknown; labels?: { en?: string; sq?: string }; en?: string };
    const value = String(row.value ?? row.en ?? '');
    const label = row.labels?.en || row.labels?.sq || row.en || value;
    return { value, label };
  }
  return { value: '', label: '' };
}

const emptyArticle = {
  categoryId: '',
  title: '',
  description: '',
  condition: 'USED',
  price: '',
  city: 'Prishtina',
  photos: [] as string[],
};

export default function PublishScreen() {
  const { data: session } = useSession();
  const { businesses } = useBusinesses();
  const { reloadMine } = useMine();
  const params = useLocalSearchParams<{ draft?: string; t?: string }>();
  const draftId = typeof params.draft === 'string' ? params.draft : '';
  const opened = `${draftId}:${typeof params.t === 'string' ? params.t : ''}`;
  const mineRef = useRef(reloadMine);
  mineRef.current = reloadMine;
  const savingRef = useRef(false);
  const [articleId, setArticleId] = useState('');
  const [saving, setSaving] = useState(false);
  const [defs, setDefs] = useState<CategoryAttribute[]>([]);
  const [attrs, setAttrs] = useState<Record<string, string>>({});
  const [categoryId, setCategoryId] = useState(emptyArticle.categoryId);
  const [title, setTitle] = useState(emptyArticle.title);
  const [description, setDescription] = useState(emptyArticle.description);
  const [condition, setCondition] = useState(emptyArticle.condition);
  const [price, setPrice] = useState(emptyArticle.price);
  const [city, setCity] = useState(emptyArticle.city);
  const [countryId, setCountryId] = useState('xk');
  const [intent, setIntent] = useState('FOR_SALE');
  const [owner, setOwner] = useState('personal');
  const [negotiable, setNegotiable] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [listingStatus, setListingStatus] = useState('');
  const [photos, setPhotos] = useState<string[]>(emptyArticle.photos);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<LiveCategoryGroup[]>(() => localCategoryGroups('en'));
  const [sheet, setSheet] = useState<'category' | 'condition' | 'city' | 'country' | 'intent' | 'owner' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancel = false;
    loadCategories()
      .then((items) => {
        const next = groupCategories(items, 'en');
        if (!cancel && next.length) setGroups(next);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setDefs([]);
      return;
    }
    let cancel = false;
    loadCategories()
      .then((items) => {
        if (!cancel) setDefs(items.find((item) => item.id === categoryId)?.attributes ?? []);
      })
      .catch(() => {
        if (!cancel) setDefs([]);
      });
    return () => {
      cancel = true;
    };
  }, [categoryId]);

  useEffect(() => {
    if (!draftId || draftId === 'new') {
      setArticleId('');
      setCategoryId(emptyArticle.categoryId);
      setTitle(emptyArticle.title);
      setDescription(emptyArticle.description);
      setCondition(emptyArticle.condition);
      setPrice(emptyArticle.price);
      setCity(emptyArticle.city);
      setCountryId('xk');
      setIntent('FOR_SALE');
      setOwner('personal');
      setNegotiable(false);
      setPhone('');
      setPhoneVisible(false);
      setListingStatus('');
      setPhotos(emptyArticle.photos);
      setAttrs({});
      setError('');
      return;
    }
    let cancel = false;
    getListingEdit(draftId)
      .then((existing) => {
        if (cancel) return;
        setArticleId(existing.id);
        setCategoryId(existing.categoryId);
        setTitle(existing.title);
        setDescription(existing.description);
        setCondition(existing.condition || 'USED');
        setPrice(existing.price);
        setCity(existing.city || 'Prishtina');
        setCountryId(countryForCity(existing.city)?.id ?? 'xk');
        setIntent(existing.intent === 'WANTED' ? 'WANTED' : 'FOR_SALE');
        setOwner(existing.owner || 'personal');
        setNegotiable(existing.negotiable);
        setPhone(existing.contactPhone || '');
        setPhoneVisible(existing.phoneVisible);
        setListingStatus(existing.status);
        setPhotos(existing.media.map((media) => mediaUrl(media.url)));
        setAttrs(Object.fromEntries(Object.entries(existing.attributes).map(([key, value]) => [key, String(value ?? '')])));
        setError('');
      })
      .catch(() => {
        if (!cancel) setError('This draft could not be opened.');
      });
    return () => {
      cancel = true;
    };
  }, [opened]);

  if (!session) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header />
        <View style={styles.pad}>
          <Text style={styles.lead}>Log in to publish a listing.</Text>
          <Pressable style={styles.button} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>Log in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const intentLabel = intents.find((item) => item.id === intent)?.label ?? 'For sale';
  const conditionLabel = conditions.find((item) => item.id === condition)?.label ?? 'USED';
  const country = countryById(countryId) ?? countries[0];
  const ownerBusiness = businesses.find((item) => item.id === owner);
  const ownerLabel =
    owner === 'personal'
      ? 'Me — private seller'
      : ownerBusiness
        ? `${ownerBusiness.publicName}${ownerBusiness.reviewStatus !== 'APPROVED' ? ' (review pending)' : ''}`
        : owner;
  const categoryText = (() => {
    if (!categoryId) return 'Choose a subcategory';
    for (const group of groups) {
      const child = group.children.find((item) => item.id === categoryId);
      if (child) return child.label;
      if (group.id === categoryId) return group.label;
    }
    return categoryId;
  })();
  const amount = Number(price.replace(',', '.'));
  const phoneOk = !phoneVisible || /^\+?[\d\s()-]{7,25}$/.test(phone.trim());
  const problems = {
    title: title.trim().length < 5 ? 'Title needs at least 5 characters.' : '',
    category: !categoryId ? 'Choose a subcategory.' : '',
    price: !Number.isFinite(amount) || amount < 0 || price.trim() === '' ? 'Enter a price.' : '',
    description: description.trim().length < 20 ? 'Description needs at least 20 characters.' : '',
    phone: phoneOk ? '' : 'Add a valid contact phone or turn phone visibility off.',
  };
  const problem = Object.values(problems).find(Boolean) ?? '';

  function attributePayload() {
    const values: Record<string, string | number | boolean> = {};
    for (const field of defs) {
      const raw = (attrs[field.id] ?? '').trim();
      if (!raw) continue;
      if (field.type === 'NUMBER') values[field.id] = Number(raw);
      else if (field.type === 'BOOLEAN') values[field.id] = raw === 'true';
      else values[field.id] = raw;
    }
    return values;
  }

  function listingBody() {
    return {
      owner,
      categoryId,
      intent,
      title: title.trim(),
      description: description.trim(),
      price: amount.toFixed(2),
      city: apiCity(city),
      condition: condition || 'USED',
      negotiable,
      phoneVisible,
      contactPhone: phone.trim(),
      attributes: attributePayload(),
    };
  }

  async function saveExisting(id: string) {
    const body = listingBody();
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const current = await getListingEdit(id);
      try {
        await updateListing(id, { ...body, version: current.version });
        return;
      } catch (cause) {
        if (attempt === 0 && cause instanceof ApiError && cause.status === 409) continue;
        throw cause;
      }
    }
  }

  async function saveDetails() {
    const missing = defs.find((field) => field.required && !(attrs[field.id] ?? '').trim());
    if (problem || missing) {
      const label = missing?.translations.find((item) => item.locale === 'en')?.label ?? missing?.key;
      setError(problem || `${label} is required.`);
      return;
    }
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError('');
    try {
      let id = articleId;
      if (!id) {
        const created = await createListing(listingBody());
        id = created.id;
        setArticleId(id);
      } else {
        await saveExisting(id);
      }
      const pending = photos.filter((uri) => uri && !uri.includes('/api/v1/media/'));
      for (const uri of pending) {
        await uploadListingPhoto(id, uri);
      }
      const saved = await getListingEdit(id);
      setListingStatus(saved.status);
      setPhotos(saved.media.map((media) => mediaUrl(media.url)));
      mineRef.current();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not save. Please try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function publishSaved() {
    if (!articleId || savingRef.current) return;
    if (!photos.some((uri) => uri.includes('/api/v1/media/'))) {
      setError('Add at least one photo before publishing.');
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setError('');
    try {
      if (listingStatus === 'DRAFT' || listingStatus === 'PAUSED') await publishListing(articleId);
      setListingStatus('PUBLISHED');
      mineRef.current();
      router.push(`/listing/${articleId}` as Href);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not update listing.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function refreshPhotos(id: string) {
    const saved = await getListingEdit(id);
    setPhotos(saved.media.map((media) => mediaUrl(media.url)));
    setListingStatus(saved.status);
  }

  async function addPhotos() {
    if (savingRef.current) return;
    const remaining = 12 - photos.length;
    if (remaining <= 0) {
      setError('A listing can have at most 12 images.');
      return;
    }
    setError('');
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Allow photo access to add pictures from your gallery.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.8,
        preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      });
      if (result.canceled) return;
      const picked = result.assets.filter((asset) => asset.uri);
      if (!articleId) {
        setPhotos((current) => [...current, ...picked.map((asset) => asset.uri)].slice(0, 12));
        return;
      }
      savingRef.current = true;
      setSaving(true);
      for (const asset of picked) {
        await uploadListingPhoto(articleId, asset.uri, asset.mimeType);
      }
      await refreshPhotos(articleId);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Photo upload failed. Try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function removePhoto(uri: string) {
    const mediaId = mediaIdFromUrl(uri);
    if (!mediaId) {
      setPhotos((current) => current.filter((item) => item !== uri));
      return;
    }
    if (!articleId || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError('');
    try {
      await deleteListingPhoto(articleId, mediaId);
      await refreshPhotos(articleId);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not delete image. Retry.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.eyebrow}>01 · PHOTOS</Text>
          <Text style={styles.heading}>Show it from its best side.</Text>
          <Text style={styles.hint}>
            Add 1–12 JPEG, PNG or WebP images, up to 8 MB each. The first photo is the cover.
          </Text>
          <View style={styles.photos}>
            {photos.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.photoSlot}>
                <Image source={photoSource(uri)} style={styles.photoImage} />
                {index === 0 ? <Text style={styles.cover}>Cover</Text> : null}
                <Pressable style={styles.remove} hitSlop={6} onPress={() => void removePhoto(uri)}>
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
              </View>
            ))}
            {photos.length < 12 ? (
              <Pressable style={styles.photoMain} onPress={() => void addPhotos()} disabled={saving}>
                <AppIcon name="photo" size={22} color={green} />
                <Text style={styles.photoLabel}>Add photos</Text>
              </Pressable>
            ) : null}
          </View>
          {saving ? <Text style={styles.hint}>Processing photos…</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>02 · THE DETAILS</Text>
          <Text style={styles.heading}>{articleId ? 'Edit your listing' : 'What would you like to list?'}</Text>

          <View style={styles.pair}>
            <View style={styles.pairItem}>
              <FieldLabel text="Listing intent" />
              <Pressable style={styles.select} onPress={() => setSheet('intent')}>
                <Text style={styles.selectText} numberOfLines={1}>{intentLabel}</Text>
                <AppIcon name="chevronDown" size={16} color="#8a938c" />
              </Pressable>
            </View>
            <View style={styles.pairItem}>
              <FieldLabel text="Publish as" />
              <Pressable style={styles.select} disabled={!!articleId} onPress={() => setSheet('owner')}>
                <Text style={styles.selectText} numberOfLines={1}>{ownerLabel}</Text>
                <AppIcon name="chevronDown" size={16} color="#8a938c" />
              </Pressable>
            </View>
          </View>

          <FieldLabel text="Category" />
          <Pressable style={styles.select} onPress={() => setSheet('category')}>
            <Text style={[styles.selectText, !categoryId && styles.placeholder]}>{categoryText}</Text>
            <AppIcon name="chevronDown" size={16} color="#8a938c" />
          </Pressable>
          {problems.category && error ? <Text style={styles.fieldError}>{problems.category}</Text> : null}

          <FieldLabel text="Title" />
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. iPhone 15 Pro, 256 GB, excellent condition"
            placeholderTextColor="#b0b7b2"
            style={styles.input}
            maxLength={120}
          />
          {problems.title && error ? <Text style={styles.fieldError}>{problems.title}</Text> : null}

          <FieldLabel text="Description" />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Tell buyers about the item, its condition and pickup arrangements."
            placeholderTextColor="#b0b7b2"
            multiline
            maxLength={6000}
            style={styles.area}
          />
          {problems.description && error ? <Text style={styles.fieldError}>{problems.description}</Text> : null}

          {defs.length ? (
            <View style={styles.about}>
              <Text style={styles.aboutTitle}>About this item</Text>
              {defs.map((field) => {
                const label = `${field.translations.find((item) => item.locale === 'en')?.label ?? field.key}${field.unit ? ` (${field.unit})` : ''}`;
                const options = Array.isArray(field.options) ? field.options : [];
                return (
                  <View key={field.id}>
                    <FieldLabel text={label} required={field.required} />
                    {field.type === 'BOOLEAN' ? (
                      <View>
                        {['true', 'false'].map((value) => (
                          <Pressable key={value} style={styles.row} onPress={() => setAttrs((current) => ({ ...current, [field.id]: value }))}>
                            <Text style={[styles.rowText, attrs[field.id] === value && styles.rowOn]}>
                              {value === 'true' ? 'Yes' : 'No'}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : options.length ? (
                      <View>
                        {options.map((option, index) => {
                          const item = choice(option);
                          if (!item.value) return null;
                          return (
                            <Pressable
                              key={`${item.value}-${index}`}
                              style={styles.row}
                              onPress={() => setAttrs((current) => ({ ...current, [field.id]: item.value }))}>
                              <Text style={[styles.rowText, attrs[field.id] === item.value && styles.rowOn]}>{item.label}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : (
                      <TextInput
                        value={attrs[field.id] ?? ''}
                        onChangeText={(value) => setAttrs((current) => ({ ...current, [field.id]: value }))}
                        placeholder={label}
                        placeholderTextColor="#b0b7b2"
                        keyboardType={field.type === 'NUMBER' ? 'decimal-pad' : 'default'}
                        style={styles.input}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          ) : null}

          <FieldLabel text="Price / wanted budget (€)" />
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            placeholderTextColor="#b0b7b2"
            keyboardType="decimal-pad"
            style={styles.input}
          />

          <FieldLabel text="Condition" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.conditionRow}>
            {conditions.map((item) => {
              const selected = condition === item.id;
              const label = item.label || conditionLabel;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.conditionChip, selected && styles.conditionChipOn]}
                  onPress={() => setCondition(item.id)}>
                  <Text style={[styles.conditionText, selected && styles.conditionTextOn]}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {problems.price && error ? <Text style={styles.fieldError}>{problems.price}</Text> : null}

          <View style={styles.pair}>
            <View style={styles.pairItem}>
              <FieldLabel text="Country" />
              <Pressable style={styles.select} onPress={() => setSheet('country')}>
                <Text style={styles.selectText}>{country.names.en}</Text>
                <AppIcon name="chevronDown" size={16} color="#8a938c" />
              </Pressable>
            </View>
            <View style={styles.pairItem}>
              <FieldLabel text="City" />
              <Pressable style={styles.select} onPress={() => setSheet('city')}>
                <Text style={styles.selectText}>{city}</Text>
                <AppIcon name="chevronDown" size={16} color="#8a938c" />
              </Pressable>
            </View>
          </View>

          <CheckRow label="Price is negotiable" checked={negotiable} onPress={() => setNegotiable((value) => !value)} />

          <View style={styles.divider} />
          <FieldLabel text="Contact phone (optional)" />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder=""
            placeholderTextColor="#b0b7b2"
            keyboardType="phone-pad"
            style={styles.input}
          />
          {problems.phone && error ? <Text style={styles.fieldError}>{problems.phone}</Text> : null}
          <CheckRow
            label="Show this number publicly on the listing"
            checked={phoneVisible}
            onPress={() => setPhoneVisible((value) => !value)}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.button} onPress={() => void saveDetails()} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? 'Saving…' : articleId ? 'Save changes' : 'Save draft'}</Text>
          </Pressable>
          {listingStatus === 'DRAFT' || listingStatus === 'PAUSED' || (articleId && listingStatus === '') ? (
            <Pressable style={styles.publish} onPress={() => void publishSaved()} disabled={saving}>
              <Text style={styles.publishText}>Publish listing</Text>
            </Pressable>
          ) : null}
          <Text style={styles.footnote}>
            Listings appear immediately after you publish. Business listings require an approved shop.
          </Text>
        </View>
      </ScrollView>

      <Modal visible={sheet !== null} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSheet(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>
              {sheet === 'category'
                ? 'Category'
                : sheet === 'condition'
                  ? 'Condition'
                  : sheet === 'intent'
                    ? 'Listing intent'
                    : sheet === 'owner'
                      ? 'Publish as'
                      : sheet === 'country'
                        ? 'Country'
                        : 'City'}
            </Text>
            <ScrollView style={styles.sheetList} keyboardShouldPersistTaps="handled">
              {sheet === 'condition'
                ? conditions.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.row}
                      onPress={() => {
                        setCondition(item.id);
                        setSheet(null);
                      }}>
                      <Text style={[styles.rowText, condition === item.id && styles.rowOn]}>{item.label}</Text>
                    </Pressable>
                  ))
                : null}
              {sheet === 'intent'
                ? intents.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.row}
                      onPress={() => {
                        setIntent(item.id);
                        setSheet(null);
                      }}>
                      <Text style={[styles.rowText, intent === item.id && styles.rowOn]}>{item.label}</Text>
                    </Pressable>
                  ))
                : null}
              {sheet === 'owner' ? (
                <>
                  <Pressable
                    style={styles.row}
                    onPress={() => {
                      setOwner('personal');
                      setSheet(null);
                    }}>
                    <Text style={[styles.rowText, owner === 'personal' && styles.rowOn]}>Me — private seller</Text>
                  </Pressable>
                  {businesses.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.row}
                      onPress={() => {
                        setOwner(item.id);
                        setSheet(null);
                      }}>
                      <Text style={[styles.rowText, owner === item.id && styles.rowOn]}>
                        {item.publicName}
                        {item.reviewStatus !== 'APPROVED' ? ' (review pending)' : ''}
                      </Text>
                    </Pressable>
                  ))}
                </>
              ) : null}
              {sheet === 'country'
                ? countries.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.row}
                      onPress={() => {
                        setCountryId(item.id);
                        setCity(item.cities[0]);
                        setSheet(null);
                      }}>
                      <Text style={[styles.rowText, countryId === item.id && styles.rowOn]}>{item.names.en}</Text>
                    </Pressable>
                  ))
                : null}
              {sheet === 'city'
                ? country.cities.map((item) => (
                    <Pressable
                      key={item}
                      style={styles.row}
                      onPress={() => {
                        setCity(item);
                        setSheet(null);
                      }}>
                      <Text style={[styles.rowText, city === item && styles.rowOn]}>{item}</Text>
                    </Pressable>
                  ))
                : null}
              {sheet === 'category'
                ? groups.map((groupItem) => {
                    const open = openGroup === groupItem.id;
                    return (
                      <View key={groupItem.id}>
                        <Pressable style={styles.row} onPress={() => setOpenGroup(open ? null : groupItem.id)}>
                          <Text style={styles.rowText}>{groupItem.label}</Text>
                        </Pressable>
                        {open
                          ? groupItem.children.map((child) => (
                              <Pressable
                                key={child.id}
                                style={[styles.row, styles.nested]}
                                onPress={() => {
                                  if (child.id !== categoryId) setAttrs({});
                                  setCategoryId(child.id);
                                  setSheet(null);
                                }}>
                                <Text style={[styles.rowText, categoryId === child.id && styles.rowOn]}>{child.label}</Text>
                              </Pressable>
                            ))
                          : null}
                      </View>
                    );
                  })
                : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function CheckRow({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.check} onPress={onPress}>
      <View style={[styles.box, checked && styles.boxOn]}>
        {checked ? <AppIcon name="check" size={12} color="#fff" /> : null}
      </View>
      <Text style={styles.checkText}>{label}</Text>
    </Pressable>
  );
}

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <Text style={styles.label}>
      {text}
      {required ? <Text style={styles.star}> *</Text> : null}
    </Text>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Pressable hitSlop={8} onPress={() => router.navigate('/(tabs)/profile' as Href)} style={styles.back}>
        <AppIcon name="chevronLeft" size={22} color={ink} />
      </Pressable>
      <Text style={styles.headerTitle}>Listing</Text>
      <View style={styles.back} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f7f8f5',
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    minHeight: 52,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: ink,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e7eee4',
    padding: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8a938c',
  },
  heading: {
    marginTop: 6,
    marginBottom: 8,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: ink,
  },
  pair: {
    flexDirection: 'row',
    gap: 10,
  },
  pairItem: {
    flex: 1,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conditionChip: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionChipOn: {
    borderColor: green,
    backgroundColor: '#e7f3ea',
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '700',
    color: ink,
  },
  conditionTextOn: {
    color: green,
  },
  about: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f6f7f4',
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: ink,
  },
  divider: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e7eee4',
  },
  check: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#c9d2c8',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: {
    backgroundColor: green,
    borderColor: green,
  },
  checkText: {
    flex: 1,
    fontSize: 14,
    color: ink,
  },
  footnote: {
    marginTop: 12,
    color: '#8a938c',
    fontSize: 12,
    lineHeight: 18,
  },
  publish: {
    marginTop: 16,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishText: {
    color: green,
    fontSize: 15,
    fontWeight: '800',
  },
  pad: {
    padding: 16,
    gap: 12,
  },
  lead: {
    color: '#8a938c',
    fontSize: 15,
    lineHeight: 22,
  },
  photos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoMain: {
    width: 86,
    height: 86,
    borderRadius: 16,
    backgroundColor: '#e7f0e3',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: green,
  },
  photoSlot: {
    width: 86,
    height: 86,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f3f5f2',
  },
  cover: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: 'rgba(26, 46, 36, 0.72)',
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    borderRadius: 6,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(26, 46, 36, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '700',
  },
  hint: {
    marginTop: 8,
    color: '#8a938c',
    fontSize: 12,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  plus: {
    fontSize: 22,
    color: '#b7c0b8',
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
    color: ink,
  },
  star: {
    color: '#b42318',
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    fontSize: 15,
    color: ink,
  },
  select: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: ink,
  },
  placeholder: {
    color: '#8a938c',
  },
  locationText: {
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  currency: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: '#f3f5f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '700',
    color: ink,
  },
  priceInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    fontSize: 15,
    color: ink,
  },
  areaWrap: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: '#fff',
    paddingBottom: 24,
  },
  area: {
    minHeight: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 15,
    color: ink,
    textAlignVertical: 'top',
  },
  count: {
    position: 'absolute',
    right: 12,
    bottom: 8,
    color: '#b0b7b2',
    fontSize: 12,
  },
  error: {
    marginTop: 12,
    color: '#8a4b32',
    fontSize: 13,
  },
  fieldError: {
    marginTop: 6,
    color: '#8a4b32',
    fontSize: 12,
  },
  button: {
    marginTop: 20,
    height: 52,
    borderRadius: 14,
    backgroundColor: green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  draft: {
    marginTop: 14,
    textAlign: 'center',
    color: green,
    fontSize: 15,
    fontWeight: '700',
  },
  note: {
    marginTop: 6,
    textAlign: 'center',
    color: '#8a938c',
    fontSize: 12,
  },
  backdrop: {
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
    fontSize: 18,
    fontWeight: '800',
    color: ink,
    marginBottom: 8,
  },
  sheetList: {
    flexGrow: 0,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f4ee',
  },
  nested: {
    paddingLeft: 28,
    backgroundColor: '#f7f9f3',
  },
  rowText: {
    fontSize: 15,
    color: ink,
    fontWeight: '600',
  },
  rowOn: {
    color: green,
    fontWeight: '800',
  },
});
