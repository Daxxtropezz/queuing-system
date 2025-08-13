import { Head, router, usePage } from '@inertiajs/react';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import tippy from 'tippy.js';
import 'tippy.js/animations/scale-extreme.css';
import 'tippy.js/dist/tippy.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, ArrowUp, ArrowUpDown, FileWarning, Search as SearchIcon, SquarePen, Trash2 } from 'lucide-react';

import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';

import MaintenanceModal from '@/components/maintenance-modal';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { formatToManila } from '@/utilities/formatUtils';
import { loadName } from '@/utilities/nameUtils';

interface User {
    first_name: string;
    middle_name?: string;
    last_name: string;
}

interface MaintenanceItem {
    maintenance_id: number;
    category_name: string;
    category_value: string;
    category_des: string;
    category_module: string;
    created_by: User;
    created_at: string;
    updated_by: User | null;
    updated_at: string | null;
}

interface MaintenanceProps {
    maintenance: {
        data: MaintenanceItem[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        path: string;
    };
    filters: {
        search?: string;
        sort_by?: string;
        sort_direction?: 'asc' | 'desc';
    };
    flash: { success?: string; error?: string };
}

const truncateText = (text: string | null | undefined, maxLength: number) => {
    if (!text) return '';
    if (text.length > maxLength) return text.slice(0, maxLength) + '...';
    return text;
};

export default function MaintenancePage() {
    const { maintenance, filters, flash } = usePage<MaintenanceProps>().props;

    const initialSearch = filters?.search || '';
    const initialSortBy = filters?.sort_by || '';
    const initialSortDirection = filters?.sort_direction || '';

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceItem | null>(null);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [sorting, setSorting] = useState<SortingState>(
        initialSortBy && initialSortDirection ? [{ id: initialSortBy, desc: initialSortDirection === 'desc' }] : [],
    );
    const [isLoading, setIsLoading] = useState(true);

    const itemStartIndex = useMemo(() => {
        return (maintenance.current_page - 1) * maintenance.per_page;
    }, [maintenance.current_page, maintenance.per_page]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [maintenance]);

    const columns = useMemo<ColumnDef<MaintenanceItem>[]>(
        () => [
            {
                id: 'index',
                header: () => <div className="text-center">#</div>,
                cell: ({ row }) => <div className="text-center">{itemStartIndex + row.index + 1}</div>,
                enableSorting: false,
            },
            {
                accessorKey: 'category_name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        disabled={isLoading}
                    >
                        Name
                        {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </Button>
                ),
                cell: ({ row }) => truncateText(row.original.category_name, 15),
            },
            {
                accessorKey: 'category_value',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        disabled={isLoading}
                    >
                        Value
                        {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </Button>
                ),
                cell: ({ row }) => truncateText(row.original.category_value, 15),
            },
            {
                accessorKey: 'category_des',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        disabled={isLoading}
                    >
                        Description
                        {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </Button>
                ),
                cell: ({ row }) => truncateText(row.original.category_des, 15),
            },
            {
                accessorKey: 'category_module',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        disabled={isLoading}
                    >
                        Module
                        {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </Button>
                ),
                cell: ({ row }) => truncateText(row.original.category_module, 15),
            },
            {
                accessorKey: 'created_by.first_name',
                header: () => <div className="text-center">Created By</div>,
                cell: ({ row }) => loadName(row.original.created_by),
                enableSorting: false,
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        disabled={isLoading}
                    >
                        Created At
                        {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </Button>
                ),
                cell: ({ row }) => <span className="text-xs">{formatToManila(row.original.created_at)}</span>,
            },
            {
                accessorKey: 'updated_by.first_name',
                header: () => <div className="text-center">Updated By</div>,
                cell: ({ row }) => row.original.updated_by ? loadName(row.original.updated_by) : '',
                enableSorting: false,
            },
            {
                accessorKey: 'updated_at',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        disabled={isLoading}
                    >
                        Updated At
                        {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </Button>
                ),
                cell: ({ row }) => <span className="text-xs">{row.original.updated_at ? formatToManila(row.original.updated_at) : ''}</span>,
            },
            {
                id: 'actions',
                header: () => <div className="text-center">Actions</div>,
                cell: ({ row }) => (
                    <div className="text-center">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => openEditModal(row.original)}
                            className="edit-btn mr-2"
                            disabled={isLoading}
                        >
                            <SquarePen className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => confirmDelete(row.original)}
                            className="delete-btn"
                            disabled={isLoading}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
                enableSorting: false,
            },
        ],
        [itemStartIndex, isLoading]
    );

