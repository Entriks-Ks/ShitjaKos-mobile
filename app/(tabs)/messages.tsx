import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { homeColors, homeCopy } from '@/constants/home';
import { useSession } from '@/lib/auth';
import { useInbox } from '@/lib/inbox';

export default function MessagesScreen() {
  const t = homeCopy.sq;
  const { data: session } = useSession();
  const { items } = useInbox();
  const rows = items;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Mesazhet</Text>
      {!session ? (
        <View style={styles.pad}>
          <Text style={styles.empty}>Hyr që të shkruash dhe të shohësh bisedat.</Text>
          <Pressable style={styles.button} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>{t.login}</Text>
          </Pressable>
        </View>
      ) : rows.length ? (
        <ScrollView contentContainerStyle={styles.list}>
          {rows.map((thread) => (
              <Pressable
                key={thread.id}
                style={styles.row}
                onPress={() => router.push(`/chat/${thread.id}?kind=conversation` as Href)}>
                <View style={styles.copy}>
                  <Text style={styles.name} numberOfLines={1}>
                    {thread.title}
                  </Text>
                  <Text style={styles.preview} numberOfLines={1}>
                    {thread.otherName}
                    {thread.preview ? ` · ${thread.preview}` : ''}
                  </Text>
                </View>
                {thread.unread > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{thread.unread}</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
        </ScrollView>
      ) : (
        <Text style={[styles.empty, styles.pad]}>
          Nuk ke biseda. Hap një shpallje dhe shtyp Mesazh.
        </Text>
      )}
    </SafeAreaView>
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
  title: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    fontSize: 28,
    fontWeight: '800',
    color: homeColors.ink,
  },
  pad: {
    paddingHorizontal: 16,
  },
  empty: {
    color: homeColors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    marginTop: 16,
    height: 46,
    borderRadius: 999,
    backgroundColor: homeColors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: homeColors.line,
    padding: 14,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: homeColors.ink,
  },
  preview: {
    color: homeColors.muted,
    fontSize: 13,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: '#235641',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});
