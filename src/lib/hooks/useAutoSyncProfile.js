import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/browser';
import api from '@/lib/api';

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
        
        // Add phone only if available
        if (user_metadata?.phone) {
          profileData.phone = user_metadata.phone;
        }
        
        console.log('Auto-syncing profile data from user_metadata:', profileData);

        // Appeler /users/sync
        const syncData = await api.post('/users/sync', profileData, { auth: true });
        console.log('Auto-sync response:', syncData);

        console.log('Profile synced successfully from user_metadata');

        syncedRef.current = true;
      } catch (err) {
        console.error('Auto-sync error:', err);
      }
    }

    syncProfile();
  }, []);
}
