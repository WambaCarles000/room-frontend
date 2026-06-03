"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("tenant");
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
      
      // Store profile data in Supabase user_metadata during signup
      const profileData = {
        first_name: firstName,
        last_name: lastName,
        role,
      };
      
      // Phone is an account attribute (optional), independent of role
      if (phone) {
        profileData.phone = phone;
      }
      
      console.log('Profile data to store in user_metadata:', profileData);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileData,
        },
      });
      
      console.log('Supabase signUp response:', { user: data?.user, hasSession: !!data?.session });
      
      if (signUpError) throw signUpError;

      // Case 1: User created but needs email confirmation (no session yet)
      if (data?.user && !data?.session) {
        setSuccess(
          "Compte créé! Vérifie ton email pour confirmer ton inscription, puis connecte-toi.",
        );
        console.log('User created, email confirmation required. Profile data is stored in user_metadata.');
        return;
      }

      // Case 2: User created AND session exists (email confirmation disabled)
      if (data?.session) {
        console.log('User created with session, syncing profile...');
        try {
          console.log('Syncing user profile with API:', {
            api_url: API_URL,
            access_token: data.session.access_token?.substring(0, 20) + '...',
            data: { first_name: firstName, last_name: lastName, role },
          });

          const syncRes = await fetch(`${API_URL}/users/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({
              first_name: firstName,
              last_name: lastName,
              role,
              phone: phone || null,
            }),
          });

          const syncData = await syncRes.json();
          console.log('Sync response:', syncData);

          if (!syncRes.ok) {
            console.error('Sync failed with status:', syncRes.status, syncData);
            // Continue anyway - user was created in Supabase
          } else {
            console.log('User profile synced successfully');
          }
        } catch (syncErr) {
          console.error("User sync error (non-fatal):", syncErr);
          // Continue anyway - user was created in Supabase
        }

        router.replace("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err?.message ?? "Impossible de créer le compte.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 text-zinc-950">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 via-transparent to-zinc-200/35" />
        <div className="absolute top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary-300/20 blur-3xl" />

        <div className="absolute -top-20 -left-16 text-zinc-400/35">
          <svg className="h-48 w-48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V20h14V9.5" />
            <path d="M10 20v-5h4v5" />
          </svg>
        </div>
        <div className="absolute top-10 right-6 text-zinc-400/35">
          <svg className="h-28 w-28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V20h14V9.5" />
            <path d="M10 20v-5h4v5" />
          </svg>
        </div>
        <div className="absolute top-20 left-8 text-primary-400/35">
          <svg className="h-16 w-16 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="8.5" cy="8.5" r="3.5" />
            <path d="M11 11l9 9" />
            <path d="M16 16l2-2" />
            <path d="M18 18l2-2" />
          </svg>
        </div>
        <div className="absolute right-10 top-1/3 text-primary-500/30">
          <svg className="h-14 w-14 rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="8.5" cy="8.5" r="3.5" />
            <path d="M11 11l9 9" />
            <path d="M16 16l2-2" />
            <path d="M18 18l2-2" />
          </svg>
        </div>
        <div className="absolute bottom-8 left-8 text-zinc-400/30">
          <svg className="h-24 w-24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V20h14V9.5" />
            <path d="M10 20v-5h4v5" />
          </svg>
        </div>
        <div className="absolute bottom-14 right-16 text-primary-400/30">
          <svg className="h-20 w-20 rotate-[20deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="8.5" cy="8.5" r="3.5" />
            <path d="M11 11l9 9" />
            <path d="M16 16l2-2" />
            <path d="M18 18l2-2" />
          </svg>
        </div>
        <div className="absolute -bottom-16 right-1/4 text-zinc-400/30">
          <svg className="h-40 w-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V20h14V9.5" />
            <path d="M10 20v-5h4v5" />
          </svg>
        </div>
        <div className="absolute top-1/3 left-1/3 text-zinc-400/20">
          <svg className="h-72 w-72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V20h14V9.5" />
            <path d="M10 20v-5h4v5" />
          </svg>
        </div>
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-white/60 bg-white/88 p-6 shadow-xl backdrop-blur-sm sm:p-7">
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-3 -top-5 flex items-center gap-1 text-primary-400/20"
            >
              <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 10.5L12 3l9 7.5" />
                <path d="M5 9.5V20h14V9.5" />
                <path d="M10 20v-5h4v5" />
              </svg>
              <svg className="h-7 w-7 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8.5" cy="8.5" r="3.5" />
                <path d="M11 11l9 9" />
                <path d="M16 16l2-2" />
                <path d="M18 18l2-2" />
              </svg>
            </div>
            <h1 className="relative text-2xl font-semibold tracking-tight">Créer un compte</h1>
          </div>
          <p className="mt-2 text-sm text-zinc-600">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-zinc-900 underline">
              Se connecter
            </Link>
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
                placeholder="Jean"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
                placeholder="Dupont"
              />
            </div>
          </div>

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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 pr-10 outline-none focus:border-zinc-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute inset-y-0 right-2 flex items-center text-zinc-500 hover:text-zinc-700"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58a2 2 0 102.84 2.84" />
                    <path d="M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7-1.04 2.34-2.76 4.25-4.91 5.41" />
                    <path d="M6.61 6.61C4.62 8 3.14 9.86 2 12c.66 1.48 1.63 2.83 2.84 3.97" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
{/* 
          <div className="space-y-1">
            <label className="text-sm font-medium">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
            >
              <option value="tenant">Locataire</option>
              <option value="owner">Propriétaire</option>
            </select>
            <p className="text-xs text-zinc-600 mt-1">
              Le rôle sert à personnaliser l&apos;expérience. Vous pourrez toujours publier une annonce plus tard.
            </p>
          </div> */}

          <div className="space-y-1">
            <label className="text-sm font-medium">Téléphone (optionnel)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
              placeholder="+237 6XX XXX XXX"
            />
            <p className="text-xs text-zinc-600">
              Recommandé si vous comptez publier une annonce (vous pourrez aussi l&apos;ajouter plus tard dans le profil).
            </p>
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
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60"
            >
              {loading ? "Création..." : "Créer le compte"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

