"use client";

import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

export const LISTING_PAGE_SIZE = 15;

export default function ListingPagination({
  currentPage,
  pageSize = LISTING_PAGE_SIZE,
  totalItems,
  onPageChange,
  label = "Pagination des logements",
}) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);
  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const endPage = Math.min(totalPages, startPage + 4);
  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );

  const handlePageChange = (page) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buttonClass =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500";

  return (
    <nav
      aria-label={label}
      className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-5 sm:flex-row"
    >
      <p className="text-sm text-zinc-600" aria-live="polite">
        {firstItem}–{lastItem} sur {totalItems}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${buttonClass} border-zinc-200 text-zinc-700 hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-40`}
          aria-label="Page précédente"
        >
          <IoChevronBackOutline aria-hidden="true" className="h-4 w-4" />
          <span>Précédent</span>
        </button>

        {startPage > 1 && (
          <>
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              className={`${buttonClass} min-w-10 border-zinc-200 px-2 text-zinc-700 hover:bg-zinc-100`}
              aria-label="Page 1"
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-zinc-400" aria-hidden="true">…</span>}
          </>
        )}

        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => handlePageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={`${buttonClass} min-w-10 px-2 ${
              page === currentPage
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-zinc-400" aria-hidden="true">…</span>}
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              className={`${buttonClass} min-w-10 border-zinc-200 px-2 text-zinc-700 hover:bg-zinc-100`}
              aria-label={`Page ${totalPages}`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${buttonClass} border-zinc-200 text-zinc-700 hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-40`}
          aria-label="Page suivante"
        >
          <span>Suivant</span>
          <IoChevronForwardOutline aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}