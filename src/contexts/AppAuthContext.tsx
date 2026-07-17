import { AuthContextType } from '@/components/types';
import { getGuestAddress, isGuestActive, seedGuestDBIfEmpty, setGuestActive } from '@/utils/guestData';
import { useAuth } from '@pooflabs/web';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AppAuthContextValue {
  /** True once we know whether a real wallet is connected. */
  loading: boolean;
  /** Real Poof wallet user, or null. */
  user: { address: string } | null;
  /** True when browsing the demo/guest session (no real wallet). */
  isGuest: boolean;
  /** Wallet address (real) or pseudo-address (guest) — null if neither. */
  address: string | null;
  /** True if there is any usable session (real wallet OR guest). */
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

const AppAuthContext = createContext<AppAuthContextValue | undefined>(undefined);

export const AppAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, login, logout } = useAuth() as AuthContextType;
  const [guest, setGuest] = useState<boolean>(() => isGuestActive());

  // Real wallet always wins — drop guest mode automatically once connected.
  useEffect(() => {
    if (user && guest) {
      setGuestActive(false);
      setGuest(false);
    }
  }, [user, guest]);

  const enterGuestMode = () => {
    seedGuestDBIfEmpty();
    setGuestActive(true);
    setGuest(true);
  };

  const exitGuestMode = () => {
    setGuestActive(false);
    setGuest(false);
  };

  const handleLogout = async () => {
    exitGuestMode();
    await logout();
  };

  const value = useMemo<AppAuthContextValue>(() => {
    const address = user?.address ?? (guest ? getGuestAddress() : null);
    return {
      loading,
      user: user ? { address: user.address } : null,
      isGuest: guest && !user,
      address,
      isAuthenticated: !!user || guest,
      login,
      logout: handleLogout,
      enterGuestMode,
      exitGuestMode,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, guest]);

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
};

export function useAppAuth(): AppAuthContextValue {
  const ctx = useContext(AppAuthContext);
  if (!ctx) throw new Error('useAppAuth must be used within AppAuthProvider');
  return ctx;
}
