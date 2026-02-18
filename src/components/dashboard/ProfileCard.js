"use client";

export default function ProfileCard({ user, onLogout }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-600">Connecté en tant que</p>
          <p className="mt-1 text-lg font-semibold text-zinc-900">
            {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.email}
          </p>
          <p className="text-sm text-zinc-500">{user?.email}</p>
          {user?.role && (
            <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              {user.role === "owner" ? "Propriétaire" : "Locataire"}
            </span>
          )}
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={onLogout}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
