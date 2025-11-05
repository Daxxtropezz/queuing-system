import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState, useCallback } from "react";
import { debounce } from "lodash";
import AuditLogModal from "@/components/audit-modal";

// UI
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FileWarning,
  Search as SearchIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingOverlay from "@/components/loading-overlay";
import Pagination from "@/components/pagination";


// Types
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

  // Sorting
  const [sortBy, setSortBy] = useState(filters?.sort_by || "created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    filters?.sort_direction || "desc"
  );

  // Debounced search
  const performSearch = useCallback(
    debounce((value: string) => {
      setIsLoading(true);
      router.get(
        route("audit-logs.index"),
        { search: value, sort_by: sortBy, sort_direction: sortDirection },
        {
          preserveState: true,
          replace: true,
          only: ["logs", "filters"],
          onFinish: () => setIsLoading(false),
        }
      );
    }, 400),
    [sortBy, sortDirection]
  );

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = searchQuery.trim();

      // Only search if 3 or more characters, or if empty (to reset results)
      if (value.length >= 3 || value.length === 0) {
        setIsLoading(true);
        router.get(
          route("audit-logs.index"),
          { search: value, sort_by: sortBy, sort_direction: sortDirection },
          {
            preserveState: true,
            replace: true,
            only: ["logs", "filters"],
            onFinish: () => setIsLoading(false),
          }
        );
      }
    }
  };

  // Handle sorting
  const toggleSort = (column: string) => {
    const direction =
      sortBy === column && sortDirection === "asc" ? "desc" : "asc";
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
      },
      {
        preserveState: true,
        only: ["logs", "filters"],
        onFinish: () => setIsLoading(false),
      }
    );
  };


  // Modal state
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (log: AuditLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  const breadcrumbs = [{ title: "Audit Logs", href: "/audit-logs" }];

  return (
    <>
      <Head title="Audit Logs" />
      <AppLayout breadcrumbs={breadcrumbs}>
        <LoadingOverlay
          visible={isLoading}
          title="Switching View"
          message="Loading new data, please wait..."
          className="z-[60]"
          animation="bounce"
        />

        <div className="py-10">
          <div className="mx-4 sm:rounded-lg">
            <div className="container mx-auto px-4 sm:px-8">
              {/* Page Header */}
              <div className="flex flex-col gap-2 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
                <p className="text-sm text-muted-foreground">
                  Track system changes and user activities in real time.
                </p>
              </div>

              {/* Filters */}
              <div className="mb-6 flex flex-wrap gap-3 items-center justify-between bg-muted/40 p-4 rounded-xl">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    placeholder="Search logs..."
                    onChange={onSearchInputChange}
                    onKeyDown={onSearchKeyDown}
                    maxLength={50}
                    className="pl-8"
                    disabled={isLoading}
                  />

                  {isLoading && (
                    <span className="absolute right-2 top-2.5 h-4 w-4 animate-spin border-2 border-muted-foreground border-t-transparent rounded-full" />
                  )}
                </div>

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
                    {logNames.map((name: string) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border">
                <Table className="w-full border-collapse">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>#</TableHead>
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
                      [...Array(logs.per_page || 10)].map((_, i) => (
                        <TableRow key={i} className="animate-pulse">
                          {[...Array(7)].map((__, j) => (
                            <TableCell key={j}>
                              <Skeleton className="mx-auto h-4 w-24" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : logs.data.length ? (
                      logs.data.map((log, i) => (
                        <TableRow key={log.id} className="transition-opacity">
                          <TableCell>
                            {(logs.current_page - 1) * logs.per_page + i + 1}
                          </TableCell>
                          <TableCell>{log.log_name}</TableCell>
                          <TableCell data-tippy-content={log.description || "-"}
                            className="max-w-[200px] truncate cursor-help">
                            {log.description && log.description.length > 20
                              ? log.description.substring(0, 20) + "..."
                              : log.description || "-"}
                          </TableCell>
                          <TableCell>{log.event || "-"}</TableCell>
                          <TableCell>
                            {log.causer
                              ? `${log.causer.first_name?.charAt(0)}.${log.causer.last_name}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
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
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <FileWarning className="h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">No Logs Found</h3>
                            <p className="text-sm text-muted-foreground">
                              Try adjusting filters or check again later.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* ✅ Reusable Pagination */}
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
            </div>
          </div>
        </div>



        <AuditLogModal
          isOpen={isModalOpen}
          onClose={closeModal}
          log={selectedLog}
        />
      </AppLayout>
    </>
  );
}
