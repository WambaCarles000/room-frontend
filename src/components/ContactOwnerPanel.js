"use client";

import { useState } from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { IoCallOutline, IoMailOutline, IoFlagOutline } from "react-icons/io5";

const CONTACTS_UNLOCKED =
  process.env.NEXT_PUBLIC_UNLOCK_OWNER_CONTACTS === "true";

function toWhatsAppUrl(phone, listingTitle) {
  const digits = String(phone).replace(/\D/g, "");
  const text = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par votre annonce "${listingTitle}" sur Room.`
  );
  return `https://wa.me/${digits}?text=${text}`;
}

export default function ContactOwnerPanel({
  owner,
  user,
  listingTitle,
  onReportClick,
}) {
  const [revealed, setRevealed] = useState(false);

  const isOwner = user?.email && owner?.email && user.email === owner.email;
  const ownerLabel =
    owner?.first_name || owner?.last_name
      ? [owner.first_name, owner.last_name].filter(Boolean).join(" ")
      : "Propriétaire";
  const ownerInitial =
    owner?.first_name?.charAt(0)?.toUpperCase() ||
    owner?.email?.charAt(0)?.toUpperCase() ||
    "?";

  function handleRevealContact() {
    if (CONTACTS_UNLOCKED) {
      setRevealed(true);
    }
    // TODO: brancher le flux de paiement ici en production
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-2xl font-bold text-white shadow-lg">
          {ownerInitial}
        </div>
        <div>
          <p className="text-lg font-semibold text-zinc-900">{ownerLabel}</p>
          <p className="text-sm text-zinc-600">Propriétaire</p>
        </div>
      </div>

      <div className="space-y-2 border-t border-zinc-200 pt-4">
        {!user ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">Connectez-vous pour contacter le propriétaire</p>
            <div className="mt-3 flex gap-2">
              <Link
                href="/login"
                className="flex-1 rounded-lg bg-amber-200 px-3 py-2 text-center font-medium hover:bg-amber-300 transition"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="flex-1 rounded-lg border border-amber-300 px-3 py-2 text-center font-medium hover:bg-amber-100 transition"
              >
                Inscription
              </Link>
            </div>
          </div>
        ) : isOwner ? (
          <p className="rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
            C&apos;est votre annonce.
          </p>
        ) : !revealed ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleRevealContact}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-3 font-medium text-white hover:bg-primary-600 transition"
            >
              Contacter le propriétaire
            </button>
            {!CONTACTS_UNLOCKED && (
              <p className="text-center text-xs text-zinc-500">
                Les coordonnées seront débloquées après paiement.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {owner?.phone && (
              <p className="text-center text-sm font-medium text-zinc-800">
                {owner.phone}
              </p>
            )}
            {owner?.email && (
              <p className="text-center text-sm text-zinc-600 break-all">
                {owner.email}
              </p>
            )}
            <div className="grid gap-2">
              {owner?.phone && (
                <>
                  <a
                    href={`tel:${owner.phone}`}
                    className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-3 font-medium text-zinc-900 hover:bg-zinc-50 transition"
                  >
                    <IoCallOutline className="h-4 w-4" />
                    Appeler
                  </a>
                  <a
                    href={toWhatsAppUrl(owner.phone, listingTitle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 font-medium text-emerald-700 hover:bg-emerald-100 transition"
                  >
                    <FaWhatsapp className="h-4 w-4" />
                    WhatsApp
                  </a>
                </>
              )}
              {owner?.email && (
                <a
                  href={`mailto:${owner.email}?subject=${encodeURIComponent(`Annonce Room: ${listingTitle}`)}`}
                  className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white hover:bg-zinc-800 transition"
                >
                  <IoMailOutline className="h-4 w-4" />
                  Email
                </a>
              )}
            </div>
          </div>
        )}

        {user && !isOwner && onReportClick && (
          <button
            type="button"
            onClick={onReportClick}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 font-medium text-red-600 hover:bg-red-50 transition"
          >
            <IoFlagOutline className="h-4 w-4" aria-hidden="true" />
            Signaler
          </button>
        )}
      </div>
    </div>
  );
}
