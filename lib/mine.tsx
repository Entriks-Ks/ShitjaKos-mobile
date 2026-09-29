import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { DemoListing } from '@/constants/listings';
import { useSession } from '@/lib/auth';
import { myListings } from '@/lib/market';

const MineContext = createContext({
  mine: [] as DemoListing[],
  reloadMine: () => {},
});

export function MineProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const [mine, setMine] = useState<DemoListing[]>([]);
  const [tick, setTick] = useState(0);
  const reloadMine = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      setMine([]);
      return;
    }
    let cancel = false;
    myListings()
      .then((items) => {
        if (!cancel) setMine(items);
      })
      .catch(() => {
        if (!cancel) setMine([]);
      });
    return () => {
      cancel = true;
    };
  }, [isPending, session, tick]);

  const value = useMemo(() => ({ mine, reloadMine }), [mine, reloadMine]);
  return <MineContext.Provider value={value}>{children}</MineContext.Provider>;
}

export function useMine() {
  return useContext(MineContext);
}
