import Link from "next/link";

export default function ListingCard({ listing }) {
  const formatPrice = (price, currency = "XAF") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTypeLabel = (type) => {
    const labels = {
      studio: "Studio",
      chambre: "Chambre",
      appartement: "Appartement",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: {
        label: "Disponible",
        className: "bg-emerald-100 text-emerald-800",
      },
      sold: {
        label: "Vendu",
        className: "bg-zinc-100 text-zinc-800",
      },
      rented: {
        label: "Loué",
        className: "bg-blue-100 text-blue-800",
      },
    };
    return badges[status] || badges.available;
  };

  const statusBadge = getStatusBadge(listing.status);

  return (
    <div className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Image placeholder */}
      <div className="relative h-48 w-full bg-gradient-to-br from-zinc-100 to-zinc-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-12 w-12 text-zinc-400"
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
        </div>
        <div className="absolute right-3 top-3">
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 line-clamp-1">
            {listing.title}
          </h3>
          <span className="ml-2 shrink-0 rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
            {getTypeLabel(listing.type)}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-zinc-600">
          {listing.description}
        </p>

        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>
            {listing.district}, {listing.city}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
          <div>
            <p className="text-2xl font-bold text-zinc-900">
              {formatPrice(listing.price, listing.currency)}
            </p>
            {listing.currency !== "XAF" && (
              <p className="text-xs text-zinc-500">par mois</p>
            )}
          </div>
          <Link
            href={`/listings/${listing.id}`}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Voir détails
          </Link>
        </div>
      </div>
    </div>
  );
}
