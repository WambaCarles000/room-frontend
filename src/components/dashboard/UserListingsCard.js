"use client";

import Link from "next/link";

export default function UserListingsCard({ listings = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-500">Chargement...</p>
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center">
        <p className="text-sm text-zinc-500">Aucun logement publié</p>
        <Link
          href="/listings"
          className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Créer un logement →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4"
        >
          <div className="flex-1">
            <p className="font-medium text-zinc-900">{listing.title}</p>
            <p className="text-sm text-zinc-500">
              {listing.city} • {listing.district}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-zinc-900">{listing.price}€/mois</p>
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                listing.status === "available"
                  ? "bg-green-100 text-green-800"
                  : listing.status === "rented"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {listing.status === "available" ? "Disponible" : listing.status === "rented" ? "Loué" : "Vendu"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
