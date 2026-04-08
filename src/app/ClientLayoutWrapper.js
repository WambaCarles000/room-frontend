'use client';

import { useAutoSyncProfile } from '@/lib/hooks/useAutoSyncProfile';

export function ClientLayoutWrapper({ children }) {
  // Déclencher l'auto-sync à chaque démarrage
  useAutoSyncProfile();

  return <>{children}</>;
}
