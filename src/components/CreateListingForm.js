"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function CreateListingForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    currency: "XAF",
    city: "",
    district: "",
    type: "studio",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Vous devez être connecté");
      }

      const res = await fetch(`${API_URL}/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la création");
      }

      const newListing = await res.json();
      setFormData({
        title: "",
        description: "",
        price: "",
        currency: "XAF",
        city: "",
        district: "",
        type: "studio",
      });
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Titre *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            placeholder="Ex: Studio moderne centre-ville"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            required
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          >
            <option value="studio">Studio</option>
            <option value="chambre">Chambre</option>
            <option value="appartement">Appartement</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          rows={3}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          placeholder="Décrivez le logement..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Prix *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            required
            min="0"
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            placeholder="150000"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Devise
          </label>
          <select
            value={formData.currency}
            onChange={(e) =>
              setFormData({ ...formData, currency: e.target.value })
            }
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          >
            <option value="XAF">XAF</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Ville *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) =>
              setFormData({ ...formData, city: e.target.value })
            }
            required
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            placeholder="Douala"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Quartier *
        </label>
        <input
          type="text"
          value={formData.district}
          onChange={(e) =>
            setFormData({ ...formData, district: e.target.value })
          }
          required
          className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          placeholder="Akwa"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
        >
          {loading ? "Création..." : "Créer le logement"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
