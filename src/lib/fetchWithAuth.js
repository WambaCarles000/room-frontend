import { createClient } from "@/lib/supabase/browser";

export async function fetchWithAuth(input, init = {}) {
  const res = await fetch(input, init);

  if (res.status === 401) {
    let data = null;

    try {
      data = await res.clone().json();
      // console.log("401 RESPONSE DATA:", data);

    } catch (e) {
      // console.log("401 RESPONSE DATA:", data); 
    }

    const code = data?.code;

    const supabase = createClient();

    // Suspension
    if (code === "ACCOUNT_SUSPENDED") {
      await supabase.auth.signOut();
      window.location.href = "/account/suspended";
      return;
    }

    //  Token invalide / expiré
    await supabase.auth.signOut();
    window.location.href = "/login";
    return;
  }

  if (!res.ok) {
    let data = {};
    try {
      data = await res.clone().json();
    } catch (e) { }

    const msg = data?.message || res.statusText || "Request failed";
    throw new Error(msg);
  }

  return res.json().catch(() => res);
}