
"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser";
import Link from "next/link";
import ListingCardV2 from "@/components/ListingCardV2";
import api from "@/lib/api";
import ListingFilters from "@/components/ListingFilters";

export default function FavoritesPage() {
  const [allFavorites, setAllFavorites] = useState([]); // ✅ Tous les favoris
  const [filteredFavorites, setFilteredFavorites] = useState([]); // ✅ Favoris filtrés
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    types: [],
    maxPrice: null,
  });

  // ✅ STEP 1 : Récupérer l'utilisateur et charger les favoris UNE FOIS
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setError("Vous devez être connecté pour voir vos favoris");
        setLoading(false);
        return;
      }
      setUser(user);
      fetchFavorites(); // ✅ Charger les favoris une seule fois
    });
  }, []); // ✅ Dépendance vide : une seule fois au montage

  // ✅ STEP 2 : Récupérer les favoris depuis l'API
  async function fetchFavorites() {
    try {
      setLoading(true);
      const data = await api.get("/favorites", { auth: true });
      setAllFavorites(data || []); // ✅ Stocker TOUS les favoris
      applyFilters(data || []); // ✅ Appliquer les filtres immédiatement
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ✅ STEP 3 : Appliquer les filtres quand ils changent
  const applyFilters = useCallback((favoritesToFilter) => {
    let result = [...favoritesToFilter];

    // Filtre de recherche
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter((favorite) =>
        (favorite.listing?.title?.toLowerCase() || "").includes(search) ||
        (favorite.listing?.description?.toLowerCase() || "").includes(search) ||
        (favorite.listing?.location?.toLowerCase() || "").includes(search) ||
        (favorite.listing?.city?.toLowerCase() || "").includes(search) ||
        (favorite.listing?.district?.toLowerCase() || "").includes(search)
      );
    }

    // Filtre de statut
    if (filters.status) {
      result = result.filter((favorite) => favorite.listing?.status === filters.status);
    }

    // Filtre de type
    if (filters.types && filters.types.length > 0) {
      result = result.filter((favorite) =>
        filters.types.includes(favorite.listing?.type)
      );
    }

    // Filtre de prix
    if (filters.maxPrice) {
      result = result.filter((favorite) =>
        favorite.listing?.price <= filters.maxPrice
      );
    }

    setFilteredFavorites(result);
  }, [filters]);

  // ✅ STEP 4 : Réappliquer les filtres quand les données ou filtres changent
  useEffect(() => {
    applyFilters(allFavorites);
  }, [filters, applyFilters]); // ✅ Dépendances correctes

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
            className="inline-block mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/25 via-transparent to-zinc-200/30" />
        <div className="absolute -top-16 -left-12 text-primary-300/35">
          <svg className="h-44 w-44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div className="absolute top-10 right-8 text-zinc-400/30">
          <svg className="h-24 w-24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V20h14V9.5" />
            <path d="M10 20v-5h4v5" />
          </svg>
        </div>
        <div className="absolute bottom-10 left-10 text-primary-400/25">
          <svg className="h-16 w-16 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="8.5" cy="8.5" r="3.5" />
            <path d="M11 11l9 9" />
            <path d="M16 16l2-2" />
            <path d="M18 18l2-2" />
          </svg>
        </div>
        <div className="absolute -bottom-14 right-1/4 text-primary-300/20">
          <svg className="h-48 w-48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-12">
          {/* <h1 className="text-3xl font-bold text-zinc-900 mb-2">Mes favoris</h1> */}
                {/* Filtres */}
        {allFavorites.length > 0 && (
          <ListingFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={() =>
              setFilters({
                search: "",
                status: "",
                types: [],
                maxPrice: null,
              })
            }
            totalCount={filteredFavorites.length}
          />
        )}
          {/* <p className="text-zinc-600 mt-3">
            Vous avez {allFavorites.length} annonce{allFavorites.length !== 1 ? "s" : ""}{" "}
            en favori
          </p> */}
        </div>

  

        {/* Messages d'erreur */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Contenu */}
        {allFavorites.length === 0 ? (
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
            <h3 className="text-lg font-bold text-zinc-900 mb-2">
              Aucun favori
            </h3>
            <p className="text-zinc-600 mb-6">
              Vous n'avez pas encore d'annonce en favori
            </p>
            <Link
              href="/listings"
              className="inline-block px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            >
              Découvrir les annonces
            </Link>
          </div>
        ) : filteredFavorites.length === 0 ? (
          // ✅ CAS : Y a des favoris mais les filtres n'en montrent aucun
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Aucun résultat
            </h3>
            <p className="text-zinc-600 mb-6">
              Aucun favori ne correspond à votre recherche
            </p>
            <button
              onClick={() =>
                setFilters({ search: "", status: "", types: [], maxPrice: null })
              }
              className="inline-block px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          // ✅ AFFICHER LES FAVORIS FILTRÉS
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFavorites.map((favorite) => (
              <ListingCardV2
                key={favorite.id}
                listing={favorite.listing}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}