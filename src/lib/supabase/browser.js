import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  // Cette fonction doit rester "pure" (pas de hooks React ici).
  // Utilise la fonction retournée dans un composant client,
  // et fais tes useEffect / console.log de session à cet endroit.
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
