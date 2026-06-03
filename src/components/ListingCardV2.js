import { useRouter } from "next/navigation";
import { LuHouse } from "react-icons/lu";
import { IoKeyOutline } from "react-icons/io5";

export default function ListingCard({
  listing,
  isOwner,
  isArchived = false,
  isInactive = false,
  onEditClick,
  onArchiveClick,
  canFavorite = false,
  isFavorite = false,
  onToggleFavorite,
}) {
  const router = useRouter();
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
        className: "bg-red-100 text-red-800 font-bold",
      },
      rented: {
        label: "Loué",
        className: "bg-orange-100 text-orange-800 font-bold",
      },
      taken: {
        label: "Réservé",
        className: "bg-orange-100 text-orange-800 font-bold",
      },
    };
    return badges[status] || badges.available;
  };

  const statusBadge = getStatusBadge(listing.status);
  const coverImageUrl = listing?.images?.[0]?.imageUrl || null;
  const listingHref = `/listings/${listing.id}`;

  return (
    <article
      className={`group h-full cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-lg ${
        isArchived || isInactive ? "border-zinc-300 opacity-75" : "border-zinc-200"
      }`}
      role="link"
      tabIndex={0}
      onClick={() => router.push(listingHref)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(listingHref);
        }
      }}
      aria-label={`Voir les détails de ${listing.title}`}
    >
      {/* Image container */}
      <div className="relative h-48 w-full bg-gradient-to-br from-zinc-100 to-zinc-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
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
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[1] translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="line-clamp-4 text-sm text-white/95">
            {listing.description}
          </p>
        </div>

        {/* Favorite heart */}
        {canFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite?.(listing?.id);
            }}
            className={`absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur transition ${
              isFavorite
                ? "border-red-200 bg-white/90 text-red-600 hover:bg-red-50"
                : "border-primary-200 bg-white/80 text-primary-700 hover:bg-primary-50"
            }`}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <svg
              className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        )}

        {/* Status badge */}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {isArchived && (
            <span className="rounded-full bg-zinc-700 px-3 py-1 text-xs font-semibold text-white">
              Archivé
            </span>
          )}
          {isInactive && listing.status === "sold" && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
              Vendu (hors catalogue)
            </span>
          )}
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>
        </div>

        {/* Owner indicator */}
        {isOwner && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-blue-600 text-white text-xs font-semibold px-3 py-1">
              Votre logement
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Type */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-zinc-900 line-clamp-2 flex-1">
            {listing.title}
          </h3>
          <span className="shrink-0 rounded bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800 whitespace-nowrap">
            {getTypeLabel(listing.type)}
          </span>
        </div>

        {/* Info grid */}
        <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
          {listing.square_meters && (
            <div className="flex items-center gap-1 text-zinc-600 bg-zinc-50 rounded p-2">
              <span><LuHouse /></span>
              <span className="font-medium">{listing.square_meters} m²</span>
            </div>
          )}
          {listing.deposit_months && (
            <div className="flex items-center gap-1 text-zinc-600 bg-zinc-50 rounded p-2">
              <span><IoKeyOutline /></span>
              <span className="font-medium">{listing.deposit_months} mois</span>
            </div>
          )}
        </div>

        {/* Location */}
        {listing.location && (
          <div className="mb-2 flex items-start gap-2 text-sm text-zinc-600">
            <svg
              className="h-4 w-4 shrink-0 mt-0.5"
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
            <span className="line-clamp-1">{listing.location}</span>
          </div>
        )}

        {/* Price */}
        <div className="border-t border-zinc-100 pt-2">
          <p className="text-lg font-semibold text-zinc-900">
            {formatPrice(listing.price)}
            <span className="text-xs font-normal text-zinc-600 ml-2">
              {listing.price_period || "/mois"}
            </span>
          </p>
        </div>

        {/* Actions */}
        {isOwner && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditClick?.();
              }}
              className="flex-1 rounded-lg bg-primary-500 px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-600 transition"
              title="Modifier"
            >
              Modifier
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onArchiveClick?.();
              }}
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
              title={isArchived ? "Désarchiver" : "Archiver"}
            >
              {isArchived ? "Désarchiver" : "Archiver"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
