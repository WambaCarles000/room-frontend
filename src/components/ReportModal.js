"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function ReportModal({ isOpen, onClose, targetUser, targetListing, token }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!reason) throw new Error("Sélectionnez une raison");
      if (!description.trim()) throw new Error("Décrivez le problème");

      const payload = {
        reason,
        description: description.trim(),
      };

      if (targetUser?.id) {
        payload.reported_user_id = targetUser.id;
      }
      if (targetListing?.id) {
        payload.listing_id = targetListing.id;
      }

      const res = await fetch(`${API_URL}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors du signalement");
      }

      setSuccess(true);
      setTimeout(() => {
        setReason("");
        setDescription("");
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const title = targetUser
    ? `Signaler ${targetUser.first_name || targetUser.email}`
    : targetListing
    ? `Signaler ce logement`
    : "Signaler";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-gray-800/50 to-gray-900/30 p-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white shadow-lg">
        {/* Header */}
        <div className="border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              ✅ Signalement envoyé avec succès
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Raison du signalement *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
            >
              <option value="">Choisir une raison</option>
              <option value="spam">Spam</option>
              <option value="fraud">Fraude</option>
              <option value="inappropriate">Contenu inapproprié</option>
              <option value="harassment">Harcèlement</option>
              <option value="other">Autre</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Décrivez le problème *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
              placeholder="Expliquez pourquoi vous signalez..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Signaler"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
