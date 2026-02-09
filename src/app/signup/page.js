"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      // Depending on your Supabase settings, user may need to confirm email.
      if (data?.user && !data?.session) {
        setSuccess(
          "Compte créé. Vérifie ton email pour confirmer ton inscription, puis connecte-toi.",
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err?.message ?? "Impossible de créer le compte.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Créer un compte</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline">
            Se connecter
          </Link>
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer le compte"}
          </button>
        </form>
      </main>
    </div>
  );
}

