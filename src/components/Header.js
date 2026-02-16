"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function Header() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsDropdownOpen(false);
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo et titre */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-700 text-white font-bold text-lg group-hover:shadow-lg transition">
              R
            </div>
            <span className="text-xl font-bold text-zinc-900 hidden sm:block">
              Room
            </span>
          </Link>

          {/* Menu principal */}
          <nav className="flex items-center gap-6">
            <Link
              href="/listings"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition"
            >
              Logements
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition"
            >
              Dashboard
            </Link>
          </nav>

          {/* Profil utilisateur */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-10 w-10 rounded-full bg-zinc-200 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 text-white font-semibold hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
                  title={user.email}
                >
                  {userInitial}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white shadow-lg">
                    {/* User Info */}
                    <div className="border-b border-zinc-200 p-4">
                      <p className="text-sm font-medium text-zinc-900">
                        {user.user_metadata?.name || "Utilisateur"}
                      </p>
                      <p className="text-xs text-zinc-600 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 rounded-lg text-sm text-zinc-900 hover:bg-zinc-100 transition"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          Mon Dashboard
                        </span>
                      </Link>

                      <Link
                        href="/listings"
                        className="block px-4 py-2 rounded-lg text-sm text-zinc-900 hover:bg-zinc-100 transition"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
                            />
                          </svg>
                          Mesures mes annonces
                        </span>
                      </Link>

                      <Link
                        href="/favorites"
                        className="block px-4 py-2 rounded-lg text-sm text-zinc-900 hover:bg-zinc-100 transition"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          Mes favoris
                        </span>
                      </Link>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          // Navigate to settings
                        }}
                        className="w-full text-left px-4 py-2 rounded-lg text-sm text-zinc-900 hover:bg-zinc-100 transition"
                      >
                        <span className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Paramètres
                        </span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-zinc-200 p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition font-medium flex items-center gap-2"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition hidden sm:block"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition"
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
}
