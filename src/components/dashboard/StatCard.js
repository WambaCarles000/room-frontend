"use client";

export default function StatCard({ label, value, icon, variant = "default" }) {
  const variants = {
    default: "bg-blue-50 text-blue-900",
    success: "bg-emerald-50 text-emerald-900",
    warning: "bg-amber-50 text-amber-900",
    danger: "bg-red-50 text-red-900",
  };

  return (
    <div className={`rounded-lg p-4 ${variants[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
        {icon && <div className="text-lg opacity-50">{icon}</div>}
      </div>
    </div>
  );
}
