"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import CreateListingForm from "@/components/CreateListingForm";
import ListingCard from "@/components/ListingCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    fetchListings();
  }, []);

  async function fetchListings() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/listings`);
      if (!res.ok) throw new Error("Erreur lors du chargement");
      const data = await res.json();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSuccess() {
    setShowForm(false);
    await fetchListings();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
              Logements disponibles
            </h1>
            <p className="mt-2 text-zinc-600">
              Découvrez notre sélection de logements
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {showForm ? "Annuler" : "Ajouter un logement"}
            </button>
          )}
        </div>

        {/* Formulaire de création */}
        {showForm && user && (
          <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900">
              Nouveau logement
            </h2>
            <CreateListingForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Message si non connecté */}
        {!user && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p>
              Connectez-vous pour ajouter un logement.{" "}
              <a href="/login" className="font-medium underline">
                Se connecter
              </a>
            </p>
          </div>
        )}

        {/* Liste des logements */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-zinc-400"
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
            <p className="mt-4 text-zinc-600">Aucun logement disponible</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
