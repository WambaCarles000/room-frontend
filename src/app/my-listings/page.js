"use client";

import { useEffect, useState, useCallback } from "react";
import ListingCardV2 from "@/components/ListingCardV2";
import ListingFilters from "@/components/ListingFilters";
import EditListingModal from "@/components/EditListingModal";
import api from "@/lib/api";

export default function MyListingsPage() {
  const [allListings, setAllListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    types: [],
    maxPrice: null,
    showArchived: false,
    showHidden: false,
  });
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    const loadMyListings = async () => {
      try {
        setLoading(true);
        const data = await api.get("/listings/user", { auth: true });
        setAllListings(data || []);
      } catch (err) {
        setError(err.message || "Erreur lors du chargement de vos logements");
      } finally {
        setLoading(false);
      }
    };

    loadMyListings();
  }, []);

  const applyFilters = useCallback(
    (listingsToFilter) => {
      let result = [...listingsToFilter];

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

      if (filters.status) {
        result = result.filter((listing) => listing.status === filters.status);
      }

      if (filters.types && filters.types.length > 0) {
        result = result.filter((listing) => filters.types.includes(listing.type));
      }

      if (filters.maxPrice) {
        result = result.filter((listing) => listing.price <= filters.maxPrice);
      }

      if (filters.showArchived) {
        result = result.filter((listing) => !!listing.archived_at);
      } else if (filters.showHidden) {
        result = result.filter(
          (listing) => !listing.is_active && !listing.archived_at
        );
      } else {
        result = result.filter(
          (listing) => listing.is_active && !listing.archived_at
        );
      }

      setFilteredListings(result);
    },
    [filters]
  );

  useEffect(() => {
    applyFilters(allListings);
  }, [allListings, filters, applyFilters]);

  const handleOpenEditModal = (listing) => {
    setEditingListing(listing);
    setIsEditModalOpen(true);
  };

  const refreshListings = async () => {
    try {
      const data = await api.get("/listings/user", { auth: true });
      setAllListings(data || []);
    } catch {
      // on garde les données actuelles si erreur de rafraîchissement
    }
  };

  const handleEditSuccess = async () => {
    await refreshListings();
  };

  const handleArchiveToggle = async (listing) => {
    const isArchived = !!listing.archived_at;
    setActionMessage(null);
    setError(null);
    try {
      if (isArchived) {
        await api.patch(`/listings/${listing.id}/unarchive`, {}, { auth: true });
        setActionMessage("Annonce réactivée dans le catalogue.");
      } else {
        await api.patch(`/listings/${listing.id}/archive`, {}, { auth: true });
        setActionMessage(
          "Annonce archivée : elle n'apparaît plus dans le catalogue. Cochez « Afficher archivés » pour la revoir."
        );
      }
      await refreshListings();
    } catch (err) {
      setError(err.message || "Impossible de mettre à jour l'annonce");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                Mes logements
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                Gérez les logements que vous avez publiés.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <ListingFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() =>
          setFilters({
            search: "",
            status: "",
            types: [],
            maxPrice: null,
            showArchived: false,
            showHidden: false,
          })
        }
        totalCount={filteredListings.length}
        showArchivedToggle
        showHiddenToggle
      />

      {actionMessage && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {actionMessage}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-16 text-center">
            <p className="mt-4 text-lg font-medium text-zinc-900">
              Vous n&apos;avez pas encore publié de logement.
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              Rendez-vous sur la page des logements pour en créer un nouveau.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => (
              <ListingCardV2
                key={listing.id}
                listing={listing}
                isOwner
                showManageActions
                isArchived={!!listing.archived_at}
                isInactive={!listing.is_active && !listing.archived_at}
                onEditClick={() => handleOpenEditModal(listing)}
                onArchiveClick={
                  listing.status === "sold" ? undefined : () => handleArchiveToggle(listing)
                }
              />
            ))}
          </div>
        )}
      </main>

      {editingListing && (
        <EditListingModal
          listing={editingListing}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingListing(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

