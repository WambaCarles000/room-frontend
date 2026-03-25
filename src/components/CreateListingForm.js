"use client";

import { useState } from "react";
import { z } from "zod";
import api from "@/lib/api";
import { createClient } from "@/lib/supabase/browser";


const MAX_IMAGES = 10;
const MAX_IMAGE_DIMENSION = 1600; // évite d'envoyer des images trop lourdes
const WEBP_QUALITY = 0.78; // compromis qualité / poids
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024; // ~3Mo par image
const MAX_INPUT_BYTES = 10 * 1024 * 1024; // ~10Mo max par fichier (avant optimisation)

const listingSchema = z.object({
  title: z.string().min(5, "Le titre doit faire au moins 5 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  price: z.coerce.number().positive("Le prix doit être supérieur à 0"),
  currency: z.enum(["XAF", "EUR", "USD"]),
  city: z.string().min(1, "La ville est requise"),
  district: z.string().min(1, "Le quartier est requis"),
  type: z.enum(["studio", "chambre", "appartement"]),
  square_meters: z.coerce.number().positive().optional().nullable(),
  deposit_months: z.coerce.number().int().min(0).optional().nullable(),
  availability_date: z.string().optional().nullable(),
});

export default function CreateListingForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    currency: "XAF",
    city: "",
    district: "",
    type: "studio",
    square_meters: "",
    deposit_months: "",
    availability_date: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [imagesValidationError, setImagesValidationError] = useState(null);

  const formatBytes = (bytes) => {
    if (!bytes || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
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

    const next = [...images, ...accepted].slice(0, MAX_IMAGES);
    setImages(next);

    if (rejected.length > 0) {
      setImagesValidationError(
        `${rejected.length} image(s) ignorée(s) car elles dépassent ${formatBytes(MAX_INPUT_BYTES)}.`
      );
    } else if (accepted.length > 0 && next.length < images.length + accepted.length) {
      setImagesValidationError(`Limite atteinte: maximum ${MAX_IMAGES} images.`);
    }
  };

  async function uploadImagesToSupabase(listingId) {
    if (!images.length) return [];

    const supabase = createClient();
    const uploadedUrls = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileName = `${Date.now()}-${i}.webp`;
      const path = `listings/${listingId}/${fileName}`;

      // Optimisation côté navigateur avant upload:
      // - redimensionnement max dimension
      // - conversion en WebP
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

        // Si le poids est trop élevé, on baisse progressivement la qualité WebP.
        const qualities = [WEBP_QUALITY, 0.68, 0.58, 0.48, 0.38];
        for (let qi = 0; qi < qualities.length; qi++) {
          const q = qualities[qi];
          // eslint-disable-next-line no-await-in-loop
          optimizedBlob = await new Promise((resolve) => {
            canvas.toBlob((b) => resolve(b), "image/webp", q);
          });

          if (optimizedBlob && optimizedBlob.size <= MAX_UPLOAD_BYTES) {
            break;
          }
        }
      } catch (err) {
        // fallback: si l'optimisation échoue, on upload l'original
        optimizedBlob = file;
      }

      const { error: uploadError } = await supabase.storage
        .from("listings")
        .upload(path, optimizedBlob, { upsert: false, contentType: "image/webp" });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        continue;
      }

      const { data } = supabase.storage.from("listings").getPublicUrl(path);
      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }
    }

    return uploadedUrls;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    // Prépare les données avec les bons types avant validation
    const raw = {
      ...formData,
      square_meters: formData.square_meters || null,
      deposit_months: formData.deposit_months || null,
      availability_date: formData.availability_date || null,
    };

    // Validation Zod
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
      const newListing = await api.post("/listings", result.data, { auth: true });

      if (newListing?.id) {
        const imageUrls = await uploadImagesToSupabase(newListing.id);
        if (imageUrls.length) {
          await api.post(
            `/listings/${newListing.id}/images`,
            { images: imageUrls },
            { auth: true }
          );
        }
      }

      setFormData({
        title: "",
        description: "",
        price: "",
        currency: "XAF",
        city: "",
        district: "",
        type: "studio",
        square_meters: "",
        deposit_months: "",
        availability_date: "",
      });
      setImages([]);
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
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            placeholder="Ex: Studio moderne centre-ville"
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
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
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          placeholder="Décrivez le logement..."
        />
        {fieldErrors.description && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Prix *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            min="0"
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            placeholder="150000"
          />
          {fieldErrors.price && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Devise
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
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
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            placeholder="Douala"
          />
          {fieldErrors.city && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>
          )}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Photos du logement{" "}
          <span className="text-xs text-zinc-500">
            (jusqu&apos;à {MAX_IMAGES}, max {formatBytes(MAX_INPUT_BYTES)})
          </span>
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImagesChange}
          className="block w-full text-sm text-zinc-900 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
        />
        {imagesValidationError && (
          <p className="mt-1 text-xs text-red-600">{imagesValidationError}</p>
        )}
        {images.length > 0 && (
          <p className="mt-1 text-xs text-zinc-500">
            {images.length} image{images.length > 1 ? "s" : ""} sélectionnée
            {images.length > 1 ? "s" : ""}.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Quartier *
        </label>
        <input
          type="text"
          value={formData.district}
          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
          className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          placeholder="Akwa"
        />
        {fieldErrors.district && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.district}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Superficie (m²)
          </label>
          <input
            type="number"
            value={formData.square_meters}
            onChange={(e) => setFormData({ ...formData, square_meters: e.target.value })}
            min="0"
            step="0.1"
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            placeholder="50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Caution (mois)
          </label>
          <input
            type="number"
            value={formData.deposit_months}
            onChange={(e) => setFormData({ ...formData, deposit_months: e.target.value })}
            min="0"
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            placeholder="2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Date de disponibilité
          </label>
          <input
            type="date"
            value={formData.availability_date}
            onChange={(e) => setFormData({ ...formData, availability_date: e.target.value })}
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          />
        </div>
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