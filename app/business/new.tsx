import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { searchCities } from '@/constants/home';
import { ApiError } from '@/lib/api';
import { useSession } from '@/lib/auth';
import { useBusinesses } from '@/lib/businesses';
import { apiCity, createBusiness } from '@/lib/market';

const green = '#1f7a46';
const ink = '#1a2e24';
const line = '#e3e8e1';

export default function NewBusinessScreen() {
  const { data: session } = useSession();
  const { reloadBusinesses } = useBusinesses();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [city, setCity] = useState<string>(searchCities[0]);
  const [photo, setPhoto] = useState(false);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [error, setError] = useState('');

  if (!session) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header />
        <View style={styles.pad}>
          <Text style={styles.lead}>Log in to create a shop.</Text>
          <Pressable style={styles.button} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>Log in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  async function submit() {
    if (name.trim().length < 3) {
      setError('Shop name needs at least 3 characters.');
      return;
    }
    if (description.trim().length < 20) {
      setError('Description needs at least 20 characters.');
      return;
    }
    if (!/^\+?[\d\s()-]{7,25}$/.test(phone.trim())) {
      setError('Add a valid phone number.');
      return;
    }
    if (!session) return;
    setSaving(true);
    try {
      await createBusiness({
        legalName: name.trim(),
        publicName: name.trim(),
        email: session.user.email,
        phone: phone.trim(),
        city: apiCity(city),
        address: '',
        description: description.trim(),
        openingHours: 'Mon–Fri 09:00–18:00',
      });
      reloadBusinesses();
      router.back();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not create the shop.');
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <AppIcon name="store" size={28} color={green} />
          </View>
          <View style={styles.introCopy}>
            <Text style={styles.introTitle}>Open your shop</Text>
            <Text style={styles.lead}>Start your journey by creating a shop. It’s free and easy.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shop details</Text>

          <FieldLabel text="Shop name" required />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Jeta’s Store"
            placeholderTextColor="#b0b7b2"
            style={styles.input}
          />

          <FieldLabel text="Phone" required />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+383 44 000 000"
            placeholderTextColor="#b0b7b2"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <FieldLabel text="Shop description" required />
          <View style={styles.areaWrap}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tell buyers what makes your shop special..."
              placeholderTextColor="#b0b7b2"
              multiline
              maxLength={300}
              style={styles.area}
            />
            <Text style={styles.count}>{description.length}/300</Text>
          </View>

          <FieldLabel text="Shop profile photo" />
          <Pressable style={styles.photo} onPress={() => setPhoto(true)}>
            <AppIcon name="camera" size={22} color={green} />
            <Text style={styles.photoText}>{photo ? 'Photo added' : 'Upload photo'}</Text>
          </Pressable>
          <Text style={styles.hint}>JPG or PNG. Max size 5MB.</Text>

          <FieldLabel text="Shop location" />
          <Pressable style={styles.location} onPress={() => setCitiesOpen((open) => !open)}>
            <AppIcon name="pin" size={16} color={green} />
            <Text style={styles.locationText}>{city}, Kosova</Text>
            <AppIcon name="pencil" size={16} color={green} />
          </Pressable>
          {citiesOpen ? (
            <View style={styles.cities}>
              {searchCities.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => {
                    setCity(item);
                    setCitiesOpen(false);
                  }}>
                  <Text style={[styles.city, item === city && styles.cityOn]}>{item}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.button} onPress={() => void submit()} disabled={saving}>
          <Text style={styles.buttonText}>Create shop</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
      <Pressable hitSlop={8} onPress={() => router.back()} style={styles.back}>
        <AppIcon name="chevronLeft" size={22} color={ink} />
      </Pressable>
      <Text style={styles.headerTitle}>Create your shop</Text>
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
    paddingBottom: 32,
    gap: 16,
  },
  pad: {
    padding: 16,
    gap: 12,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  introIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e7f0e3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introCopy: {
    flex: 1,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: ink,
  },
  lead: {
    marginTop: 2,
    color: '#8a938c',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e6ebe3',
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: ink,
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
    paddingHorizontal: 14,
    fontSize: 15,
    color: ink,
  },
  areaWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: line,
    minHeight: 120,
    paddingBottom: 28,
  },
  area: {
    minHeight: 88,
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
  photo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#c5d0c4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoText: {
    fontSize: 11,
    color: green,
    fontWeight: '600',
  },
  hint: {
    marginTop: 8,
    color: '#8a938c',
    fontSize: 12,
  },
  location: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: line,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    color: ink,
  },
  cities: {
    marginTop: 8,
    gap: 8,
  },
  city: {
    fontSize: 15,
    color: ink,
    paddingVertical: 4,
  },
  cityOn: {
    color: green,
    fontWeight: '800',
  },
  error: {
    color: '#8a4b32',
    fontSize: 13,
  },
  button: {
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
});
