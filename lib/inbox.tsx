import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useSession } from '@/lib/auth';
import { inbox, type InboxItem } from '@/lib/market';

const InboxContext = createContext({
  items: [] as InboxItem[],
  unreadCount: 0,
  reloadInbox: () => {},
});

export function InboxProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [tick, setTick] = useState(0);
  const reloadInbox = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      setItems([]);
      return;
    }
    let cancel = false;
    const load = () => {
      inbox()
        .then((result) => {
          if (!cancel) setItems(result.items);
        })
        .catch(() => {
          if (!cancel) setItems([]);
        });
    };
    load();
    const timer = setInterval(load, 20000);
    return () => {
      cancel = true;
      clearInterval(timer);
    };
  }, [isPending, session, tick]);

  const value = useMemo(
    () => ({
      items,
      unreadCount: items.reduce((sum, item) => sum + item.unread, 0),
      reloadInbox,
    }),
    [items, reloadInbox],
  );

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox() {
  return useContext(InboxContext);
}
