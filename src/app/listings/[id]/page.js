"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { createClient } from "@/lib/supabase/browser";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import ReportModal from "@/components/ReportModal";
import ContactOwnerPanel from "@/components/ContactOwnerPanel";
import { LuHouse } from "react-icons/lu";
import { IoKeyOutline } from "react-icons/io5";
import { IoCalendar } from "react-icons/io5";
import { formatMemberSince } from "@/lib/formatDate";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
export default function ListingDetailsPage({ params }) {
  const { id } = use(params);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [token, setToken] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        setToken(session.access_token);
      }
    });
    fetchListing();
  }, [id]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setCurrentImageIndex((idx) => (idx === 0 ? images.length - 1 : idx - 1));
      }
      if (e.key === "ArrowRight") {
        setCurrentImageIndex((idx) => (idx === images.length - 1 ? 0 : idx + 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen]);

  async function fetchListing() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/listings`);
      if (!res.ok) throw new Error("Erreur lors du chargement");
      const listings = await res.json();
      const found = listings.find((l) => l.id === id);
      if (found) {
        setListing(found);
      } else {
        setError("Logement non trouvé");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-primary-500"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-red-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-800 font-medium">{error || "Logement non trouvé"}</p>
          <Link
            href="/listings"
            className="mt-4 inline-block text-red-600 hover:text-red-700 underline"
          >
            Retour aux logements
          </Link>
        </div>
      </div>
    );
  }

  const pricePerMonth = parseFloat(listing.price).toLocaleString("fr-FR", {
    style: "currency",
    currency: listing.currency || "XAF",
    maximumFractionDigits: 0,
  });

  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const hasImages = images.length > 0;
  const statusMeta = {
    available: { label: "Disponible", color: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
    rented: { label: "Loué", color: "bg-amber-500", badge: "bg-amber-50 text-amber-700" },
    taken: { label: "Réservé", color: "bg-sky-500", badge: "bg-sky-50 text-sky-700" },
    sold: { label: "Vendu", color: "bg-zinc-400", badge: "bg-zinc-100 text-zinc-700" },
  }[listing.status] || { label: "Statut inconnu", color: "bg-zinc-400", badge: "bg-zinc-100 text-zinc-700" };
  const characteristics = [
    listing.square_meters && {
      label: "Superficie",
      value: `${listing.square_meters} m²`,
      icon: <LuHouse aria-hidden="true" className="h-4 w-4" />,
    },
    listing.deposit_months && {
      label: "Caution",
      value: `${listing.deposit_months} mois`,
      icon: <IoKeyOutline aria-hidden="true" className="h-4 w-4" />,
    },
    listing.availability_date && {
      label: "Disponible à partir du",
      value: new Date(listing.availability_date).toLocaleDateString("fr-FR"),
      icon: <IoCalendar aria-hidden="true" className="h-4 w-4" />,
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      {/* Galerie d'images */}
      <div className="bg-transparent">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="relative">
            {hasImages ? (
              <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:grid-cols-4 lg:grid-rows-2">
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="relative col-span-1 row-span-1 h-[44vh] min-h-[280px] overflow-hidden bg-zinc-100 lg:col-span-2 lg:row-span-2 lg:h-[520px]"
                  title="Voir les photos"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[currentImageIndex]?.imageUrl}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                </button>

                {images.slice(0, 4).map((img, idx) => {
                  const absoluteIdx = idx;
                  return (
                    <button
                      key={img?.id || img?.imageUrl || idx}
                      type="button"
                      onClick={() => {
                        setCurrentImageIndex(absoluteIdx);
                        setIsLightboxOpen(true);
                      }}
                      className="relative hidden h-[256px] overflow-hidden bg-zinc-100 lg:block"
                      title="Voir la photo"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img?.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      {absoluteIdx === currentImageIndex && (
                        <span className="absolute inset-0 ring-2 ring-white/90" />
                      )}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-3 right-3 z-10 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-zinc-900 shadow-lg hover:bg-white"
                >
                  Voir toutes les photos
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentImageIndex((idx) =>
                          idx === 0 ? images.length - 1 : idx - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/85 p-2 text-zinc-900 shadow-lg hover:bg-white"
                      title="Photo précédente"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentImageIndex((idx) =>
                          idx === images.length - 1 ? 0 : idx + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/85 p-2 text-zinc-900 shadow-lg hover:bg-white"
                      title="Photo suivante"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex h-[44vh] min-h-[280px] items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <svg className="h-24 w-24 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            <div className="absolute right-3 top-3 z-50 flex gap-2">
              <ShareButton
                listingId={id}
                listingTitle={listing.title}
                listingUrl={`${SITE_URL}/listings/${id}`}
              />
              <FavoriteButton listingId={id} />
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox plein écran */}
      {isLightboxOpen && hasImages && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 flex items-center justify-center  sm:p-8 group"
            onClick={(e) => e.stopPropagation()}
            // Swipe tactile
            onTouchStart={(e) => {
              e._touchStartX = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const diff = e._touchStartX - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 50) {
                if (diff > 0) {
                  // Swipe gauche → image suivante
                  setCurrentImageIndex((idx) =>
                    idx === images.length - 1 ? 0 : idx + 1
                  );
                } else {
                  // Swipe droite → image précédente
                  setCurrentImageIndex((idx) =>
                    idx === 0 ? images.length - 1 : idx - 1
                  );
                }
              }
            }}
          >
            <div className="relative w-full sm:max-w-6xl">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="absolute -top-12 right-0 text-white/90 hover:text-white text-sm font-semibold"
              >
                Fermer (Esc)
              </button>

              {/* overflow-hidden retiré pour que les boutons -left-14 / -right-14 soient visibles */}
              <div className="relative sm:rounded-2xl bg-black sm:shadow-2xl sm:border sm:border-white/10">
                <img
                  src={images[currentImageIndex]?.imageUrl}
                  alt={listing.title}
                  className="w-full h-full sm:h-auto sm:max-h-[80vh] object-cover sm:object-contain bg-black sm:rounded-2xl"
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentImageIndex(
                          currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
                        )
                      }
                      className="absolute left-3 sm:-left-14 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white shadow-lg ring-1 ring-white/10 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Image précédente"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentImageIndex(
                          currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1
                        )
                      }
                      className="absolute right-3 sm:-right-14 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white shadow-lg ring-1 ring-white/10 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Image suivante"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white/90">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Contenu principal */}
      <div className="mx-auto max-w-5xl px-4 py-12">
        <section className="mb-8 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800">
                {listing.type === "studio"
                  ? "Studio"
                  : listing.type === "chambre"
                    ? "Chambre"
                    : "Appartement"}
              </span>
              <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                {listing.title}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{[listing.district, listing.city].filter(Boolean).join(", ") || "Lieu non précisé"}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
              <p className="text-xl font-bold text-zinc-950 sm:text-2xl">
                {pricePerMonth}
                <span className="ml-1 text-sm font-normal text-zinc-500">/mois</span>
              </p>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badge}`}>
                <span className={`h-2 w-2 rounded-full ${statusMeta.color}`} />
                {statusMeta.label}
              </span>
            </div>
          </div>

          {characteristics.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3 border-t border-zinc-100 pt-4">
              {characteristics.map((characteristic) => (
                <div key={characteristic.label} className="flex items-center gap-2.5">
                  <span className="text-zinc-500">{characteristic.icon}</span>
                  <div>
                    <p className="text-xs text-zinc-500">{characteristic.label}</p>
                    <p className="text-sm font-semibold text-zinc-900">{characteristic.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-8">
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">
                À propos du logement
              </h2>
              <p className="text-zinc-600 leading-relaxed text-lg">
                {listing.description}
              </p>
            </section>

            {/* Caractéristiques et Statut retirés */}

            {/* Galerie complète */}
            {/* {hasImages && images.length > 1 && (
              <section className="rounded-2xl border border-zinc-200 bg-white p-8">
                <h2 className="text-2xl font-bold text-zinc-900 mb-6">
                  Galerie Photos
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {images.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`rounded-xl overflow-hidden h-40 transition transform hover:scale-105 ${idx === currentImageIndex ? "ring-2 ring-zinc-900" : ""
                        }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </section>
            )} */}

            {/* Formulaire de contact retiré : contact direct via ContactOwnerPanel */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Propriétaire */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8">
              <ContactOwnerPanel
                owner={listing.owner}
                user={user}
                listingTitle={listing.title}
                onReportClick={() => setShowReportModal(true)}
              />

                <div className="mt-4 rounded-xl bg-zinc-50 border border-zinc-200 p-4 text-sm space-y-3">
                  <p className="text-xs font-bold tracking-wide  text-center text-zinc-900 ">
                    Activité
                  </p>

                  {(() => {
                    const total = listing.owner?.total_listings ?? 0;
                    const rented = listing.owner?.rented_listings ?? 0;
                    const taken = listing.owner?.taken_listings ?? 0;
                    const sold = listing.owner?.sold_listings ?? 0;
                    const reports = listing.owner?.reports_count ?? 0;
                    const available = Math.max(total - rented - taken - sold, 0);
                    const memberSince = formatMemberSince(listing.owner?.created_at);

                    return (
                      <>
                        {/* Grid responsive : 2 cols sur mobile, 4 sur lg+ */}
                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 text-center">
                          <div className="rounded-lg bg-white border border-zinc-200 p-3 flex flex-col items-center justify-center">
                            <p className="text-lg font-bold text-zinc-900">
                              {available}
                            </p>
                            <p className="text-xs text-zinc-600 leading-tight mt-1">
                              Disponibles
                            </p>
                          </div>
                          <div className="rounded-lg bg-white border border-zinc-200 p-3 flex flex-col items-center justify-center">
                            <p className="text-lg font-bold text-zinc-900">
                              {rented}
                            </p>
                            <p className="text-xs text-zinc-600 leading-tight mt-1">
                              Loués
                            </p>
                          </div>
                          <div className="rounded-lg bg-white border border-zinc-200 p-3 flex flex-col items-center justify-center">
                            <p className="text-lg font-bold text-zinc-900">
                              {taken}
                            </p>
                            <p className="text-xs text-zinc-600 leading-tight mt-1">
                              Réservés
                            </p>
                          </div>
                          <div className="rounded-lg bg-white border border-zinc-200 p-3 flex flex-col items-center justify-center">
                            <p className="text-lg font-bold text-zinc-900">
                              {sold}
                            </p>
                            <p className="text-xs text-zinc-600 leading-tight mt-1">
                              Vendus
                            </p>
                          </div>
                        </div>

                        {/* Footer avec infos complémentaires */}
                        <div className="space-y-2 pt-2 border-t border-zinc-200">
                          {memberSince && (
                            <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-600">
                              <IoCalendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              {memberSince}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-zinc-600">
                            <span className="font-medium">
                              {total} logement{total !== 1 ? "s" : ""} au total
                            </span>
                            <span className={`font-medium ${reports > 0 ? "text-red-600" : ""}`}>
                              {reports} signalement{reports !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
            </div>

          </div>
        </div>

        {/* Retour */}
        <div className="mt-13 pt-5 border-t border-zinc-200 text-center">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-primary-500  font-bold hover:text-primary-600 text-lg"
        
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Voir plus de logements
          </Link>
        </div>
      </div>

      {/* Modal de signalement */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetUser={listing?.owner}
        targetListing={listing}
        token={token}
        onSuccess={() => {
          setShowReportModal(false);
        }}
      />
    </div>
  );
}