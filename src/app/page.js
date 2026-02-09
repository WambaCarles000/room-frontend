import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Room</h1>
        <p className="mt-3 text-zinc-600">
          Trouve rapidement des logements disponibles.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/listings"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Voir les logements
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium hover:bg-zinc-50"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium hover:bg-zinc-50"
          >
            Créer un compte
          </Link>
        </div>
      </main>
    </div>
  );
}
