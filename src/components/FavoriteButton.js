"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/browser";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

      const res = await fetch(
        `${API_URL}/favorites/check/${listingId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (err) {
      console.error("Erreur lors de la vérification du favori:", err);
    }
  }

  async function toggleFavorite() {
    if (!user) {
      alert("Veuillez vous connecter pour ajouter aux favoris");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const method = isFavorite ? "DELETE" : "POST";
      const res = await fetch(
        `${API_URL}/favorites/${listingId}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (res.ok) {
        setIsFavorite(!isFavorite);
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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
        isFavorite
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
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
