"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const SHARE_PLATFORMS = [
  {
    id: "facebook",
    label: "Facebook",
    icon: "🔵",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    id: "twitter",
    label: "Twitter",
    icon: "🐦",
    color: "bg-sky-500 hover:bg-sky-600",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: "💼",
    color: "bg-blue-700 hover:bg-blue-800",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: "💬",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    id: "email",
    label: "Email",
    icon: "✉️",
    color: "bg-zinc-600 hover:bg-zinc-700",
  },
];

export default function ShareButton({ listingId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleShare(platform) {
    setLoading(true);
    try {
      // Enregistrer le partage
      await fetch(`${API_URL}/listings/${listingId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform }),
      });

      // Récupérer l'URL de partage
      const res = await fetch(
        `${API_URL}/listings/${listingId}/share-url/${platform}`
      );
      if (res.ok) {
        const data = await res.json();
        window.open(data.shareUrl, "_blank", "width=600,height=400");
      }
    } catch (err) {
      console.error("Erreur lors du partage:", err);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition"
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
            d="M8.684 13.342C9.589 12.438 10 11.114 10 9.6c0-3.314-2.686-6-6-6S-2 6.286-2 9.6s2.686 6 6 6c.564 0 1.12-.08 1.664-.24"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m3-3H9"
          />
        </svg>
        Partager
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white shadow-lg z-50">
          <div className="p-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase mb-3">
              Partager sur
            </p>
            <div className="space-y-2">
              {SHARE_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handleShare(platform.id)}
                  disabled={loading}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white font-medium transition ${platform.color} disabled:opacity-50`}
                >
                  <span className="text-lg">{platform.icon}</span>
                  <span>{platform.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
