"use client";

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white/95">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Room
            </h3>
            <p className="mt-3 text-sm text-zinc-600">
              Trouvez et gérez facilement vos logements en ligne.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-900">
              Logements
            </h4>
            <ul className="mt-3 space-y-1 text-sm text-zinc-600">
              <li>
                <Link href="/listings" className="hover:text-zinc-900">
                  Rechercher un logement
                </Link>
              </li>
              <li>
                <Link href="/my-listings" className="hover:text-zinc-900">
                  Mes logements
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-zinc-900">
                  Mes favoris
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-900">
              Aide
            </h4>
            <ul className="mt-3 space-y-1 text-sm text-zinc-600">
              <li>
                <Link href="/faq" className="hover:text-zinc-900">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-zinc-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/account/settings" className="hover:text-zinc-900">
                  Paramètres du compte
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-900">
              Légal
            </h4>
            <ul className="mt-3 space-y-1 text-sm text-zinc-600">
              <li>
                <Link href="/legal/terms" className="hover:text-zinc-900">
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-zinc-900">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-zinc-100 pt-4 text-xs text-zinc-500 sm:flex-row">
          <p>© {year} Room. Tous droits réservés.</p>
          <p className="text-[11px]">
            Plateforme de mise en relation entre propriétaires et locataires.
          </p>
        </div>
      </div>
    </footer>
  );
}

