"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import api from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user: supaUser },
      } = await supabase.auth.getUser();

      if (!supaUser) {
        router.push("/login");
        return;
      }

      // Récupérer le profil depuis le backend (source de vérité)
      const profile = await api.get("/users/me", { auth: true });

      setUser(supaUser);
      setFormData({
        first_name:
          profile.first_name ||
          supaUser?.user_metadata?.first_name ||
          "",
        last_name:
          profile.last_name ||
          supaUser?.user_metadata?.last_name ||
          "",
        email: profile.email || supaUser?.email || "",
        phone: profile.phone || supaUser?.phone || "",
      });
    };

    getUser();
  }, [router]);

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

      // Refresh user data from backend
      const updatedUser = await api.get('/users/me', { auth: true });
      
      // Update Supabase metadata so Header reflects changes
      console.log("Updated User Data:", updatedUser);
      const supabase = createClient();
      await supabase.auth.updateUser({
        email: updatedUser.email,
        data: {
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          phone: updatedUser.phone,
        },
      });
      
      // Update local state with fresh data
      setFormData({
        first_name: updatedUser.first_name || "",
        last_name: updatedUser.last_name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Paramètres du profil
          </h1>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              ✅ Profil mis à jour avec succès
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Prénom et Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-900 mb-1">
                  Prénom *
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-900 mb-1">
                  Nom *
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            {/* Row 2: Email */}
            {/* <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                placeholder="votre@email.com"
              />
            </div> */}

            {/* Row 3: Téléphone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-1">
                Téléphone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                placeholder="+237 XXX XXX XXX"
              />
            </div>

            {/* Buttons */}
            <div className="border-t border-gray-200 pt-6 flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition"
              >
                {loading ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
