"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Search,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Link2,
  Lightbulb,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useDebouncedCallback } from "use-debounce";
import { useHistoryList } from "@/app/lib/util/hooks/useHistory";

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function HistoryContent() {
  const {
    records,
    totalItems,
    itemsPerPage,
    isLoading,
    isFetchingNewPage,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalPages,
    handleDelete,
    isDeleting,
  } = useHistoryList();

  // Local state keeps the input field perfectly snappy
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // NEW: State for tracking which record is targeted for deletion
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // use-debounce fires the API request and updates the URL 300ms after the user stops typing
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value); // Updates UI instantly
    debouncedSearch(value); // Delays backend query
  };

  const clearSearch = () => {
    setLocalSearch("");
    debouncedSearch("");
  };

  // NEW: Handler for the confirmation button
  const confirmDeletion = () => {
    if (recordToDelete) {
      handleDelete(recordToDelete);
      setRecordToDelete(null); // Close modal immediately
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl mx-auto space-y-8 pb-12"
      >
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink tracking-tight mb-2">
              Generation History
            </h1>
            <p className="text-ink-soft text-base">
              Access and export your previously synthesized content.
            </p>
          </div>

          <div className="relative group w-full md:w-72">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint group-focus-within:text-signal transition-colors"
            />
            <input
              type="text"
              placeholder="Search URLs or Topics..."
              value={localSearch}
              onChange={handleSearchChange}
              className="pl-10 pr-10 py-2.5 bg-white border border-ink/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal w-full shadow-sm transition-all"
            />
            {localSearch && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="bg-white border border-ink/10 rounded-[1.5rem] shadow-sm flex flex-col h-full overflow-hidden relative">
          {/* Loading overlay for pagination and debounced search */}
          {isFetchingNewPage && !isLoading && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-signal animate-spin" />
            </div>
          )}

          {/* Table Content */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-paper-dim/30 border-b border-ink/10">
                <tr className="text-xs font-bold text-ink-soft uppercase tracking-wider">
                  <th className="px-6 py-4">Source Material</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date Synthesized</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ink/5 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-6 h-6 border-2 border-ink/20 border-t-signal rounded-full animate-spin" />
                        <span className="text-ink-soft text-sm font-medium animate-pulse">
                          Loading history...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-ink-soft">
                        <FileText size={32} className="mb-3 text-ink-faint" />
                        <p className="font-medium text-ink">
                          No generations found.
                        </p>
                        <p className="text-sm mt-1">
                          Try synthesizing some new content!
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="wait">
                    {records.map((item) => {
                      const isIdea = item.metadata?.input_mode === "idea";
                      const displayTitle = isIdea
                        ? item.metadata.topic
                        : item.source_url;

                      return (
                        <motion.tr
                          variants={rowVariants}
                          initial="hidden"
                          animate="show"
                          exit={{ opacity: 0 }}
                          key={item.id}
                          className="hover:bg-paper-dim/20 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white border border-ink/10 flex items-center justify-center text-ink-soft shadow-sm shrink-0">
                                {isIdea ? (
                                  <Lightbulb size={14} />
                                ) : (
                                  <Link2 size={14} />
                                )}
                              </div>
                              <span
                                className="font-mono text-[13px] text-ink max-w-[250px] truncate"
                                title={displayTitle || ""}
                              >
                                {displayTitle}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-ink-soft">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-paper border border-ink/5 text-xs font-bold uppercase tracking-wider">
                              {isIdea ? "Raw Idea" : "Web URL"}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-ink-soft font-medium">
                            {format(
                              new Date(item.created_at),
                              "MMM d, yyyy • h:mm a",
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest ${
                                item.status === "completed"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : item.status === "failed"
                                    ? "bg-ember/10 text-ember"
                                    : "bg-signal/10 text-signal animate-pulse"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              {" "}
                              {item.status === "completed" && (
                                <Link
                                  href={`/app/history/${item.id}`}
                                  className="p-2 text-ink-soft hover:text-signal hover:bg-signal/10 rounded-lg transition-colors border border-transparent hover:border-signal/20"
                                  title="View Results"
                                >
                                  <Eye size={16} />
                                </Link>
                              )}
                              <button
                                // NEW: Set the targeted record ID instead of calling handleDelete directly
                                onClick={() => setRecordToDelete(item.id)}
                                disabled={isDeleting}
                                className="cursor-pointer p-2 text-ink-soft hover:text-ember hover:bg-ember/10 rounded-lg transition-colors border border-transparent hover:border-ember/20 disabled:opacity-50"
                                title="Delete record"
                              >
                                {isDeleting ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Premium Pagination Footer */}
          {totalPages > 0 && (
            <div className="px-6 py-4 border-t border-ink/10 bg-paper-dim/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-ink-soft font-medium">
                Showing{" "}
                <strong className="text-ink">
                  {(page - 1) * itemsPerPage + 1}
                </strong>{" "}
                to{" "}
                <strong className="text-ink">
                  {Math.min(page * itemsPerPage, totalItems)}
                </strong>{" "}
                of <strong className="text-ink">{totalItems}</strong> entries
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-1.5 mr-1 rounded-lg text-ink-soft hover:text-ink hover:bg-white border border-transparent hover:border-ink/10 transition-all shadow-sm disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={16} />
                </button>

                <button className="w-8 h-8 rounded-lg bg-signal text-white text-xs font-bold flex items-center justify-center shadow-md shadow-signal/20">
                  {page}
                </button>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 ml-1 rounded-lg text-ink-soft hover:text-ink hover:bg-white border border-transparent hover:border-ink/10 transition-all shadow-sm disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* The Premium Deletion Modal Overlay */}
      <AnimatePresence>
        {recordToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRecordToDelete(null)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-ink/10 overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-ember/10 flex items-center justify-center mb-4">
                  <AlertTriangle size={24} className="text-red-700" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">
                  Delete Generation?
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  This action cannot be undone. All exported assets associated
                  with this generation will be permanently removed from your
                  workspace.
                </p>
              </div>

              <div className="p-4 bg-paper-dim/50 border-t border-ink/5 flex gap-3">
                <button
                  onClick={() => setRecordToDelete(null)}
                  className="cursor-pointer flex-1 py-2.5 px-4 bg-white border border-ink/10 text-ink rounded-xl font-bold text-sm transition-colors hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletion}
                  className="cursor-pointer flex-1 py-2.5 px-4 bg-red-700 text-white rounded-xl font-bold text-sm transition-colors hover:bg-ember/90 shadow-sm shadow-ember/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Suspense Boundary required for useSearchParams
export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex justify-center py-32">
          <Loader2 className="w-8 h-8 text-signal animate-spin" />
        </div>
      }
    >
      <HistoryContent />
    </Suspense>
  );
}
