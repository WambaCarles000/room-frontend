"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser";
import CreateListingForm from "@/components/CreateListingForm";
import ListingCardV2 from "@/components/ListingCardV2";
import ListingFilters from "@/components/ListingFilters";
import EditListingModal from "@/components/EditListingModal";
import api from "@/lib/api";


export default function ListingsPage() {
  const [allListings, setAllListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    types: [],
    maxPrice: null,
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setToken(session?.access_token || null);
    });
    fetchListings();
  }, []);

  const applyFilters = useCallback((listingsToFilter) => {
    let result = [...listingsToFilter];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (listing) =>
          (listing.title?.toLowerCase() || "").includes(search) ||
          (listing.description?.toLowerCase() || "").includes(search) ||
          (listing.location?.toLowerCase() || "").includes(search) ||
          (listing.city?.toLowerCase() || "").includes(search) ||
          (listing.district?.toLowerCase() || "").includes(search)
      );
    }

    // Status filter
    if (filters.status) {
      result = result.filter((listing) => listing.status === filters.status);
    }

    // Type filter
    if (filters.types && filters.types.length > 0) {
      result = result.filter((listing) => filters.types.includes(listing.type));
    }

    // Price filter
    if (filters.maxPrice) {
      result = result.filter((listing) => listing.price <= filters.maxPrice);
    }

    setFilteredListings(result);
  }, [filters]);

  useEffect(() => {
    applyFilters(allListings);
  }, [filters, allListings, applyFilters]);

  async function fetchListings() {
    try {
      setLoading(true);
      const data = await api.get("/listings");
      setAllListings(data || []);
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

  const handleOpenEditModal = (listing) => {
    setEditingListing(listing);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                Découvrez les logements
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                Trouvez le logement idéal parmi notre sélection
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition"
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
                Ajouter un logement
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <ListingFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() =>
          setFilters({ search: "", status: "", types: [], maxPrice: null })
        }
        totalCount={filteredListings.length}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Formulaire de création */}
        {showForm && user && (
          <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-zinc-900">
                Ajouter un nouveau logement
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-zinc-500 hover:text-zinc-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CreateListingForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Message si non connecté */}
        {!user && !showForm && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <strong>Envie de publier un logement ?</strong>
                <a href="/login" className="ml-2 font-medium underline hover:no-underline">
                  Connectez-vous ici
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-16 text-center">
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
            <p className="mt-4 text-lg font-medium text-zinc-900">
              Aucun logement ne correspond à votre recherche
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              Essayez d'ajuster vos filtres
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => {
              // Vérifier si l'utilisateur actuel est propriétaire du logement
              const isOwner = listing.owner && user && listing.owner.supabase_id === user.id;
              return (
                <ListingCardV2
                  key={listing.id}
                  listing={listing}
                  isOwner={isOwner}
                  onEditClick={() => handleOpenEditModal(listing)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingListing && (
        <EditListingModal
          listing={editingListing}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingListing(null);
          }}
          onSuccess={handleEditSuccess}
          token={token}
        />
      )}
    </div>
  );
}
