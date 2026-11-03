"use client";

import { useState } from "react";
import { IoChevronDownOutline, IoHomeOutline } from "react-icons/io5";
import { LISTING_SPACES } from "@/lib/listingSpaces";

export default function ListingSpacesFilter({ value = [], onChange, fullWidth = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSpace = (spaceId) => {
    const nextSpaces = value.includes(spaceId)
      ? value.filter((id) => id !== spaceId)
      : [...value, spaceId];
    onChange(nextSpaces);
  };

  return (
    <div className={`relative ${fullWidth ? "w-full" : "shrink-0"}`}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
          value.length
            ? "bg-primary-600 text-white hover:bg-primary-700"
            : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
        } ${fullWidth ? "w-full justify-between" : ""}`}
      >
        <span className="inline-flex items-center gap-2">
          <IoHomeOutline className="h-4 w-4" aria-hidden="true" />
          Espaces
        </span>
        <span className="flex items-center gap-2">
          {value.length > 0 && <span className="text-xs">{value.length}</span>}
          <IoChevronDownOutline
            aria-hidden="true"
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {isOpen && (
        <div className={`absolute top-full z-[70] mt-2 w-72 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl ${fullWidth ? "left-0 w-full" : "left-0 sm:left-auto sm:right-0"}`}>
          <p className="mb-2 px-2 text-xs font-semibold uppercase text-zinc-500">Espaces recherchés</p>
          <div className="space-y-1">
            {LISTING_SPACES.map(({ id, label, icon: Icon }) => (
              <label key={id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-zinc-800 hover:bg-primary-50">
                <input
                  type="checkbox"
                  checked={value.includes(id)}
                  onChange={() => toggleSpace(id)}
                  className="h-4 w-4 rounded border-zinc-300 text-primary-600 focus:ring-primary-500"
                />
                <Icon className="h-4 w-4 text-primary-700" aria-hidden="true" />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-2 w-full border-t border-zinc-100 px-2 pt-3 text-left text-xs font-medium text-primary-700 hover:text-primary-900"
            >
              Effacer les espaces
            </button>
          )}
        </div>
      )}
    </div>
  );
}