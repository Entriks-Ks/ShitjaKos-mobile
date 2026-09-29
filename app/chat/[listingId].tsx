import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReportSheet } from '@/components/ReportSheet';
import { ScreenBack } from '@/components/ScreenBack';
import { homeColors } from '@/constants/home';
import { formatPrice } from '@/constants/listings';
import { useInbox } from '@/lib/inbox';
import {
  chatView,
  conversationForListing,
  getListing,
  markConversationRead,
  rememberConversation,
  reportConversationMessage,
  sendConversationMessage,
  setConversationBlocked,
  startConversation,
  type ChatMessage,
} from '@/lib/market';

function first(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

const quickReplies = ['A është ende në dispozicion?', 'A bën zbritje?', 'Ku mund ta marr?'];

export default function ChatScreen() {
  const params = useLocalSearchParams<{ listingId?: string; kind?: string }>();
  const routeId = first(params.listingId);
  const fromInbox = first(params.kind) === 'conversation';
  const { reloadInbox } = useInbox();
  const [conversationId, setConversationId] = useState(fromInbox ? routeId : '');
  const [title, setTitle] = useState('Mesazhi');
  const [subtitle, setSubtitle] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [blocked, setBlocked] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [reported, setReported] = useState(false);
  const [missing, setMissing] = useState(false);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [reportOpen, setReportOpen] = useState(false);

  async function load(id: string) {
    const view = await chatView(id);
    setConversationId(view.id);
    setTitle(view.otherName || 'Mesazhi');
    setSubtitle(view.title);
    setMessages(view.messages);
    setBlocked(view.blockedByMe);
    setCanSend(view.canSend);
    if (view.listingId) rememberConversation(view.listingId, view.id);
    const last = view.messages[view.messages.length - 1];
    if (last) await markConversationRead(view.id, last.sequence).catch(() => undefined);
    reloadInbox();
  }

  useEffect(() => {
    let cancel = false;
    async function open() {
      try {
        if (fromInbox) {
          await load(routeId);
          return;
        }
        const listing = await getListing(routeId);
        if (cancel) return;
        setTitle(listing.seller.sq || 'Shitës');
        setSubtitle(`${listing.title} · ${formatPrice(listing.price)}`);
        const existing = await conversationForListing(routeId);
        if (cancel) return;
        if (existing) await load(existing);
      } catch {
        if (!cancel) setMissing(true);
      }
    }
    void open();
    return () => {
      cancel = true;
    };
  }, [fromInbox, routeId]);

  if (missing && !conversationId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.pad}>
          <ScreenBack title="Mesazhi" />
          <Text style={styles.notice}>Biseda nuk u gjet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  async function submit(text: string) {
    const body = text.trim();
    if (!body) return;
    if (/https?:\/\/|www\./i.test(body)) {
      setNotice('Lidhjet dhe fotot nuk lejohen në mesazh.');
      return;
    }
    try {
      if (!conversationId) {
        const started = await startConversation(routeId, body);
        rememberConversation(routeId, started.conversationId);
        setConversationId(started.conversationId);
        await load(started.conversationId);
      } else {
        await sendConversationMessage(conversationId, body);
        await load(conversationId);
      }
      setDraft('');
      setNotice('');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Mesazhi nuk u dërgua.');
    }
  }

  async function toggleBlock() {
    if (!conversationId) return;
    const next = !blocked;
    try {
      await setConversationBlocked(conversationId, next);
      setBlocked(next);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Bllokimi dështoi.');
    }
  }

  async function report(reason: string) {
    const message = [...messages].reverse().find((item) => !item.mine) ?? messages[messages.length - 1];
    if (!conversationId || !message) {
      setNotice('Nuk ka mesazh për ta raportuar.');
      setReportOpen(false);
      return;
    }
    try {
      await reportConversationMessage(conversationId, message.id, reason);
      setReported(true);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Raporti nuk u dërgua.');
    }
    setReportOpen(false);
  }

  const seller = title;
  const locked = blocked || !canSend;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.pad}>
          <ScreenBack title={seller} />
          <Text style={styles.listing} numberOfLines={1}>
            {subtitle || 'Biseda lidhet me shpalljen'}
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={() => void toggleBlock()}>
              <Text style={styles.action}>{blocked ? 'Zhblloko' : 'Blloko'}</Text>
            </Pressable>
            <Pressable onPress={() => setReportOpen(true)}>
              <Text style={styles.action}>{reported ? 'I raportuar' : 'Raporto'}</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.thread} showsVerticalScrollIndicator={false}>
          {messages.length ? (
            messages.map((message) => (
              <View
                key={message.id}
                style={[styles.bubble, message.mine ? styles.mine : styles.theirs]}>
                <Text style={[styles.bubbleText, message.mine && styles.mineText]}>{message.body}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>Shkruaji shitësit. Biseda lidhet me këtë shpallje.</Text>
          )}
        </ScrollView>

        {blocked ? <Text style={styles.notice}>Ke bllokuar këtë bisedë.</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quick}>
          {quickReplies.map((reply) => (
            <Pressable key={reply} style={styles.chip} onPress={() => void submit(reply)} disabled={locked}>
              <Text style={styles.chipText}>{reply}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.policy}>Mesazhi i parë është tekst. Fotot dhe lidhjet nuk lejohen.</Text>

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Shkruaj mesazhin"
            placeholderTextColor="#9aa39b"
            style={styles.input}
            editable={!locked}
          />
          <Pressable style={styles.send} onPress={() => void submit(draft)} disabled={locked}>
            <Text style={styles.sendText}>Dërgo</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={(reason) => {
          void report(reason);
        }}
      />
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
  flex: {
    flex: 1,
  },
  pad: {
    paddingHorizontal: 16,
  },
  listing: {
    marginTop: -8,
    marginBottom: 8,
    color: homeColors.muted,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  action: {
    color: homeColors.leaf,
    fontSize: 13,
    fontWeight: '700',
  },
  thread: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  empty: {
    color: homeColors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: '#235641',
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: homeColors.line,
  },
  bubbleText: {
    color: homeColors.ink,
    fontSize: 14,
    lineHeight: 20,
  },
  mineText: {
    color: '#fff',
  },
  notice: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    color: '#8a4b32',
    fontSize: 12,
  },
  quick: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 6,
  },
  chip: {
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: homeColors.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: homeColors.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  policy: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    color: homeColors.muted,
    fontSize: 11,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: homeColors.line,
    paddingHorizontal: 14,
    color: homeColors.ink,
  },
  send: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#235641',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontWeight: '800',
  },
});
