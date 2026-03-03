"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function ProfileSettingsModal({ user, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    first_name: user?.user_metadata?.first_name || user?.first_name || "",
    last_name: user?.user_metadata?.last_name || user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Valider les champs obligatoires
      if (!formData.first_name?.trim()) throw new Error("Le prénom est obligatoire");
      if (!formData.last_name?.trim()) throw new Error("Le nom est obligatoire");
      if (!formData.email?.trim()) throw new Error("L'email est obligatoire");

      await api.patch(
        `/users/me`,
        {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone?.trim() || null,
        },
        { auth: true }
      );

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gradient-to-b from-gray-950/50 to-gray-900/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg">
          {/* Header */}
          <div className="sticky top-0 border-b border-zinc-200 px-6 py-4 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">
                Paramètres du profil
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                ❌ {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                ✅ Profil mis à jour avec succès
              </div>
            )}

            {/* Row 1: Prénom et Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-zinc-900 mb-1">
                  Prénom *
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-zinc-900 mb-1">
                  Nom *
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            {/* Row 2: Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-900 mb-1">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="votre@email.com"
              />
            </div>

            {/* Row 3: Téléphone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-900 mb-1">
                Téléphone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="+237 XXX XXX XXX"
              />
            </div>

            {/* Buttons */}
            <div className="border-t border-zinc-200 pt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition"
              >
                {loading ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}