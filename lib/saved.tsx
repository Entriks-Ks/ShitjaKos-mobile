import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { router } from 'expo-router';

import type { DemoListing } from '@/constants/listings';
import { useSession } from '@/lib/auth';
import { favoriteListings, setFavorite } from '@/lib/market';

const SavedContext = createContext({
  saved: [] as string[],
  listings: [] as DemoListing[],
  toggleSavedId: (_id: string) => {},
});

export function SavedProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const [listings, setListings] = useState<DemoListing[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      setListings([]);
      return;
    }
    let cancel = false;
    favoriteListings()
      .then((items) => {
        if (!cancel) setListings(items);
      })
      .catch(() => {
        if (!cancel) setListings([]);
      });
    return () => {
      cancel = true;
    };
  }, [isPending, session, tick]);

  const toggleSavedId = useCallback((id: string) => {
    setListings((current) => {
      const saved = current.some((item) => item.id === id);
      setFavorite(id, !saved)
        .then(() => setTick((value) => value + 1))
        .catch(() => setTick((value) => value + 1));
      return current;
    });
  }, []);

  const value = useMemo(
    () => ({
      saved: listings.map((item) => item.id),
      listings,
      toggleSavedId,
    }),
    [listings, toggleSavedId],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const { data: session } = useSession();
  const { saved, listings, toggleSavedId } = useContext(SavedContext);
  return {
    saved: session ? saved : [],
    listings: session ? listings : [],
    isSaved: (id: string) => !!session && saved.includes(id),
    toggleSaved: (id: string) => {
      if (!session) {
        router.push('/login');
        return;
      }
      toggleSavedId(id);
    },
  };
}
