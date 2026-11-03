"use client";

import { LISTING_SPACES, SPACE_ACCESS_OPTIONS } from "@/lib/listingSpaces";

export default function ListingSpacesField({ value = {}, onChange }) {
  const toggleSpace = (spaceId) => {
    const nextSpaces = { ...value };
    if (nextSpaces[spaceId]) {
      delete nextSpaces[spaceId];
    } else {
      nextSpaces[spaceId] = "private";
    }
    onChange(nextSpaces);
  };

  const setAccess = (spaceId, access) => {
    onChange({ ...value, [spaceId]: access });
  };

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-zinc-900">Espaces du logement</legend>
      <p className="-mt-1 text-xs text-zinc-500">
        Indiquez les espaces disponibles et s&apos;ils sont privés ou partagés.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LISTING_SPACES.map(({ id, label, icon: Icon }) => {
          const access = value?.[id];
          const isSelected = Boolean(access);

          return (
            <div
              key={id}
              className={`rounded-xl border p-3 transition-colors ${
                isSelected
                  ? "border-primary-300 bg-primary-50/70"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              }`}
            >
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleSpace(id)}
                className="flex w-full items-center gap-3 text-left"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-white text-primary-700" : "bg-zinc-100 text-zinc-600"}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex-1 text-sm font-medium text-zinc-900">{label}</span>
                <span className={`text-xs font-semibold ${isSelected ? "text-primary-700" : "text-zinc-500"}`}>
                  {isSelected ? "Ajouté" : "Ajouter"}
                </span>
              </button>

              {isSelected && (
                <div className="mt-3 flex rounded-lg bg-white p-1 ring-1 ring-inset ring-primary-100" role="group" aria-label={`Accès à ${label.toLowerCase()}`}>
                  {SPACE_ACCESS_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={access === option.id}
                      onClick={() => setAccess(id, option.id)}
                      className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${access === option.id ? "bg-primary-600 text-white" : "text-zinc-600 hover:bg-primary-50 hover:text-primary-800"}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}