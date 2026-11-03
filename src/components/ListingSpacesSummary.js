import { getListingSpaceEntries, SPACE_ACCESS_LABELS } from "@/lib/listingSpaces";

export default function ListingSpacesSummary({ spaces }) {
  const entries = getListingSpaceEntries(spaces);
  if (!entries.length) return null;

  return (
    <div className="mt-5 border-t border-zinc-100 pt-4">
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">Espaces du logement</h2>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {entries.map(({ id, label, icon: Icon, access }) => (
          <li key={id} className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="flex-1 text-sm font-medium text-zinc-900">{label}</span>
            <span className="text-xs text-zinc-500">{SPACE_ACCESS_LABELS[access]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}