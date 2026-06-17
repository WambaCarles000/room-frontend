"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import api from "@/lib/api";
import { toInputDate } from "@/lib/formatDate";
import { createClient } from "@/lib/supabase/browser";

const listingSchema = z.object({
  title: z.string().min(5, "Le titre doit faire au moins 5 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  price: z.coerce.number().positive("Le prix doit être supérieur à 0"),
  type: z.enum(["studio", "chambre", "appartement"]),
  city: z.string().min(1, "La ville est requise"),
  district: z.string().min(1, "Le quartier est requis"),
  status: z.enum(["available", "rented", "taken", "sold"]),

  square_meters: z.coerce.number().positive().optional().nullable(),
  deposit_months: z.coerce.number().int().min(0).optional().nullable(),
  availability_date: z.string().optional().nullable(),
});

export default function EditListingModal({ listing, isOpen, onClose, onSuccess }) {
  // console.log(listing.availability_date);
  const [formData, setFormData] = useState({
    ...listing,
    availability_date: listing.availability_date ? toInputDate(listing.availability_date) : "",
   
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const MAX_IMAGES = 10;
  const MAX_IMAGE_DIMENSION = 1600;
  const WEBP_QUALITY = 0.78;
  const MAX_UPLOAD_BYTES = 1 * 1024 * 1024; // ~1Mo après compression
  const MAX_INPUT_BYTES = 7 * 1024 * 1024; // ~7Mo max par fichier (avant optimisation)

  const [keptImageUrls, setKeptImageUrls] = useState(() =>
    (listing?.images || []).map((img) => img?.imageUrl).filter(Boolean)
  );
  const [newImages, setNewImages] = useState([]);
  const [imagesValidationError, setImagesValidationError] = useState(null);

  useEffect(() => {
    setFormData({
      ...listing,
      availability_date: listing?.availability_date ? toInputDate(listing.availability_date) : "",
    });
    setKeptImageUrls((listing?.images || []).map((img) => img?.imageUrl).filter(Boolean));
    setNewImages([]);
    setImagesValidationError(null);
    setError(null);
    setSuccess(false);
    setFieldErrors({});
  }, [listing]);

  const existingCount = keptImageUrls.length;
  const remainingSlots = Math.max(MAX_IMAGES - existingCount, 0);

  const formatBytes = (bytes) => {
    if (!bytes || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  };

  const newImagePreviews = useMemo(() => {
    return newImages.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
  }, [newImages]);

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [newImagePreviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (e) => {
    setImagesValidationError(null);
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const accepted = [];
    const rejected = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.size > MAX_INPUT_BYTES) rejected.push(f);
      else accepted.push(f);
    }

    const next = [...newImages, ...accepted].slice(0, remainingSlots);
    setNewImages(next);

    if (rejected.length > 0) {
      setImagesValidationError(
        `${rejected.length} image(s) ignorée(s) car elles dépassent ${formatBytes(MAX_INPUT_BYTES)}.`
      );
    } else if (accepted.length > 0 && next.length < newImages.length + accepted.length) {
      setImagesValidationError(`Limite atteinte: maximum ${MAX_IMAGES} photos par logement.`);
    }
  };

  async function uploadImagesToSupabase(listingId, files) {
    if (!files?.length) return [];
    const supabase = createClient();
    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `${Date.now()}-${i}.webp`;
      const path = `listings/${listingId}/${fileName}`;

      let optimizedBlob = null;
      try {
        const bitmap = await createImageBitmap(file);
        const { width, height } = bitmap;
        const maxDim = Math.max(width, height);
        const scale = maxDim > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / maxDim : 1;

        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Unable to create 2d context");

        ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

        const qualities = [WEBP_QUALITY, 0.68, 0.58, 0.48, 0.38];
        for (let qi = 0; qi < qualities.length; qi++) {
          const q = qualities[qi];
          // eslint-disable-next-line no-await-in-loop
          optimizedBlob = await new Promise((resolve) => {
            canvas.toBlob((b) => resolve(b), "image/webp", q);
          });
          if (optimizedBlob && optimizedBlob.size <= MAX_UPLOAD_BYTES) break;
        }
      } catch (_err) {
        optimizedBlob = file;
      }

      const { error: uploadError } = await supabase.storage
        .from("listings")
        .upload(path, optimizedBlob, { upsert: false, contentType: "image/webp" });

      if (uploadError) continue;

      const { data } = supabase.storage.from("listings").getPublicUrl(path);
      if (data?.publicUrl) uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setError(null);
    setSuccess(false);
    setLoading(true);

    const raw = {
      ...formData,
      square_meters: formData.square_meters ?? null,
      deposit_months: formData.deposit_months ?? null,
      availability_date: formData.availability_date || null,
    };

    const result = listingSchema.safeParse(raw);
    if (!result.success) {
      const errors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0];
        errors[field] = err.message;
      });
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await api.patch(`/listings/${listing.id}`, result.data, { auth: true });

      const hasImageChanges = newImages.length > 0 || keptImageUrls.length !== (listing?.images || []).length;
      if (hasImageChanges) {
        const uploaded = await uploadImagesToSupabase(listing.id, newImages);
        const nextUrls = [...keptImageUrls, ...uploaded].slice(0, MAX_IMAGES);
        await api.patch(`/listings/${listing.id}/images`, { images: nextUrls }, { auth: true });
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
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
            <h2 className="text-xl font-bold text-zinc-900">Modifier le logement</h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              Logement mis à jour avec succès
            </div>
          )}

          {/* Titre */}
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
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="Ex: Studio moderne centre-ville"
            />
            {fieldErrors.title && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-900 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="Décrivez les caractéristiques du logement..."
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>
            )}
          </div>

          {/* Prix et Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-zinc-900 mb-1">
                Prix(FCFA) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="100000"
              />
              {fieldErrors.price && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>
              )}
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
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="studio">Studio</option>
                <option value="chambre">Chambre</option>
                <option value="appartement">Appartement</option>
              </select>
              {fieldErrors.type && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.type}</p>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-semibold text-zinc-900">Photos</p>
            <p className="mt-1 text-xs text-zinc-600">
              Maximum {MAX_IMAGES} photos. Vous pouvez retirer des photos existantes et en ajouter de nouvelles.
            </p>

            {keptImageUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {keptImageUrls.map((url) => (
                  <div key={url} className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-20 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setKeptImageUrls((prev) => prev.filter((u) => u !== url))}
                      className="absolute right-1 top-1 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-white"
                      title="Retirer"
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3">
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Ajouter des photos{" "}
                <span className="text-zinc-500">
                  (reste {remainingSlots} place{remainingSlots !== 1 ? "s" : ""})
                </span>
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={remainingSlots <= 0}
                onChange={handleImagesChange}
                className="block w-full text-sm text-zinc-900 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary-600 disabled:opacity-60"
              />
              {imagesValidationError && (
                <p className="mt-1 text-xs text-red-600">{imagesValidationError}</p>
              )}

              {newImagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {newImagePreviews.map((p) => (
                    <div key={p.url} className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt="" className="h-20 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewImages((prev) => prev.filter((f) => f !== p.file))}
                        className="absolute right-1 top-1 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-white"
                        title="Retirer"
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ville et Quartier */}
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
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="Ex: Yaoundé"
              />
              {fieldErrors.city && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>
              )}
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
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="Ex: Bastos"
              />
              {fieldErrors.district && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.district}</p>
              )}
            </div>
          </div>

          {/* Surface et Caution */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="square_meters" className="block text-sm font-medium text-zinc-900 mb-1">
                Surface (m²)
              </label>
              <input
                id="square_meters"
                name="square_meters"
                type="number"
                value={formData.square_meters ?? ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="50"
              />
              {fieldErrors.square_meters && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.square_meters}</p>
              )}
            </div>
            <div>
              <label htmlFor="deposit_months" className="block text-sm font-medium text-zinc-900 mb-1">
                Caution (mois)
              </label>
              <input
                id="deposit_months"
                name="deposit_months"
                type="number"
                value={formData.deposit_months ?? ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="3"
              />
              {fieldErrors.deposit_months && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.deposit_months}</p>
              )}
            </div>
          </div>

          {/* Statut et Date de disponibilité */}
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
                value={formData.availability_date ?? ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
              {fieldErrors.availability_date && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.availability_date}</p>
              )}
            </div>
          </div>

          {/* Boutons */}
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
              className="flex-1 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50 transition"
            >
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}