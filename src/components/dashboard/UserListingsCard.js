"use client";

import Link from "next/link";
import RoomLoader from "@/components/RoomLoader";

const statusStyles = {
  available: { label: "Disponible", color: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
  rented: { label: "Loué", color: "bg-amber-500", badge: "bg-amber-50 text-amber-700" },
  taken: { label: "Réservé", color: "bg-sky-500", badge: "bg-sky-50 text-sky-700" },
  sold: { label: "Vendu", color: "bg-rose-500", badge: "bg-rose-50 text-rose-700" },
};

function formatPrice(price, currency = "XAF") {
  const value = Number(price);
  if (!Number.isFinite(value)) return null;

  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

export default function UserListingsCard({ listings = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <RoomLoader size="sm" label="Chargement des logements" />
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="py-5 text-center">
        <p className="text-sm text-zinc-500">Aucun logement publié</p>
        <Link
          href="/listings"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800"
        >
          Créer un logement
        </Link>
      </div>
    );
  }

  const visibleListings = listings.slice(0, 4);

  return (
    <ul>
      {visibleListings.map((listing) => {
        const status = statusStyles[listing.status] || statusStyles.available;
        const price = formatPrice(listing.price, listing.currency || "XAF");
        const location = [listing.district, listing.city].filter(Boolean).join(", ");

        return (
          <li
            key={listing.id}
            className="border-b border-zinc-100 last:border-b-0"
          >
            <Link
              href={`/listings/${listing.id}`}
              className="group flex items-center justify-between gap-3 rounded-md py-3 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${status.color}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 group-hover:text-primary-700">
                    {listing.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {location || "Emplacement non précisé"}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-zinc-900">
                  {price || "Prix non précisé"}
                </p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${status.badge}`}>
                  {status.label}
                </span>
              </div>
            </Link>
          </li>
        );
      })}

      {listings.length > 4 && (
        <li className="pt-3 text-right">
          <Link
            href="/my-listings"
            className="text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            Voir tous mes logements
          </Link>
        </li>
      )}
    </ul>
  );
}
