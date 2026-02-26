"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function EditListingModal({ listing, isOpen, onClose, onSuccess, token }) {
  const [formData, setFormData] = useState({
    title: listing?.title || "",
    description: listing?.description || "",
    price: listing?.price || "",
    type: listing?.type || "studio",
    city: listing?.city || "",
    district: listing?.district || "",
    square_meters: listing?.square_meters || "",
    deposit_months: listing?.deposit_months || "",
    status: listing?.status || "available",
    availability_date: listing?.availability_date 
      ? new Date(listing.availability_date).toISOString().split("T")[0] 
      : "",
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
      if (!formData.title?.trim()) throw new Error("Le titre est obligatoire");
      if (!formData.description?.trim()) throw new Error("La description est obligatoire");
      if (!formData.price || formData.price <= 0) throw new Error("Le prix doit être > 0");
      if (!formData.city?.trim()) throw new Error("La ville est obligatoire");
      if (!formData.district?.trim()) throw new Error("Le quartier est obligatoire");

      await api.patch(
        `/listings/${listing.id}`,
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          type: formData.type,
          city: formData.city.trim(),
          district: formData.district.trim(),
          square_meters: formData.square_meters ? parseFloat(formData.square_meters) : null,
          deposit_months: formData.deposit_months ? parseInt(formData.deposit_months) : null,
          status: formData.status,
          availability_date: formData.availability_date || null,
        },
        { auth: true }
      );

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-gray-950/50 to-gray-900/30 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg">
        {/* Header */}
        <div className="sticky top-0 border-b border-zinc-200 px-6 py-4 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">
              Modifier le logement
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
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
              ✅ Logement mis à jour avec succès
            </div>
          )}

          {/* Row 1: Titre */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-zinc-900 mb-1">
              Titre *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="Ex: Studio moderne centre-ville"
            />
          </div>

          {/* Row 2: Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-900 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="Décrivez les caractéristiques du logement..."
            />
          </div>

          {/* Row 3: Prix et Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-zinc-900 mb-1">
                Prix *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="100000"
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-zinc-900 mb-1">
                Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="studio">Studio</option>
                <option value="chambre">Chambre</option>
                <option value="appartement">Appartement</option>
              </select>
            </div>
          </div>

          {/* Row 4: Ville et Quartier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-zinc-900 mb-1">
                Ville *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="Ex: Yaoundé"
              />
            </div>
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-zinc-900 mb-1">
                Quartier *
              </label>
              <input
                id="district"
                name="district"
                type="text"
                value={formData.district}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="Ex: Bastos"
              />
            </div>
          </div>

          {/* Row 5: Surface et Caution */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="square_meters" className="block text-sm font-medium text-zinc-900 mb-1">
                Surface (m²)
              </label>
              <input
                id="square_meters"
                name="square_meters"
                type="number"
                value={formData.square_meters}
                onChange={handleChange}
                min="0"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="50"
              />
            </div>
            <div>
              <label htmlFor="deposit_months" className="block text-sm font-medium text-zinc-900 mb-1">
                Caution (mois)
              </label>
              <input
                id="deposit_months"
                name="deposit_months"
                type="number"
                value={formData.deposit_months}
                onChange={handleChange}
                min="0"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="3"
              />
            </div>
          </div>

          {/* Row 6: Statut et Date de disponibilité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-zinc-900 mb-1">
                Statut
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="available">Disponible</option>
                <option value="rented">Loué</option>
                <option value="taken">Réservé</option>
                <option value="sold">Vendu</option>
              </select>
            </div>
            <div>
              <label htmlFor="availability_date" className="block text-sm font-medium text-zinc-900 mb-1">
                Date de disponibilité
              </label>
              <input
                id="availability_date"
                name="availability_date"
                type="date"
                value={formData.availability_date}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
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
  );
}
