"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

function LoginForm() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") || "/dashboard", [searchParams]);
  
  // import api lazily to avoid client/server mismatch
  const api = require("@/lib/api").default;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


async function onSubmit(e) {
  e.preventDefault();
  setError(null);
  setLoading(true);
  try {
    const supabase = createClient();
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw signInError;

    // récupère le profil via l'API centralisée (gère déjà les 401 / suspension)
    // const userProfile = await api.get("/users/me", { auth: true });

    // // en cas où le backend renvoie un profil inactif
    // if (userProfile?.is_active === false) {
    //   router.replace("/account/suspended");
    //   return;
    // }

    router.replace(nextPath);
    router.refresh();
  } catch (err) {
    // redirection for suspended is already handled by api
    setError(err?.message ?? "Impossible de se connecter.");
  } finally {
    setLoading(false);
  }
}
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-medium text-zinc-900 underline">
            Créer un compte
          </Link>
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-900">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              placeholder="exemple@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-900">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-600">
          © 2025 Room. Tous les droits réservés.
        </p>
      </main>
    </div>
  );
}

export default LoginForm;
