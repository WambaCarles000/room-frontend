// "use client";

// import { useState } from "react";

// export default function ListingFilters({
//   filters,
//   onFiltersChange,
//   onReset,
//   totalCount,
// }) {
//   const [isOpen, setIsOpen] = useState(false);

//   const handleSearchChange = (e) => {
//     onFiltersChange({
//       ...filters,
//       search: e.target.value,
//     });
//   };

//   const handleStatusChange = (e) => {
//     onFiltersChange({
//       ...filters,
//       status: e.target.value,
//     });
//   };

//   const handleTypeChange = (type) => {
//     const types = new Set(filters.types || []);
//     if (types.has(type)) {
//       types.delete(type);
//     } else {
//       types.add(type);
//     }
//     onFiltersChange({
//       ...filters,
//       types: Array.from(types),
//     });
//   };

//   const handlePriceChange = (e) => {
//     onFiltersChange({
//       ...filters,
//       maxPrice: e.target.value ? parseInt(e.target.value) : null,
//     });
//   };

//   const handleReset = () => {
//     onReset();
//     setIsOpen(false);
//   };

//   const hasActiveFilters =
//     filters.search ||
//     filters.status ||
//     (filters.types && filters.types.length > 0) ||
//     filters.maxPrice;

//   return (
//     <div className="sticky top-16 z-30 border-b border-zinc-200 bg-white shadow-sm">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         {/* Search Bar */}
//         <div className="py-4">
//           <div className="relative">
//             <svg
//               className="absolute left-3 top-3 h-5 w-5 text-zinc-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//               />
//             </svg>
//             <input
//               type="text"
//               placeholder="Rechercher un logement..."
//               value={filters.search || ""}
//               onChange={handleSearchChange}
//               className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
//             />
//           </div>
//         </div>

//         {/* Desktop Filters Bar */}
//         <div className="hidden gap-3 border-t border-zinc-200 py-4 sm:flex">
//           {/* Status Filter */}
//           <select
//             value={filters.status || ""}
//             onChange={handleStatusChange}
//             className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
//           >
//             <option value="">Tous les statuts</option>
//             <option value="available">Disponible</option>
//             <option value="rented">Loué</option>
//             <option value="taken">Réservé</option>
//             <option value="sold">Vendu</option>
//           </select>

//           {/* Type Filter */}
//           <div className="flex gap-2">
//             {["studio", "chambre", "appartement"].map((type) => (
//               <button
//                 key={type}
//                 onClick={() => handleTypeChange(type)}
//                 className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
//                   filters.types?.includes(type)
//                     ? "bg-zinc-900 text-white"
//                     : "border border-zinc-300 text-zinc-900 hover:border-zinc-400"
//                 }`}
//               >
//                 {type.charAt(0).toUpperCase() + type.slice(1)}
//               </button>
//             ))}
//           </div>

//           {/* Max Price Filter */}
//           <input
//             type="number"
//             placeholder="Prix max"
//             value={filters.maxPrice || ""}
//             onChange={handlePriceChange}
//             className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
//           />

//           {/* Reset Button */}
//           {hasActiveFilters && (
//             <button
//               onClick={handleReset}
//               className="ml-auto rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition"
//             >
//               Réinitialiser
//             </button>
//           )}

//           {/* Results Count */}
//           <div className="ml-auto flex items-center text-sm text-zinc-600">
//             {totalCount} résultat{totalCount !== 1 ? "s" : ""}
//           </div>
//         </div>

//         {/* Mobile Filters Toggle */}
//         <div className="flex sm:hidden items-center justify-between border-t border-zinc-200 py-3">
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900"
//           >
//             <svg
//               className="h-4 w-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
//               />
//             </svg>
//             Filtres
//           </button>
//           <div className="text-xs text-zinc-600">
//             {totalCount} résultat{totalCount !== 1 ? "s" : ""}
//           </div>
//         </div>

//         {/* Mobile Filters Drawer */}
//         {isOpen && (
//           <div className="border-t border-zinc-200 bg-zinc-50 p-4 sm:hidden">
//             <div className="space-y-4">
//               {/* Status Filter */}
//               <div>
//                 <label className="block text-xs font-bold text-zinc-900 mb-2">
//                   Statut
//                 </label>
//                 <select
//                   value={filters.status || ""}
//                   onChange={handleStatusChange}
//                   className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
//                 >
//                   <option value="">Tous les statuts</option>
//                   <option value="available">Disponible</option>
//                   <option value="rented">Loué</option>
//                   <option value="taken">Réservé</option>
//                   <option value="sold">Vendu</option>
//                 </select>
//               </div>

