

"use client";

import { useState } from "react";
import ListingSearchBar from "@/components/ListingSearchBar";

export default function ListingFilters({
  filters,
  onFiltersChange,
  onReset,
  totalCount,
  showArchivedToggle = false,
  showHiddenToggle = false,
  catalogStyle = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchChange = (search) => {
    onFiltersChange({
      ...filters,
      search,
    });
  };

  const handleStatusChange = (e) => {
    onFiltersChange({
      ...filters,
      status: e.target.value,
    });
  };

  const handleTypeChange = (type) => {
    const types = new Set(filters.types || []);
    if (types.has(type)) {
      types.delete(type);
    } else {
      types.add(type);
    }
    onFiltersChange({
      ...filters,
      types: Array.from(types),
    });
  };

  const handlePriceChange = (e) => {
    onFiltersChange({
      ...filters,
      maxPrice: e.target.value ? parseInt(e.target.value) : null,
    });
  };

  const handleReset = () => {
    onReset();
    setIsOpen(false);
  };

  const typeButtonClass = (type) =>
    filters.types?.includes(type)
      ? "bg-primary-500 text-white hover:bg-primary-600"
      : catalogStyle
      ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
      : "border border-zinc-300 text-zinc-900 hover:border-primary-300";

  const controlClass = catalogStyle
    ? "rounded-full border-0 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
    : "rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    (filters.types && filters.types.length > 0) ||
    filters.maxPrice ||
    filters.showArchived ||
    filters.showHidden;

  return (
    <div className={`sticky top-16 z-30 ${catalogStyle ? "border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur" : "bg-white border-b border-zinc-200"}`}>
      <div className={`mx-auto ${catalogStyle ? "max-w-[1600px]" : "max-w-7xl"} px-4 sm:px-6 lg:px-8`}>
        <div className={catalogStyle ? "py-3 xl:grid xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.45fr)] xl:items-center xl:gap-5" : "py-3"}>
          <ListingSearchBar
            value={filters.search || ""}
            onChange={handleSearchChange}
            className={catalogStyle ? "max-w-none" : ""}
          />

        <div className={`hidden lg:flex gap-3 flex-wrap items-center ${catalogStyle ? "pt-3 xl:pt-0" : "py-3"}`}>
          {/* Status Filter */}
          <select
            value={filters.status || ""}
            onChange={handleStatusChange}
            className={`${controlClass} px-3 py-2 text-sm shrink-0`}
          >
            <option value="">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="rented">Loué</option>
            <option value="taken">Réservé</option>
            <option value="sold">Vendu</option>
          </select>

          {/* Type Filter */}
          <div className="flex gap-2 flex-wrap">
            {["studio", "chambre", "appartement"].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`rounded-full px-3 py-2 text-sm font-medium transition whitespace-nowrap ${typeButtonClass(type)}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Max Price Filter */}
          <input
            type="number"
            placeholder="Prix max"
            value={filters.maxPrice || ""}
            onChange={handlePriceChange}
            className={`${controlClass} px-3 py-2 text-sm placeholder-zinc-500 shrink-0`}
          />

          {showArchivedToggle && (
            <label className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.showArchived}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    showArchived: e.target.checked,
                    showHidden: e.target.checked ? false : filters.showHidden,
                  })
                }
                className="rounded border-zinc-300 text-primary-500 focus:ring-primary-500"
              />
              Afficher archivés
            </label>
          )}

          {showHiddenToggle && (
            <label className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.showHidden}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    showHidden: e.target.checked,
                    showArchived: e.target.checked ? false : filters.showArchived,
                  })
                }
                className="rounded border-zinc-300 text-primary-500 focus:ring-primary-500"
              />
              Vendus / masqués
            </label>
          )}

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className={`rounded-full px-3 py-2 text-sm font-medium transition shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700 ${catalogStyle ? "" : "border border-zinc-300"}`}
            >
              Réinitialiser
            </button>
          )}

          {/* Results Count - Always on the right */}
          <div className="ml-auto flex items-center text-sm text-zinc-600 shrink-0">
            {totalCount} résultat{totalCount !== 1 ? "s" : ""}
          </div>
        </div>
        </div>

        {/* ✅ BREAKPOINT INTERMÉDIAIRE (sm à lg) - PLUS COMPACT */}
        <div className={`hidden sm:flex lg:hidden gap-2 flex-wrap items-center ${catalogStyle ? "pb-3" : "py-3"}`}>
          {/* Status Filter - Compact */}
          <select
            value={filters.status || ""}
            onChange={handleStatusChange}
            className={`${controlClass} px-2 py-1 text-xs shrink-0`}
          >
            <option value="">Statut</option>
            <option value="available">Disponible</option>
            <option value="rented">Loué</option>
            <option value="taken">Réservé</option>
            <option value="sold">Vendu</option>
          </select>

          {/* Type Filter - Compact, wraps */}
          <div className="flex gap-1">
            {["studio", "chambre", "appartement"].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`rounded-full px-2 py-1 text-xs font-medium transition whitespace-nowrap ${typeButtonClass(type)}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Max Price Filter - Compact */}
          <input
            type="number"
            placeholder="Prix"
            value={filters.maxPrice || ""}
            onChange={handlePriceChange}
            className={`${controlClass} px-2 py-1 text-xs font-medium placeholder-zinc-500 w-20 shrink-0`}
          />

          {showArchivedToggle && (
            <label className="flex items-center gap-1 rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.showArchived}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    showArchived: e.target.checked,
                    showHidden: e.target.checked ? false : filters.showHidden,
                  })
                }
                className="rounded border-zinc-300 text-primary-500 focus:ring-primary-500"
              />
              Archivés
            </label>
          )}

          {showHiddenToggle && (
            <label className="flex items-center gap-1 rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.showHidden}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    showHidden: e.target.checked,
                    showArchived: e.target.checked ? false : filters.showArchived,
                  })
                }
                className="rounded border-zinc-300 text-primary-500 focus:ring-primary-500"
              />
              Vendus / masqués
            </label>
          )}

          {/* Reset Button - Compact */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className={`rounded-full px-2 py-1 text-xs font-medium transition shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700 ${catalogStyle ? "" : "border border-zinc-300"}`}
            >
              Réinitialiser
            </button>
          )}

          {/* Results Count */}
          <div className="text-xs text-zinc-600 shrink-0 ml-auto">
            {totalCount} rés.
          </div>
        </div>

        {/* Mobile Filters Toggle - Visible below sm */}
        <div className="sm:hidden flex items-center justify-between py-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-zinc-900 ${catalogStyle ? "bg-zinc-100 hover:bg-zinc-200" : "border border-zinc-300"}`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filtres
          </button>
          <div className="text-xs text-zinc-600">
            {totalCount} résultat{totalCount !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        {isOpen && (
          <div className="bg-zinc-50 p-4 sm:hidden">
            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  Statut
                </label>
                <select
                  value={filters.status || ""}
                  onChange={handleStatusChange}
                  className={`w-full ${controlClass} px-3 py-2 text-sm`}
                >
                  <option value="">Tous les statuts</option>
                  <option value="available">Disponible</option>
                  <option value="rented">Loué</option>
                  <option value="taken">Réservé</option>
                  <option value="sold">Vendu</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  Type
                </label>
                <div className="flex flex-col gap-2">
                  {["studio", "chambre", "appartement"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className={`rounded-full px-3 py-2 text-sm font-medium transition text-left ${typeButtonClass(type)}`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {showArchivedToggle && (
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={!!filters.showArchived}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        showArchived: e.target.checked,
                        showHidden: e.target.checked ? false : filters.showHidden,
                      })
                    }
                    className="rounded border-zinc-300 text-primary-500 focus:ring-primary-500"
                  />
                  Afficher les logements archivés
                </label>
              )}

              {showHiddenToggle && (
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={!!filters.showHidden}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        showHidden: e.target.checked,
                        showArchived: e.target.checked ? false : filters.showArchived,
                      })
                    }
                    className="rounded border-zinc-300 text-primary-500 focus:ring-primary-500"
                  />
                  Afficher vendus / masqués (hors catalogue)
                </label>
              )}

              {/* Max Price Filter */}
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  Prix maximum
                </label>
                <input
                  type="number"
                  placeholder="Prix max"
                  value={filters.maxPrice || ""}
                  onChange={handlePriceChange}
                  className={`w-full ${controlClass} px-3 py-2 text-sm placeholder-zinc-500`}
                />
              </div>

              {/* Reset Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleReset}
                  className={`w-full rounded-full px-3 py-2 text-sm font-medium transition text-red-600 hover:bg-red-50 hover:text-red-700 ${catalogStyle ? "" : "border border-zinc-300"}`}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}