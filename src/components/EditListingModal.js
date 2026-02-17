"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function EditListingModal({ listing, isOpen, onClose, onSuccess, token }) {
  const [status, setStatus] = useState(listing?.status || "available");
  const [availabilityDate, setAvailabilityDate] = useState(
    listing?.availability_date ? new Date(listing.availability_date).toISOString().split("T")[0] : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/listings/${listing.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          availability_date: availabilityDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la mise à jour");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white shadow-lg">
        {/* Header */}
        <div className="border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">
              Modifier le logement
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Titre du logement */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-900">Logement</label>
            <p className="mt-1 text-sm text-zinc-600">{listing?.title}</p>
          </div>

          {/* Status */}
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-zinc-900">
              Statut
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="available">Disponible</option>
              <option value="rented">Loué</option>
              <option value="taken">Réservé</option>
              <option value="sold">Vendu</option>
            </select>
          </div>

          {/* Availability Date */}
          <div className="mb-6">
            <label htmlFor="availabilityDate" className="block text-sm font-medium text-zinc-900">
              Date de disponibilité
            </label>
            <input
              id="availabilityDate"
              type="date"
              value={availabilityDate}
              onChange={(e) => setAvailabilityDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          {/* Status Info */}
          <div className="mb-6 rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-700">
              <strong>Info:</strong> La mise à jour du statut modifiera la visibilité de votre logement.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition"
            >
              {loading ? "Chargement..." : "Mettre à jour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
