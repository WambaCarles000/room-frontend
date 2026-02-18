"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import ProfileCard from "@/components/dashboard/ProfileCard";
import DashboardCard from "@/components/dashboard/DashboardCard";
import StatCard from "@/components/dashboard/StatCard";
import UserListingsCard from "@/components/dashboard/UserListingsCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Get current user
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !currentUser) {
          router.push("/login");
          return;
        }

        // Get session for token
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          setToken(session.access_token);
        }

        setUser(currentUser);

        // Get profile from user metadata
        if (currentUser.user_metadata) {
          setProfile(currentUser.user_metadata);
        }

        // Fetch user listings
        if (session?.access_token) {
          const res = await fetch(`${API_URL}/listings/user`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          
          if (res.ok) {
            const data = await res.json();
            setListings(data || []);
          }
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Erreur lors du chargement du dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-zinc-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Mon Dashboard</h1>
          <p className="mt-2 text-zinc-600">Gérez vos logements et votre profil</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Profile Section */}
        <div className="mb-8">
          <ProfileCard user={profile || user} onLogout={handleLogout} />
        </div>

        {/* Stats Section */}
        {profile?.role === "owner" && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Logements publiés"
              value={listings.length}
              icon="🏠"
              variant="default"
            />
            <StatCard
              label="Disponibles"
              value={listings.filter((l) => l.status === "available").length}
              icon="✓"
              variant="success"
            />
            <StatCard
              label="Loués"
              value={listings.filter((l) => l.status === "rented").length}
              icon="🔑"
              variant="warning"
            />
          </div>
        )}

        {/* Listings Section */}
        {profile?.role === "owner" && (
          <DashboardCard title="Mes logements">
            <UserListingsCard listings={listings} isLoading={loading} />
          </DashboardCard>
        )}

        {/* Quick Actions */}
        {profile?.role === "owner" && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DashboardCard className="text-center">
              <a
                href="/listings"
                className="block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
              >
                Créer un nouveau logement
              </a>
            </DashboardCard>
            <DashboardCard className="text-center">
              <a
                href="/favorites"
                className="block rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
              >
                Mes sauvegardes
              </a>
            </DashboardCard>
          </div>
        )}
      </main>
    </div>
  );
}

