"use client";

export default function StatCard({ label, value, icon, variant = "default" }) {
  const variants = {
    default: "bg-sky-100 text-sky-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="flex min-h-28 items-center justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-medium text-zinc-600">{label}</p>
        <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-950">{value}</p>
      </div>
      {icon && (
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${variants[variant]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      )}
    </div>
  );
}
