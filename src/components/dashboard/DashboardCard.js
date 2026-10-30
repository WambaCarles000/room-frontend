"use client";

export default function DashboardCard({ title, children, className = "" }) {
  return (
    <div className={`rounded-lg border border-zinc-200 bg-white p-5 shadow-sm ${className}`}>
      {title && (
        <h3 className="mb-4 text-base font-semibold text-zinc-950">{title}</h3>
      )}
      {children}
    </div>
  );
}
