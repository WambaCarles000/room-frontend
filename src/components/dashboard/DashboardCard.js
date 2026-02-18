"use client";

export default function DashboardCard({ title, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-6 shadow-sm ${className}`}>
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-zinc-900">{title}</h3>
      )}
      {children}
    </div>
  );
}
