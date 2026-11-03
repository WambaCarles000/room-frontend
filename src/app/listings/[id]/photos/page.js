"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import RoomLoader from "@/components/RoomLoader";
import {
  getListingPhotoRoom,
  LISTING_PHOTO_ROOMS,
} from "@/lib/listingPhotoRooms";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");

export default function ListingPhotosPage({ params }) {
  const { id } = use(params);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchListing() {
      try {
        const response = await fetch(`${API_URL}/listings`);
        if (!response.ok) throw new Error("Impossible de charger les photos.");
        const listings = await response.json();
        const found = listings.find((item) => item.id === id);
        if (!found) throw new Error("Logement introuvable.");
        if (!cancelled) setListing(found);
      } catch (fetchError) {
        if (!cancelled) setError(fetchError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchListing();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <RoomLoader size="lg" label="Chargement des photos" />
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-16">
        <p className="text-zinc-700">{error || "Logement introuvable."}</p>
        <Link href={`/listings/${id}`} className="mt-4 inline-flex text-sm font-semibold text-primary-700 hover:text-primary-800">
          Retour au logement
        </Link>
      </main>
    );
  }

  const images = [...(listing.images || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const roomSections = LISTING_PHOTO_ROOMS.map((room) => ({
    ...room,
    images: images.filter((image) => getListingPhotoRoom(image.room).id === room.id),
  })).filter((room) => room.images.length > 0);
  const sections = [
    { ...LISTING_PHOTO_ROOMS[0], id: "all", label: "Toutes les photos", images },
    ...roomSections,
  ];

  return (
    <main className="min-h-screen bg-white pb-16">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5">
          <div className="min-w-0">
            <Link
              href={`/listings/${id}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-primary-700"
            >
              <span aria-hidden="true">←</span>
              Retour au logement
            </Link>
            <h1 className="mt-3 break-words text-2xl font-bold text-zinc-950 sm:text-3xl">
              Toutes les photos
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              {listing.title} <span className="px-1 text-zinc-400">·</span> {images.length} photo{images.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ShareButton
              listingId={id}
              listingTitle={listing.title}
              listingUrl={`${SITE_URL}/listings/${id}`}
            />
            <FavoriteButton listingId={id} />
          </div>
        </div>

        <nav aria-label="Sections des photos" className="sticky top-16 z-20 -mx-4 overflow-x-auto border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex min-w-max gap-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <a
                  key={section.id}
                  href={`#photos-${section.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
                >
                  <Icon className="h-4 w-4 text-primary-700" aria-hidden="true" />
                  {section.label}
                  <span className="text-xs text-zinc-500">{section.images.length}</span>
                </a>
              );
            })}
          </div>
        </nav>

        <div className="space-y-12 pt-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.id} id={`photos-${section.id}`} className="scroll-mt-36">
                <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-3">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-zinc-950">
                    <Icon className="h-5 w-5 text-primary-700" aria-hidden="true" />
                    {section.label}
                  </h2>
                  <span className="text-sm text-zinc-500">
                    {section.images.length} photo{section.images.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {section.images.map((image, index) => (
                    <figure key={image.id || image.imageUrl} className="overflow-hidden rounded-lg bg-zinc-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.imageUrl}
                        alt={`${section.label} — ${listing.title}, photo ${index + 1}`}
                        className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </figure>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}