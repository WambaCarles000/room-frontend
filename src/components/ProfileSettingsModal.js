"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { createClient } from "@/lib/supabase/browser";
import api from "@/lib/api";
import PhoneNumberField from "@/components/PhoneNumberField";

const settingsSchema = z.object({
  first_name: z.string().min(2, "Le prénom doit faire au moins 2 caractères"),
  last_name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  phone: z.string().optional().nullable(),
});

export default function ProfileSettingsModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function loadProfile() {
      setFetching(true);
      setError(null);
      setSuccess(false);

      try {
        const supabase = createClient();
        const {
          data: { user: supaUser },
        } = await supabase.auth.getUser();

        if (!supaUser) {
          throw new Error("Vous devez être connecté pour modifier votre profil.");
        }

        const profile = await api.get("/users/me", { auth: true });

        if (cancelled) return;

        setFormData({
          first_name:
            profile?.first_name || supaUser?.user_metadata?.first_name || "",
          last_name:
            profile?.last_name || supaUser?.user_metadata?.last_name || "",
          email: profile?.email || supaUser?.email || "",
          phone: profile?.phone || supaUser?.phone || "",
          avatar_url: profile?.avatar_url || "",
        });
        setAvatarFile(null);
        setAvatarPreview(null);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Impossible de charger le profil.");
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choisissez un fichier image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La photo doit faire 5 Mo maximum.");
      return;
    }
    setError(null);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const raw = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: formData.phone?.trim() || null,
    };

    const result = settingsSchema.safeParse(raw);
    if (!result.success) {
      setError(result.error.issues[0].message);
      setLoading(false);
      return;
    }
    if (result.data.phone && !isValidPhoneNumber(result.data.phone)) {
      setError("Saisissez un numéro de téléphone valide.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const {
        data: { user: supaUser },
      } = await supabase.auth.getUser();
      if (!supaUser) throw new Error("Vous devez être connecté pour modifier votre profil.");

      let avatarUrl = formData.avatar_url || null;
      if (avatarFile) {
        const extension = avatarFile.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
        const avatarPath = `profiles/${supaUser.id}/avatar.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("listings")
          .upload(avatarPath, avatarFile, {
            cacheControl: "0",
            contentType: avatarFile.type,
            upsert: true,
          });

        if (uploadError) throw new Error("Impossible d'envoyer la photo de profil.");

        const { data } = supabase.storage.from("listings").getPublicUrl(avatarPath);
        avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
      }

      const updatedUser = await api.patch(
        "/users/me",
        { ...result.data, avatar_url: avatarUrl },
        { auth: true }
      );

      if (!updatedUser?.id) {
        throw new Error("Réponse invalide du serveur.");
      }

      const { error: supabaseError } = await supabase.auth.updateUser({
        data: {
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          phone: updatedUser.phone,
          avatar_url: updatedUser.avatar_url,
        },
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setFormData({
        first_name: updatedUser.first_name || "",
        last_name: updatedUser.last_name || "",
        email: updatedUser.email || formData.email,
        phone: updatedUser.phone || "",
        avatar_url: updatedUser.avatar_url || "",
      });

      setSuccess(true);
      onSuccess?.(updatedUser);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      setError(err?.message || "Erreur lors de la mise à jour du profil.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div
        className="fixed inset-0 bg-gradient-to-b from-gray-950/50 to-gray-900/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="flex min-h-full items-start justify-center p-4 pt-20 pb-8 sm:items-center sm:py-8">
        <div
          className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-settings-title"
        >
          <div className="border-b border-zinc-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 id="profile-settings-title" className="text-lg font-bold text-zinc-900">
                Mon profil
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                aria-label="Fermer"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {fetching ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-primary-500" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                  Profil mis à jour
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-xl font-semibold text-primary-800 ring-4 ring-primary-50">
                  {avatarPreview || formData.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview || formData.avatar_url}
                      alt="Photo de profil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    formData.first_name?.charAt(0)?.toUpperCase() || "?"
                  )}
                </div>
                <div className="min-w-0">
                  <label htmlFor="settings_avatar" className="block text-sm font-medium text-zinc-900">
                    Photo de profil
                  </label>
                  <input
                    id="settings_avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="mt-1 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:font-medium file:text-primary-700 hover:file:bg-primary-100"
                  />
                  <p className="mt-1 text-xs text-zinc-500">Image de 5 Mo maximum</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="settings_first_name" className="block text-sm font-medium text-zinc-900 mb-1">
                    Prénom *
                  </label>
                  <input
                    id="settings_first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="settings_last_name" className="block text-sm font-medium text-zinc-900 mb-1">
                    Nom *
                  </label>
                  <input
                    id="settings_last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1">Email</label>
                <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                  {formData.email || "—"}
                </p>
              </div>

              <div>
                <label htmlFor="settings_phone" className="block text-sm font-medium text-zinc-900 mb-1">
                  Téléphone
                </label>
                <PhoneNumberField
                  id="settings_phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(phone) => setFormData((previous) => ({ ...previous, phone }))}
                  placeholder="6 90 00 00 00"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Requis pour publier une annonce et être contacté.
                </p>
              </div>

              <div className="flex gap-3 border-t border-zinc-200 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                >
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
