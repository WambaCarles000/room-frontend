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
      
      // Add phone only if user is owner
      if (role === "owner" && phone) {
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
              phone: role === "owner" ? phone : null,
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
            />
          </div>

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
            {role === "owner" && (
              <p className="text-xs text-blue-600 mt-1">
                ℹ️ Un champ pour votre numéro apparaîtra ci-dessous
              </p>
            )}
          </div>

          {role === "owner" && (
            <div className="space-y-1 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="text-sm font-medium text-blue-900">Votre numéro de téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
                placeholder="+237 6XX XXX XXX"
              />
              {/* <p className="text-xs text-blue-700">
                <strong>Note:</strong> Les locataires intéressés par vos logements pourront voir votre numéro.
              </p> */}
            </div>
          )}

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

