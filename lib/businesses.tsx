import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useSession } from '@/lib/auth';
import { myBusinesses } from '@/lib/market';

export type MyBusiness = {
  id: string;
  legalName: string;
  publicName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  description: string;
  openingHours: string;
  reviewStatus: string;
  role: string;
};

const BusinessContext = createContext({
  businesses: [] as MyBusiness[],
  reloadBusinesses: () => {},
});

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const [businesses, setBusinesses] = useState<MyBusiness[]>([]);
  const [tick, setTick] = useState(0);
  const reloadBusinesses = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      setBusinesses([]);
      return;
    }
    let cancel = false;
    myBusinesses()
      .then((result) => {
        if (cancel) return;
        setBusinesses(
          result.items.map((item) => ({
            id: item.business.id,
            legalName: item.business.legalName,
            publicName: item.business.publicName,
            email: item.business.email,
            phone: item.business.phone,
            city: item.business.city,
            address: item.business.shop?.address ?? '',
            description: item.business.description ?? '',
            openingHours: item.business.shop?.openingHours ?? '',
            reviewStatus: item.business.reviewStatus,
            role: item.role,
          })),
        );
      })
      .catch(() => {
        if (!cancel) setBusinesses([]);
      });
    return () => {
      cancel = true;
    };
  }, [isPending, session, tick]);

  const value = useMemo(() => ({ businesses, reloadBusinesses }), [businesses, reloadBusinesses]);
  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusinesses() {
  return useContext(BusinessContext);
}
