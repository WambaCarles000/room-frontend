const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const configuredSiteUrl =
  (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001").trim();
const SITE_URL = new URL(
  /^https?:\/\//i.test(configuredSiteUrl)
    ? configuredSiteUrl
    : `https://${configuredSiteUrl}`
).origin;

export async function generateMetadata({ params }) {
  // In Next 16, params can be a Promise
  const { id } = await params;

  try {
    // Le backend n'a pas encore d'endpoint /listings/:id,
    // on récupère donc la liste complète puis on filtre côté frontend.
    const res = await fetch(`${API_URL}/listings`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Listings fetch failed");
    }

    const allListings = await res.json();
    const listing = allListings.find((l) => l.id === id);
    if (!listing) {
      throw new Error("Listing not found");
    }

    const formatPrice = (price, currency = "XAF") => {
      const n = Number(price);
      if (!Number.isFinite(n)) return null;
      try {
        return new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }).format(n);
      } catch {
        return `${n}`;
      }
    };

    const typeLabel =
      listing.type === "studio"
        ? "Studio"
        : listing.type === "chambre"
        ? "Chambre"
        : listing.type === "appartement"
        ? "Appartement"
        : listing.type || "Logement";

    const locationParts = [listing.district, listing.city].filter(Boolean);
    const locationText = locationParts.length ? locationParts.join(", ") : null;
    const priceText = formatPrice(listing.price, listing.currency || "XAF");

    const baseTitle = listing.title || `${typeLabel}${locationText ? ` à ${locationText}` : ""}`;
    const title = `${baseTitle} - Room`;

    const rawDesc = (listing.description || "").replace(/\s+/g, " ").trim();
    const summaryBits = [
      typeLabel,
      locationText,
      priceText ? `${priceText}/mois` : null,
    ].filter(Boolean);
    const prefix = summaryBits.length ? `${summaryBits.join(" • ")} — ` : "";
    const descriptionCandidate = `${prefix}${rawDesc || "Découvrez ce logement sur Room."}`;
    const description = descriptionCandidate.slice(0, 160);

    const url = new URL(`/listings/${id}`, SITE_URL).toString();
    const imageUrl =
      listing.images?.[0]?.imageUrl ||
      new URL("/default-listing-cover.png", SITE_URL).toString();

    return {
      title,
      description,
      metadataBase: new URL(SITE_URL),
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: "article",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: listing.title || "Logement Room",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: "Logement - Room",
      description: "Découvrez ce logement sur Room.",
      metadataBase: new URL(SITE_URL),
      alternates: { canonical: new URL(`/listings/${id}`, SITE_URL).toString() },
      openGraph: {
        title: "Logement - Room",
        description: "Découvrez ce logement sur Room.",
        url: new URL(`/listings/${id}`, SITE_URL).toString(),
        type: "article",
      },
    };
  }
}

export default function ListingLayout({ children }) {
  return children;
}






