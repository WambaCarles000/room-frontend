"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import api from "@/lib/api";
import { usePathname } from "next/navigation";


export default function Header() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isActive = (href) => {
    if (href === "/" && pathname === "/") return true;
    if (href === "/listings" && (pathname === "/listings" || pathname.startsWith("/listings/"))) return true;
    if (href === "/favorites" && pathname === "/favorites") return true;
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    return false;
  };
  const getLinkClasses = (href) => {
    const baseClasses = "text-sm font-medium transition";
    const activeClasses = "text-zinc-900 font-semibold"; // Actif : plus sombre
    const inactiveClasses = "text-zinc-600 hover:text-zinc-900";
    return isActive(href) ? `${baseClasses} ${activeClasses}` : `${baseClasses} ${inactiveClasses}`;
  };

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

  const userInitial =
    user?.user_metadata?.first_name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "?";

  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
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
            {/* <Link
              href="/listings"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition"
            >
              Logements
            </Link> */}
            <Link href="/listings" className={`${getLinkClasses("/listings")} relative`}>
              Logements
              {isActive("/listings") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900"></span>
              )}
            </Link>
            <Link href="/favorites" className={`${getLinkClasses("/favorites")} relative`}>
              Favoris
              {isActive("/favorites") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900"></span>
              )}
            </Link>
            <Link href="/dashboard" className={`${getLinkClasses("/dashboard")} relative`}>
              Dashboard
              {isActive("/dashboard") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900"></span>
              )}
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
                  title={user.user_metadata?.first_name || "Mon compte"}
                >
                  {userInitial}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white shadow-lg">
                    {/* User Info */}
                    <div className="border-b border-zinc-200 p-4">
                      <p className="text-base font-semibold text-zinc-900 mb-1">
                        {user.user_metadata?.first_name || "Mon Profil"}
                      </p>
                      {/* Email masqué pour plus de confidentialité */}
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
                        href="/my-listings"
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
                          Mes logements
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

                      <Link
                        href="/account/settings"
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
                      </Link>
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

      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
}
