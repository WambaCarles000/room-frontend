"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/browser";
import api from "@/lib/api";
import Popups from "@/components/popups";

export default function FavoriteButton({ listingId }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        checkFavorite();
      }
    });
  }, [listingId]);

  async function checkFavorite() {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      try {
        const data = await api.get(`/favorites/check/${listingId}`, { auth: true });
        setIsFavorite(data.isFavorite);
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error("Erreur lors de la vérification du favori:", err);
    }
  }
  

  async function toggleFavorite() {
    if (!user) {
      Popups("Veuillez vous connecter pour ajouter aux favoris", "error");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (isFavorite) {
        await api.del(`/favorites/${listingId}`, null, { auth: true });
        setIsFavorite(false);
      } else {
        await api.post(`/favorites/${listingId}`, null, { auth: true });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Erreur lors de la modification du favori:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 font-medium shadow-sm backdrop-blur transition ${
        isFavorite
          ? "border-primary-200 bg-white/90 text-primary-700 hover:bg-primary-50"
          : "border-zinc-200 bg-white/80 text-zinc-800 hover:bg-primary-50"
      } disabled:opacity-50`}
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
      {isFavorite ? "Favori" : "Ajouter aux favoris"}
    </button>
  );
}