//               {/* Type Filter */}
//               <div>
//                 <label className="block text-xs font-bold text-zinc-900 mb-2">
//                   Type
//                 </label>
//                 <div className="flex flex-col gap-2">
//                   {["studio", "chambre", "appartement"].map((type) => (
//                     <button
//                       key={type}
//                       onClick={() => handleTypeChange(type)}
//                       className={`rounded-lg px-3 py-2 text-sm font-medium transition text-left ${
//                         filters.types?.includes(type)
//                           ? "bg-zinc-900 text-white"
//                           : "border border-zinc-300 text-zinc-900 hover:border-zinc-400"
//                       }`}
//                     >
//                       {type.charAt(0).toUpperCase() + type.slice(1)}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Max Price Filter */}
//               <div>
//                 <label className="block text-xs font-bold text-zinc-900 mb-2">
//                   Prix maximum
//                 </label>
//                 <input
//                   type="number"
//                   placeholder="Prix max"
//                   value={filters.maxPrice || ""}
//                   onChange={handlePriceChange}
//                   className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
//                 />
//               </div>

//               {/* Reset Button */}
//               {hasActiveFilters && (
//                 <button
//                   onClick={handleReset}
//                   className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 transition"
//                 >
//                   Réinitialiser
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";

export default function ListingFilters({
  filters,
  onFiltersChange,
  onReset,
  totalCount,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchChange = (e) => {
    onFiltersChange({
      ...filters,
      search: e.target.value,
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

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    (filters.types && filters.types.length > 0) ||
    filters.maxPrice;

  return (
    <div className="sticky top-16 z-30 border-b border-zinc-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="py-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-3 h-5 w-5 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un logement..."
              value={filters.search || ""}
              onChange={handleSearchChange}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
        </div>

        {/* ✅ Desktop Filters Bar - AVEC FLEX-WRAP */}
        <div className="hidden lg:flex gap-3 border-t border-zinc-200 py-4 flex-wrap items-center">
          {/* Status Filter */}
          <select
            value={filters.status || ""}
            onChange={handleStatusChange}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 shrink-0"
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
                className={`rounded-lg px-3 py-2 text-sm font-medium transition whitespace-nowrap ${
                  filters.types?.includes(type)
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-300 text-zinc-900 hover:border-zinc-400"
                }`}
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
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 shrink-0"
          />

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition shrink-0"
            >
              Réinitialiser
            </button>
          )}

          {/* Results Count - Always on the right */}
          <div className="ml-auto flex items-center text-sm text-zinc-600 shrink-0">
            {totalCount} résultat{totalCount !== 1 ? "s" : ""}
          </div>
        </div>

        {/* ✅ BREAKPOINT INTERMÉDIAIRE (sm à lg) - PLUS COMPACT */}
        <div className="hidden sm:flex lg:hidden gap-2 border-t border-zinc-200 py-3 flex-wrap items-center">
          {/* Status Filter - Compact */}
          <select
            value={filters.status || ""}
            onChange={handleStatusChange}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 shrink-0"
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
                className={`rounded px-2 py-1 text-xs font-medium transition whitespace-nowrap ${
                  filters.types?.includes(type)
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-300 text-zinc-900 hover:border-zinc-400"
                }`}
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
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-600 font-medium placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 w-20 shrink-0"
          />

          {/* Reset Button - Compact */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-50 transition shrink-0"
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
        <div className="sm:hidden flex items-center justify-between border-t border-zinc-200 py-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900"
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
          <div className="border-t border-zinc-200 bg-zinc-50 p-4 sm:hidden">
            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  Statut
                </label>
                <select
                  value={filters.status || ""}
                  onChange={handleStatusChange}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
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
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition text-left ${
                        filters.types?.includes(type)
                          ? "bg-zinc-900 text-white"
                          : "border border-zinc-300 text-zinc-900 hover:border-zinc-400"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price Filter */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Prix maximum
                </label>
                <input
                  type="number"
                  placeholder="Prix max"
                  value={filters.maxPrice || ""}
                  onChange={handlePriceChange}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {/* Reset Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleReset}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 transition"
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