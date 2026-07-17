import { useCallback, useEffect, useState } from 'react';
import { getGuestDB, GuestDB, setGuestDB, subscribeGuestDB } from '@/utils/guestData';

/**
 * Reactive access to the local (guest-mode) demo database. Mirrors the shape
 * of `useRealtimeData` so components can branch cleanly between the real
 * Poof collections and this in-browser fallback.
 */
export function useGuestDB() {
  const [db, setDb] = useState<GuestDB>(() => getGuestDB());

  useEffect(() => {
    const unsub = subscribeGuestDB(() => setDb(getGuestDB()));
    return unsub;
  }, []);

  const mutate = useCallback((updater: (db: GuestDB) => GuestDB) => {
    setGuestDB(updater);
  }, []);

  return { db, mutate };
}
