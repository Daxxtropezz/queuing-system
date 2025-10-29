import React, { useState, useRef, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { createPortal } from "react-dom";

interface PaginationProps {
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number;
  };
  filters?: Record<string, any>;
  baseUrl: string;
  isLoading?: boolean;

  /** Optional per-page options (defaults to [5, 10, 20, 25, 50, 100]) */
  perPageOptions?: number[];

  /** Optional theme color (affects text, bg, hover states). Default: 'blue' */
  color?: string;

  /** Optional client-mode callbacks */
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  filters = {},
  baseUrl,
  isLoading = false,
  perPageOptions = [5, 10, 20, 25, 50, 100],
  color = "blue",
  onPageChange,
  onPerPageChange,
}) => {
  const { current_page, last_page, total, per_page = 10 } = pagination;
  const currentPerPage = Number(filters?.per_page ?? per_page);
  const [customPerPage, setCustomPerPage] = useState(currentPerPage.toString());
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownPortalRef = useRef<HTMLDivElement>(null);
  const [portalRect, setPortalRect] = useState<{ left: number; top: number; width: number }>({ left: 0, top: 0, width: 100 });

  const paginationPages = () => {
    const range = 2;
    const pages: (number | string)[] = [];
    for (let i = 1; i <= last_page; i++) {
      if (
        i === 1 ||
        i === last_page ||
        (i >= current_page - range && i <= current_page + range)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const goToPage = (page: number) => {
    if (onPageChange) return onPageChange(page);
    router.get(
      baseUrl,
      { ...filters, page, per_page: currentPerPage },
      { preserveState: true, replace: true }
    );
  };

  const updatePerPage = (value: number) => {
    const per = Math.max(1, Number(value) || currentPerPage);
    if (onPerPageChange) return onPerPageChange(per);
    router.get(
      baseUrl,
      { ...filters, page: 1, per_page: per },
      { preserveState: true, replace: true }
    );
  };

  const handleBlur = () => {
    setTimeout(() => setOpen(false), 150); // delay to allow clicking dropdown
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePerPage(Number(customPerPage));
    setOpen(false);
  };

  const colorClasses = {
    text: `text-${color}-600`,
    bg: `bg-${color}-600`,
    hover: `hover:bg-${color}-700`,
  };

  const reposition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const menuHeight = Math.min(perPageOptions.length * 32, 192); // match max-h-48
    const placeTop = spaceBelow < menuHeight && spaceAbove > menuHeight;
    setDropdownPosition(placeTop ? 'top' : 'bottom');
    const rawTop = placeTop ? rect.top - menuHeight - 4 : rect.bottom + 4; // 4px gap
    const width = rect.width; // match trigger width
    // Clamp within viewport with 8px padding
    const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - width - 8));
    const top = Math.min(Math.max(8, rawTop), Math.max(8, window.innerHeight - menuHeight - 8));
    setPortalRect({ left, top, width });
  };

  // Close dropdown when clicking outside (include portal node)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      const insideTrigger = containerRef.current?.contains(t);
      const insidePortal = dropdownPortalRef.current?.contains(t);
      if (!insideTrigger && !insidePortal) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reposition on open/scroll/resize
  useEffect(() => {
    if (!open) return;
    reposition();
    const onScroll = () => reposition();
    const onResize = () => reposition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, perPageOptions.length]);

  return (
    <div className="relative">
      {/* ✅ Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-md">
          <Loader2 className={`w-6 h-6 ${colorClasses.text} animate-spin`} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 px-4 py-3 gap-3 relative">
        {/* Left section */}
        <div className="flex items-center flex-wrap gap-4">
          <span className="text-sm text-gray-600">
            Showing page <strong>{current_page}</strong> of{" "}
            <strong>{last_page}</strong> ({total} total)
          </span>

          {/* Editable Dropdown (Combo Input) */}
          <div ref={containerRef} className="relative">
            {isLoading ? (
              <Skeleton className="w-[140px] h-8 rounded-md" />
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">
                  Rows per page:
                </label>

                <div className="relative" ref={triggerRef}>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={1}
                    value={customPerPage}
                    onFocus={() => setOpen(true)}
                    onChange={(e) => {
                      // keep only digits
                      const v = e.target.value.replace(/\D/g, "");
                      setCustomPerPage(v);
                    }}
                    onBlur={handleBlur}
                    className="w-[100px] h-8 text-sm pr-8"
                    disabled={isLoading}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                  />
                  {/* Toggle button for dropdown */}
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-1.5 top-1.5 p-0.5 rounded hover:bg-gray-100 focus:outline-none"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setOpen((o) => !o);
                      setTimeout(() => reposition(), 0);
                    }}
                    aria-label="Toggle per page options"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right section: Pagination controls */}
        <div className="flex items-center gap-1 flex-wrap justify-center">
          {isLoading ? (
            Array.from({ length: 7 }).map((_, idx) => (
              <Skeleton key={idx} className="w-8 h-8 rounded-md" />
            ))
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={current_page === 1 || isLoading}
                onClick={() => goToPage(current_page - 1)}
              >
                Prev
              </Button>

              {paginationPages().map((page, idx) =>
                page === "..." ? (
                  <Button key={idx} variant="ghost" size="sm" disabled>
                    ...
                  </Button>
                ) : (
                  <Button
                    key={idx}
                    variant={page === current_page ? "default" : "outline"}
                    size="sm"
                    className={
                      page === current_page
                        ? `${colorClasses.bg} text-white ${colorClasses.hover}`
                        : ""
                    }
                    onClick={() => goToPage(page as number)}
                    disabled={isLoading}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                disabled={current_page === last_page || isLoading}
                onClick={() => goToPage(current_page + 1)}
              >
                Next
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Portal dropdown to escape overflow/z-index issues */}
      {!isLoading && open && createPortal(
        <div
          ref={dropdownPortalRef}
          role="listbox"
          className="fixed z-[2147483647] bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto"
          style={{ left: portalRect.left, top: portalRect.top, width: portalRect.width }}
        >
          {perPageOptions.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              className="w-full text-sm px-2 py-1 text-left hover:bg-gray-100"
              onMouseDown={(e) => {
                e.preventDefault();
                setCustomPerPage(option.toString());
                updatePerPage(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default Pagination;