    const table = useReactTable({
        data: maintenance.data || [],
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualSorting: true,
    });

    const paginationPages = useCallback(() => {
        const current = maintenance.current_page;
        const last = maintenance.last_page;
        const range = 2;
        let pages = [];
        for (let i = 1; i <= last; i++) {
            if (i === 1 || i === last || (i >= current - range && i <= current + range)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    }, [maintenance.current_page, maintenance.last_page]);

    const openCreateModal = () => setIsCreateModalVisible(true);
    const closeCreateModal = () => setIsCreateModalVisible(false);
    const openEditModal = (item: MaintenanceItem) => {
        setSelectedMaintenance(item);
        setIsEditModalVisible(true);
    };
    const closeEditModal = () => {
        setIsEditModalVisible(false);
        setSelectedMaintenance(null);
    };

    const confirmDelete = (item: MaintenanceItem) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert this! Deleting ${item.category_name}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMaintenance(item.maintenance_id);
            }
        });
    };

    const deleteMaintenance = (maintenanceId: number) => {
        router.delete(`/maintenance/${maintenanceId}`, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The maintenance has been deleted.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                });
            },
            onError: () => {
                Swal.fire({
                    title: 'Error!',
                    text: 'Something went wrong while deleting the maintenance.',
                    icon: 'error',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                });
            },
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const performSearch = useCallback(
        debounce((value) => {
            setIsLoading(true);
            const cleanedSearchQuery = value.replace(/[^a-zA-Z0-9\s@._-]/g, '');
            if (cleanedSearchQuery.length >= 3 || cleanedSearchQuery === '') {
                router.get(
                    maintenance.path,
                    {
                        search: cleanedSearchQuery,
                        sort_by: sorting.length > 0 ? sorting[0].id : '',
                        sort_direction: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
                    },
                    {
                        preserveState: true,
                        replace: true,
                        only: ['maintenance', 'filters'],
                        onFinish: () => setIsLoading(false),
                    },
                );
            } else {
                setIsLoading(false);
            }
        }, 300),
        [sorting, maintenance.path],
    );

    const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        performSearch(e.target.value);
    };

    const goToPage = (page: number | string) => {
        if (page && page !== '...') {
            setIsLoading(true);
            router.get(
                maintenance.path,
                {
                    page: page,
                    search: searchQuery,
                    sort_by: sorting.length > 0 ? sorting[0].id : '',
                    sort_direction: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
                },
                {
                    only: ['maintenance', 'filters'],
                    preserveState: true,
                    onFinish: () => setIsLoading(false),
                },
            );
        }
    };

    useEffect(() => {
        const sortBy = sorting.length > 0 ? sorting[0].id : '';
        const sortDirection = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '';
        if (sortBy !== (filters?.sort_by || '') || sortDirection !== (filters?.sort_direction || '')) {
            setIsLoading(true);
            router.get(
                maintenance.path,
                {
                    search: searchQuery,
                    sort_by: sortBy,
                    sort_direction: sortDirection,
                },
                {
                    preserveState: true,
                    replace: true,
                    only: ['maintenance', 'filters'],
                    onFinish: () => setIsLoading(false),
                },
            );
        }
    }, [sorting, searchQuery]);

    useEffect(() => {
        if (filters?.sort_by) {
            setSorting([
                {
                    id: filters.sort_by,
                    desc: filters.sort_direction === 'desc',
                },
            ]);
        } else {
            setSorting([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters?.sort_by, filters?.sort_direction]);

    useEffect(() => {
        const destroyTippyInstances = (selector: string) => {
            document.querySelectorAll(selector).forEach((el) => {
                if ((el as any)._tippy) (el as any)._tippy.destroy();
            });
        };

        if (!isLoading) {
            destroyTippyInstances('.edit-btn');
            destroyTippyInstances('.delete-btn');

            tippy('.edit-btn', {
                content: 'Edit Maintenance',
                placement: 'top',
                animation: 'scale-extreme',
            });
            tippy('.delete-btn', {
                content: 'Delete Maintenance',
                placement: 'top',
                animation: 'scale-extreme',
            });
        }

        return () => {
            destroyTippyInstances('.edit-btn');
            destroyTippyInstances('.delete-btn');
        };
    }, [maintenance.data, isLoading]);

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                title: 'Success',
                text: flash.success,
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
        }
        if (flash?.error) {
            Swal.fire({
                title: 'Error',
                text: flash.error,
                icon: 'error',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
        }
    }, [flash]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Maintenance Management',
            href: '/maintenance',
        },
    ];

    return (
        <>
            <Head title="Maintenance Management" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="py-2">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <Button onClick={openCreateModal} disabled={isLoading}>
                                        Create Category Maintenance
                                    </Button>
                                    <div className="relative block">
                                        <span className="absolute inset-y-0 left-0 flex h-full items-center pl-2">
                                            <SearchIcon className="h-4 w-4 text-gray-500" />
                                        </span>
                                        <div className="relative block">
                                            <Input
                                                value={searchQuery}
                                                placeholder="Search..."
                                                onChange={onSearchInputChange}
                                                maxLength={50}
                                                className="block w-full appearance-none rounded-l rounded-r border border-b border-gray-400 bg-white py-2 pr-6 pl-8 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:text-gray-700 focus:placeholder-gray-600 focus:outline-none sm:rounded-l-none"
                                                disabled={isLoading}
                                            />
                                            {searchQuery.length > 0 && searchQuery.length < 3 && (
                                                <p className="mt-1 text-xs text-red-500">Type at least 3 characters to search</p>
                                            )}
                                            {filters?.search && <p className="mt-1 text-xs text-green-500">Showing results for "{filters.search}"</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto rounded-lg">
                                    <Table className="w-full border-collapse">
                                        <TableHeader>
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <TableRow key={headerGroup.id}>
                                                    {headerGroup.headers.map((header) => (
                                                        <TableHead key={header.id} className="text-center">
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                [...Array(maintenance.per_page || 10)].map((_, index) => (
                                                    <TableRow key={index}>
                                                        {columns.map((col, i) => (
                                                            <TableCell key={i}>
                                                                <Skeleton className="mx-auto h-4 w-24" />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            ) : table.getRowModel().rows?.length ? (
                                                table.getRowModel().rows.map((row) => (
                                                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="text-center">
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell key={cell.id}>
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={columns.length} className="p-10 text-center">
                                                        <div className="flex flex-col items-center justify-center space-y-4">
                                                            <FileWarning className="h-12 w-12 text-gray-400" />
                                                            <p className="text-xl font-semibold">No Records Found</p>
                                                            <p className="text-md text-gray-500">It looks like there are no entries here yet.</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                {maintenance?.data && maintenance.data.length > 0 && !isLoading && (
                                    <div className="mt-4 flex justify-center">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        onClick={() => goToPage(maintenance.current_page - 1)}
                                                        disabled={maintenance.current_page <= 1 || isLoading}
                                                    />
                                                </PaginationItem>
                                                {paginationPages().map((page, i) => (
                                                    <PaginationItem key={i}>
                                                        {page === '...' ? (
                                                            <PaginationEllipsis />
                                                        ) : (
                                                            <PaginationLink
                                                                onClick={() => goToPage(page)}
                                                                isActive={page === maintenance.current_page}
                                                                disabled={isLoading}
                                                            >
                                                                {page}
                                                            </PaginationLink>
                                                        )}
                                                    </PaginationItem>
                                                ))}
                                                <PaginationItem>
                                                    <PaginationNext
                                                        onClick={() => goToPage(maintenance.current_page + 1)}
                                                        disabled={maintenance.current_page >= maintenance.last_page || isLoading}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                                {/* Create Modal */}
                                {isCreateModalVisible && (
                                    <MaintenanceModal isModalVisible={isCreateModalVisible} onClose={closeCreateModal} />
                                )}
                                {/* Edit Modal */}
                                {isEditModalVisible && (
                                    <MaintenanceModal
                                        maintenance={selectedMaintenance}
                                        isModalVisible={isEditModalVisible}
                                        onClose={closeEditModal}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}