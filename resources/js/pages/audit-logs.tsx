import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileWarning, Search as SearchIcon, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingOverlay from "@/components/loading-overlay";
import Pagination from "@/components/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import AuditLogModal from "@/components/audit-modal";
import Box from "@/components/ui/box";

interface AuditLog {
  id: number;
  log_name: string;
  description: string;
  event: string | null;
  subject_type: string | null;
  causer: { id: number; first_name: string; last_name: string } | null;
  created_at: string;
}

interface PageProps {
  logs: {
    data: AuditLog[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    path: string;
  };
  filters: {
    search?: string;
    sort_by?: string;
    sort_direction?: "asc" | "desc";
    log_name?: string;
  };
  logNames: string[];
}

export default function AuditLogs() {
  const { logs, filters, logNames } = usePage<PageProps>().props;

  const [searchQuery, setSearchQuery] = useState(filters?.search || "");
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState(filters?.sort_by || "created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(filters?.sort_direction || "desc");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = searchQuery.trim();

    if (value.length === 0 || value.length >= 3) {
      setIsLoading(true);
      router.get(
        route("audit-logs.index"),
        { search: value, sort_by: sortBy, sort_direction: sortDirection },
        {
          preserveState: true,
          replace: true,
          onFinish: () => setIsLoading(false),
        }
      );
    } else {
      Swal.fire({
        title: "Search Too Short",
        text: "Please enter at least 3 characters or clear the field to reset.",
        icon: "info",
        toast: true,
        position: "top-end",
        timer: 3500,
        showConfirmButton: false,
      });
    }
  };

  const toggleSort = (column: string) => {
    const direction = sortBy === column && sortDirection === "asc" ? "desc" : "asc";
    setSortBy(column);
    setSortDirection(direction);
    setIsLoading(true);

    router.get(
      route("audit-logs.index"),
      {
        page: logs.current_page,
        search: searchQuery,
        sort_by: column,
        sort_direction: direction,
        log_name: filters.log_name,
      },
      {
        preserveState: true,
        only: ["logs", "filters"],
        onFinish: () => setIsLoading(false),
      }
    );
  };

  const openModal = (log: AuditLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <Head title="Audit Logs" />
      <AppLayout>
        <Box className="relative flex min-h-screen flex-col bg-gradient-to-br from-white via-slate-50 to-white text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
          {/* Gradient Blobs */}
          <Box className="pointer-events-none absolute inset-0 overflow-hidden">
            <Box className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-600/20" />
            <Box className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-600/15" />
          </Box>

          {/* Header */}
          <header className="relative z-10 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-slate-800/70 dark:bg-slate-900/70">
            <Box className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-6 text-center md:py-8">
              <h1 className="bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-3xl font-extrabold tracking-[0.18em] text-transparent uppercase drop-shadow-sm md:text-5xl dark:from-amber-300 dark:via-yellow-200 dark:to-amber-400">
                Audit Logs
              </h1>
              <p className="text-sm font-medium tracking-wide text-slate-600 md:text-base dark:text-slate-300">
                Track and review system activities and changes.
              </p>
            </Box>
          </header>

          {/* Main Content */}
          <main className="relative z-10 mx-auto flex w-full flex-1 flex-col px-4 pt-6 pb-12 md:px-8 md:pt-10">
            <Box className="mx-auto w-full max-w-7xl">
              {/* Card container */}
              <Box className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-200/60 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-900/70 dark:ring-slate-800/50">
                <Box className="p-6">
                  {/* Filters */}
                  <Box className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    {/* Log Name Filter */}
                    <Select
                      value={filters.log_name ?? "all"}
                      onValueChange={(value) => {
                        setIsLoading(true);
                        router.get(
                          route("audit-logs.index"),
                          {
                            search: searchQuery,
                            sort_by: sortBy,
                            sort_direction: sortDirection,
                            log_name: value === "all" ? undefined : value,
                          },
                          {
                            preserveState: true,
                            replace: true,
                            only: ["logs", "filters"],
                            onFinish: () => setIsLoading(false),
                          }
                        );
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-60">
                        <SelectValue placeholder="Filter by Log Name" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Logs</SelectItem>
                        {logNames.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Search Bar */}
                    <form
                      onSubmit={handleSearch}
                      className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
                    >
                      <Box className="relative w-full sm:w-72">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                          <SearchIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        </span>
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search logs..."
                          className="w-full rounded-md border border-slate-300 bg-white py-2 pr-3 pl-8 text-sm text-slate-900 placeholder-slate-500 focus:border-slate-400 focus:ring-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-600"
                          disabled={isLoading}
                        />
                        {searchQuery.length > 0 && searchQuery.length < 3 && (
                          <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">
                            Type at least 3 characters or click search
                          </p>
                        )}
                        {filters?.search && (
                          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                            Showing results for "{filters.search}"
                          </p>
                        )}
                      </Box>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold disabled:opacity-60"
                      >
                        <SearchIcon className="h-4 w-4 mr-1" />
                      </Button>
                    </form>
                  </Box>

                  {/* Table */}
                  <Box className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40">
                    <Table className="w-full">
                      <TableHeader className="bg-slate-50 dark:bg-slate-900/60">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-center w-12 text-slate-600 dark:text-slate-300">#</TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={() => toggleSort("log_name")}
                              disabled={isLoading}
                            >
                              Log Name
                              {sortBy === "log_name" ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp className="h-4 w-4" />
                                ) : (
                                  <ArrowDown className="h-4 w-4" />
                                )
                              ) : (
                                <ArrowUpDown className="h-4 w-4 opacity-50" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={() => toggleSort("created_at")}
                              disabled={isLoading}
                            >
                              Date
                              {sortBy === "created_at" ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp className="h-4 w-4" />
                                ) : (
                                  <ArrowDown className="h-4 w-4" />
                                )
                              ) : (
                                <ArrowUpDown className="h-4 w-4 opacity-50" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          [...Array(8)].map((_, i) => (
                            <TableRow key={i}>
                              {[...Array(7)].map((_, j) => (
                                <TableCell key={j}>
                                  <Skeleton className="mx-auto h-4 w-24" />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : logs.data.length ? (
                          logs.data.map((log, i) => (
                            <TableRow key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                              <TableCell className="text-center">
                                {(logs.current_page - 1) * logs.per_page + i + 1}
                              </TableCell>
                              <TableCell>{log.log_name}</TableCell>
                              <TableCell className="max-w-[200px] truncate" title={log.description || "-"}>
                                {log.description || "-"}
                              </TableCell>
                              <TableCell>{log.event || "-"}</TableCell>
                              <TableCell>
                                {log.causer
                                  ? `${log.causer.first_name?.charAt(0)}.${log.causer.last_name}`
                                  : "-"}
                              </TableCell>
                              <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                              <TableCell>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => openModal(log)}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="p-10 text-center">
                              <Box className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-400">
                                <FileWarning className="h-12 w-12 text-muted-foreground" />
                                <p className="text-xl font-semibold">No Logs Found</p>
                                <p className="text-muted-foreground">Try adjusting filters or search again later.</p>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>

                    {logs.data.length > 0 && (
                      <Pagination
                        pagination={{
                          current_page: logs.current_page,
                          last_page: logs.last_page,
                          total: logs.total,
                        }}
                        filters={filters}
                        baseUrl="/audit-logs"
                        isLoading={isLoading}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </main>

          {/* Footer */}
          <footer className="relative z-10 mt-auto w-full border-t border-slate-200/70 bg-white/80 py-4 text-center text-xs font-medium tracking-wide text-slate-600 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-400">
            DSWD Queuing System • Audit Logs
          </footer>
        </Box>

        {/* Modal */}
        {isModalOpen && (
          <AuditLogModal
            isOpen={isModalOpen}
            onClose={closeModal}
            log={selectedLog}
          />
        )}

        {/* Loading Overlay */}
        <LoadingOverlay visible={isLoading} title="Please wait..." message="Fetching audit logs..." />
      </AppLayout>
    </>
  );
}
