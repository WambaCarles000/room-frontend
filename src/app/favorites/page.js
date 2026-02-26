"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import api from "@/lib/api";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setError("Vous devez être connecté pour voir vos favoris");
        setLoading(false);
        return;
      }
      setUser(user);
      fetchFavorites();
    });
  }, []);

  async function fetchFavorites() {
    try {
      const data = await api.get('/favorites', { auth: true });
      setFavorites(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-zinc-200 border-t-zinc-900 animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600">Chargement des favoris...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">
            Connectez-vous pour voir vos favoris
          </h2>
          <Link
            href="/login"
            className="inline-block mt-4 px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition"
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Mes favoris</h1>
          <p className="text-zinc-600">
            Vous avez {favorites.length} annonce{favorites.length !== 1 ? "s" : ""}{" "}
            en favori
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="h-16 w-16 text-zinc-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Aucun favori
            </h3>
            <p className="text-zinc-600 mb-6">
              Vous n'avez pas encore d'annonce en favori
            </p>
            <Link
              href="/listings"
              className="inline-block px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition"
            >
              Découvrir les annonces
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <Link
                key={favorite.id}
                href={`/listings/${favorite.listing.id}`}
              >
                <ListingCard listing={favorite.listing} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
