"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import ProfileSettingsModal from "@/components/ProfileSettingsModal";

const PUBLIC_NAV = [{ href: "/listings", label: "Logements" }];

const AUTH_NAV = [
  { href: "/favorites", label: "Favoris" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Header() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }

  function closeMenus() {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }

  const userInitial =
    user?.user_metadata?.first_name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "?";

  const isActive = (href) => {
    if (href === "/" && pathname === "/") return true;
    if (href === "/listings" && (pathname === "/listings" || pathname.startsWith("/listings/"))) return true;
    if (href === "/favorites" && pathname === "/favorites") return true;
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    if (href === "/my-listings" && pathname === "/my-listings") return true;
    return false;
  };

  const getLinkClasses = (href) => {
    const baseClasses =
      "rounded-lg px-3 py-2 text-sm font-medium transition-colors";
    const activeClasses = "bg-primary-500 text-white";
    const inactiveClasses = "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900";
    return isActive(href) ? `${baseClasses} ${activeClasses}` : `${baseClasses} ${inactiveClasses}`;
  };

  const getMobileLinkClasses = (href) => {
    const base = "block rounded-lg px-3 py-2.5 text-sm font-medium transition";
    return isActive(href)
      ? `${base} bg-primary-500 text-white`
      : `${base} text-zinc-800 hover:bg-primary-50 hover:text-primary-700`;
  };

  const navLinks = user ? [...PUBLIC_NAV, ...AUTH_NAV] : PUBLIC_NAV;

  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" onClick={closeMenus}>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary-900 to-primary-700 text-white font-bold text-lg group-hover:shadow-lg transition">
              R
            </div>
            <span className="text-xl font-bold text-zinc-900 hidden sm:block">
              Room
            </span>
          </Link>

          {/* Menu principal — desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} className={getLinkClasses(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {isLoading ? (
              <div className="h-10 w-10 rounded-full bg-zinc-200 animate-pulse" />
            ) : user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white font-semibold hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
                  title={user.user_metadata?.first_name || "Mon compte"}
                >
                  {userInitial}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white shadow-lg z-50">
                    <div className="border-b border-zinc-200 p-4">
                      <p className="text-base font-semibold text-zinc-900 mb-1">
                        {user.user_metadata?.first_name || "Mon Profil"}
                      </p>
                    </div>

                    <div className="p-2">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 rounded-lg text-sm text-zinc-900 hover:bg-zinc-100 transition"
                        onClick={closeMenus}
                      >
                        Mon Dashboard
                      </Link>
                      <Link
                        href="/listings"
                        className="block px-4 py-2 rounded-lg text-sm text-zinc-900 hover:bg-zinc-100 transition"
                        onClick={closeMenus}
                      >
                        Trouver un logement
                      </Link>
                      <Link
                        href="/my-listings"
                        className="block px-4 py-2 rounded-lg text-sm text-zinc-900 hover:bg-zinc-100 transition"
                        onClick={closeMenus}
                      >
                        Mes logements
                      </Link>
                      <Link
                        href="/favorites"
                        className="block px-4 py-2 rounded-lg text-sm text-zinc-900 hover:bg-zinc-100 transition"
                        onClick={closeMenus}
                      >
                        Mes favoris
                      </Link>
                      <button
                        type="button"
                        className="block w-full px-4 py-2 rounded-lg text-sm text-zinc-900 hover:bg-zinc-100 transition text-left"
                        onClick={() => {
                          closeMenus();
                          setIsSettingsOpen(true);
                        }}
                      >
                        Paramètres
                      </button>
                    </div>

                    <div className="border-t border-zinc-200 p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition font-medium"
                      >
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition"
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}

            {/* Hamburger — mobile */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-300 hover:bg-zinc-100 transition"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <nav className="md:hidden border-t border-zinc-200 bg-white px-4 py-4 shadow-lg relative z-50">
          {user && (
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-semibold text-white">
                {userInitial}
              </div>
              <p className="text-sm font-semibold text-zinc-900">
                {user.user_metadata?.first_name || user.email || "Mon compte"}
              </p>
            </div>
          )}

          <ul className="space-y-1">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={getMobileLinkClasses(item.href)} onClick={closeMenus}>
                  {item.label}
                </Link>
              </li>
            ))}
            {user && (
              <>
                <li>
                  <Link href="/my-listings" className={getMobileLinkClasses("/my-listings")} onClick={closeMenus}>
                    Mes logements
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-zinc-800 hover:bg-primary-50 hover:text-primary-700"
                    onClick={() => {
                      closeMenus();
                      setIsSettingsOpen(true);
                    }}
                  >
                    Paramètres
                  </button>
                </li>
              </>
            )}
          </ul>

          <div className="mt-4 border-t border-zinc-100 pt-4">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Se déconnecter
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="rounded-lg border border-zinc-200 px-4 py-2.5 text-center text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                  onClick={closeMenus}
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-primary-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-600"
                  onClick={closeMenus}
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}

      {(isDropdownOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-30 top-16 md:top-0"
          onClick={closeMenus}
          aria-hidden="true"
        />
      )}

      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSuccess={() => {
          const supabase = createClient();
          supabase.auth.getUser().then(({ data: { user: refreshed } }) => {
            setUser(refreshed);
          });
        }}
      />
    </header>
  );
}
