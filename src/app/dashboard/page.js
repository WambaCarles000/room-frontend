"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import DashboardCard from "@/components/dashboard/DashboardCard";
import StatCard from "@/components/dashboard/StatCard";
import UserListingsCard from "@/components/dashboard/UserListingsCard";
import api from "@/lib/api";
import { LuArrowUpRight, LuHouse, LuPlus } from "react-icons/lu";
import { IoKeyOutline } from "react-icons/io5";
import { IoCheckmarkCircle } from "react-icons/io5";

const listingStatuses = [
  { key: "available", label: "Disponibles", color: "bg-emerald-500" },
  { key: "rented", label: "Loués", color: "bg-amber-500" },
  { key: "taken", label: "Réservés", color: "bg-sky-500" },
  { key: "sold", label: "Vendus", color: "bg-rose-500" },
];

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !currentUser) {
          router.push("/login");
          return;
        }

        const data = await api.get("/listings/user", { auth: true });
        setListings(data || []);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Erreur lors du chargement du dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-zinc-200 border-t-primary-500 animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  const publishedCount = listings.length;
  const availableCount = listings.filter((l) => l.status === "available").length;
  const rentedCount = listings.filter((l) => l.status === "rented").length;
  const statusSummary = listingStatuses.map((status) => ({
    ...status,
    count: listings.filter((listing) => listing.status === status.key).length,
  }));

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
              Activité de vos logements
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              {publishedCount} logement{publishedCount !== 1 ? "s" : ""} dans votre parc
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/my-listings"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
            >
              Gérer mes logements
              <LuArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
            >
              <LuPlus aria-hidden="true" className="h-4 w-4" />
              Ajouter un logement
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Logements publiés"
            value={publishedCount}
            icon={<LuHouse />}
            variant="default"
          />
          <StatCard
            label="Disponibles"
            value={availableCount}
            icon={<IoCheckmarkCircle />}
            variant="success"
          />
          <StatCard
            label="Loués"
            value={rentedCount}
            icon={<IoKeyOutline />}
            variant="warning"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <DashboardCard title="Répartition des logements">
            <div className="mb-5 flex items-end justify-between gap-4">
              <p className="text-sm text-zinc-600">État actuel de vos annonces</p>
              <p className="shrink-0 text-sm font-semibold text-zinc-900">
                {publishedCount} au total
              </p>
            </div>
            <div
              aria-label="Répartition des logements par statut"
              className="flex h-4 overflow-hidden rounded-full bg-zinc-100"
            >
              {statusSummary.map((status) =>
                status.count > 0 ? (
                  <div
                    key={status.key}
                    className={status.color}
                    style={{ width: `${(status.count / publishedCount) * 100}%` }}
                    title={`${status.label}: ${status.count}`}
                  />
                ) : null
              )}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
              {statusSummary.map((status) => (
                <div key={status.key} className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${status.color}`} />
                  <span className="min-w-0 flex-1 truncate text-sm text-zinc-600">
                    {status.label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-zinc-900">
                    {status.count}
                  </span>
                </div>
              ))}
            </div>
            {publishedCount === 0 && (
              <p className="mt-5 text-sm text-zinc-500">
                La répartition apparaîtra après votre première publication.
              </p>
            )}
          </DashboardCard>

          <DashboardCard title="Annonces récentes">
            <UserListingsCard listings={listings} isLoading={loading} />
          </DashboardCard>
        </div>
      </main>
    </div>
  );
}
