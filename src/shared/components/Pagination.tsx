'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    if (totalPages <= 6) {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-6 border-t border-slate-100 bg-slate-50 flex-wrap" dir="ltr">
      {/* Previous page arrow */}
      <button
        type="button"
        onClick={() => {
          onPageChange(Math.max(1, currentPage - 1));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={currentPage === 1}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm disabled:opacity-40 disabled:hover:bg-slate-100 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer shadow-sm"
      >
        &lt;
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`dots-${index}`}
              className="w-9 h-9 sm:w-10 sm:h-10 text-slate-400 font-extrabold flex items-center justify-center text-sm select-none"
            >
              ...
            </span>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <button
            key={`page-${page}`}
            type="button"
            onClick={() => {
              onPageChange(Number(page));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center cursor-pointer shadow-sm ${
              isCurrent
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next page arrow */}
      <button
        type="button"
        onClick={() => {
          onPageChange(Math.min(totalPages, currentPage + 1));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={currentPage >= totalPages || totalPages === 0}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm disabled:opacity-40 disabled:hover:bg-slate-100 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer shadow-sm"
      >
        &gt;
      </button>
    </div>
  );
}
