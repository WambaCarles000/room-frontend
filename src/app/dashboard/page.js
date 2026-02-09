import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: { session }, error } = await supabase.auth.getSession()
  // console.log("Session dans /dashboard :", session);
  // Middleware should handle this, but keeping a server-side check is a good safety net.
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <form action="/auth/logout" method="post">
            <button className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50">
              Se déconnecter
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Connecté en tant que</p>
          <p className="mt-1 font-medium">{user.email}</p>
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Voir les logements
          </Link>
          <Link href="/" className="text-sm font-medium text-zinc-600 underline">
            Retour accueil
          </Link>
        </div>
      </main>
    </div>
  );
}

