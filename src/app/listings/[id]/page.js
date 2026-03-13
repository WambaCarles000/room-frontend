"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { createClient } from "@/lib/supabase/browser";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import ReportModal from "@/components/ReportModal";
import { LuHouse } from "react-icons/lu";
import { IoKeyOutline } from "react-icons/io5";
import { IoCheckmarkCircle } from "react-icons/io5";
import { IoCalendar } from "react-icons/io5";
import { CiShare2 } from "react-icons/ci";
import Popup from "@/components/popups";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
export default function ListingDetailsPage({ params }) {
  const { id } = use(params);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [token, setToken] = useState(null);

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

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!user || !message.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/contact-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          message: message.trim(),
          listingId: id,
        }),
      });
      if (res.ok) {
        setMessage("");
        alert("Message envoyé avec succès !");
      }
    } catch (err) {
      alert("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
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
    currency: "XAF",
  });

  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const hasImages = images.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      {/* Galerie d'images */}
      <div className="relative bg-zinc-900 h-96 sm:h-[500px] overflow-hidden group">
        {hasImages ? (
          <>
            <img
              src={images[currentImageIndex]?.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover transition-all"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 text-zinc-900 hover:bg-white shadow-lg transition opacity-0 group-hover:opacity-100"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 text-zinc-900 hover:bg-white shadow-lg transition opacity-0 group-hover:opacity-100"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-2 rounded-full transition ${idx === currentImageIndex ? "bg-white w-8" : "bg-white/50 w-2"
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="h-24 w-24 text-zinc-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <FavoriteButton listingId={id} />
          {/* <ShareButton listingId={id} /> */}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* En-tête */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="inline-block rounded-full bg-gradient-to-r from-zinc-200 to-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 mb-4">
                {listing.type === "studio"
                  ? "🏠 Studio"
                  : listing.type === "chambre"
                    ? "🛏️ Chambre"
                    : "🏢 Appartement"}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-3">
                {listing.title}
              </h1>
              <div className="flex items-center gap-2 text-zinc-600 text-lg">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  {listing.district}, {listing.city}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-zinc-900">{pricePerMonth}</p>
              <p className="text-zinc-600 mt-2">/mois</p>
            </div>
          </div>
        </div>

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

            {/* Caractéristiques */}
            {(listing.square_meters || listing.deposit_months || listing.availability_date) && (
              <section className="rounded-2xl border border-zinc-200 bg-white p-8">
                <h2 className="text-2xl font-bold text-zinc-900 mb-6">
                  Caractéristiques
                </h2>
                <div className="grid gap-6 sm:grid-cols-3">
                  {listing.square_meters && (
                    <div className="rounded-xl bg-zinc-50 p-6 text-center">
                      <p className="text-4xl mb-2 inline-block"><LuHouse className=" text-green-500" /></p>
                      <p className="text-sm text-zinc-600 mb-1">Superficie</p>
                      <p className="text-xl font-bold text-zinc-900">
                        {listing.square_meters} m²
                      </p>
                    </div>
                  )}
                  {listing.deposit_months && (
                    <div className="rounded-xl bg-zinc-50 p-6 text-center">
                      <p className="text-4xl mb-2 inline-block"><IoKeyOutline className=" text-green-500" /></p>
                      <p className="text-sm text-zinc-600 mb-1">Caution</p>
                      <p className="text-xl font-bold text-zinc-900">
                        {listing.deposit_months} mois
                      </p>
                    </div>
                  )}
                  {listing.availability_date && (
                    <div className="rounded-xl bg-zinc-50 p-6 text-center">
                      <p className="text-4xl mb-2 inline-block"><IoCalendar className=" text-green-500" /></p>
                      <p className="text-sm text-zinc-600 mb-1">Disponibilité</p>
                      <p className="text-xl font-bold text-zinc-900">
                        {new Date(listing.availability_date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Status */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-8">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Statut</h2>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50">
                {listing.status === "available" && (
                  <>
                    <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse"></div>
                    <div>
                      <p className="font-semibold text-green-700">Disponible</p>
                      <p className="text-sm text-green-600">Prêt à être loué dès maintenant</p>
                    </div>
                  </>
                )}
                {listing.status === "rented" && (
                  <>
                    <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                    <div>
                      <p className="font-semibold text-yellow-700">Loué</p>
                      <p className="text-sm text-yellow-600">Actuellement occupé</p>
                    </div>
                  </>
                )}
                {listing.status === "sold" && (
                  <>
                    <div className="h-4 w-4 rounded-full bg-zinc-500"></div>
                    <div>
                      <p className="font-semibold text-zinc-700">Vendu</p>
                      <p className="text-sm text-zinc-600">Non disponible</p>
                    </div>
                  </>
                )}
                {listing.status === "taken" && (
                  <>
                    <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                    <div>
                      <p className="font-semibold text-orange-700">Réservé</p>
                      <p className="text-sm text-orange-600">Actuellement réservé</p>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Galerie complète */}
            {hasImages && images.length > 1 && (
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
            )}

            {/* Formulaire de contact */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-8">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">
                Interested? Send a message
              </h2>
              {user ? (
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    rows="5"
                    className="w-full rounded-xl border border-zinc-200 p-4 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition text-base"
                    required
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 px-6 py-4 font-semibold text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-lg"
                  >
                    {sending ? "📤 Envoi en cours..." : "✉️ Envoyer le message"}
                  </button>
                </form>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
                  <p className="font-medium">
                    Connectez-vous pour envoyer un message au propriétaire
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href="/login"
                      className="flex-1 rounded-lg bg-amber-200 px-4 py-2 text-center font-medium hover:bg-amber-300 transition"
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/signup"
                      className="flex-1 rounded-lg border border-amber-300 px-4 py-2 text-center font-medium hover:bg-amber-100 transition"
                    >
                      S&apos;inscrire
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Propriétaire */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8">
              <h3 className="text-xl font-bold text-zinc-900 mb-6">
                👤 Propriétaire
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {listing.owner?.email?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 text-lg">Propriétaire</p>
                    <p className="text-sm text-zinc-600 truncate">
                      {listing.owner?.email || "Inconnu"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t border-zinc-200">
                  {listing.owner?.phone && (
                    <a
                      href={`tel:${listing.owner.phone}`}
                      className="flex items-center justify-center gap-2 w-full rounded-lg border border-zinc-200 px-4 py-3 font-medium text-zinc-900 hover:bg-zinc-50 transition"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.418 1.738 1.48 3.578 2.922 5.02a9.716 9.716 0 005.02 2.922l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a2 2 0 01-2 2h-1C9.716 19 3 12.284 3 4V3z" />
                      </svg>
                      Appeler
                    </a>
                  )}
                  <a
                    href={`mailto:${listing.owner?.email}`}
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white hover:bg-zinc-800 transition"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Email
                  </a>
                  {user?.email !== listing.owner?.email && (
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="flex items-center justify-center gap-2 w-full rounded-lg border border-red-200 px-4 py-3 font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.82 1.573l-7 10A1 1 0 08 15H3a3 3 0 01-3-3V6a1 1 0 011-1h.01a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      Signaler
                    </button>
                  )}
                </div>

                {/* Activité du bailleur */}
            
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

            {/* Partager */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8">

              <div className="flex gap-2 flex-col">

                <ShareButton
                  listingId={id}
                  listingTitle={listing.title}
                  listingUrl={`${SITE_URL}/listings/${id}`}
                />

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    Popup("Lien copié avec succès", "success");
                  }}
                  className="w-full rounded-lg bg-zinc-100 px-4 py-2 text-center font-medium text-zinc-900 hover:bg-zinc-200 transition"
                >
                  Copier le lien
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Retour */}
        <div className="mt-16 pt-8 border-t border-zinc-200 text-center">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 font-semibold text-lg"
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