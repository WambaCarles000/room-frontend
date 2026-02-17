import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/browser';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Hook qui synce automatiquement le profil utilisateur après email confirmation.
 * Extrait les données du profil depuis user_metadata (stockées dans le JWT) et les envoie à /users/sync.
 */
export function useAutoSyncProfile() {
  const syncedRef = useRef(false);

  useEffect(() => {
    // Éviter les doubles-syncs
    if (syncedRef.current) return;

    async function syncProfile() {
      try {
        const supabase = createClient();

        // Récupérer la session courante
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          console.log('No session found, skipping auto-sync');
          return;
        }

        // Extract profile data from user_metadata
        const user_metadata = session.user?.user_metadata;

        if (!user_metadata?.first_name && !user_metadata?.last_name && !user_metadata?.role) {
          console.log('No profile data in user_metadata, skipping auto-sync');
          return;
        }

        const profileData = {
          first_name: user_metadata?.first_name || '',
          last_name: user_metadata?.last_name || '',
          role: user_metadata?.role || 'tenant',
        };
        console.log('Auto-syncing profile data from user_metadata:', profileData);

        // Appeler /users/sync
        const syncRes = await fetch(`${API_URL}/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(profileData),
        });

        const syncData = await syncRes.json();
        console.log('Auto-sync response:', syncData);

        if (!syncRes.ok) {
          console.error('Auto-sync failed with status:', syncRes.status, syncData);
          return;
        }

        console.log('Profile synced successfully from user_metadata');

        syncedRef.current = true;
      } catch (err) {
        console.error('Auto-sync error:', err);
      }
    }

    syncProfile();
  }, []);
}
