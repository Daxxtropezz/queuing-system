import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import tippy from 'tippy.js';
import 'tippy.js/animations/scale-extreme.css';
import 'tippy.js/dist/tippy.css';

// Shadcn UI Components
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
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import {
    ArrowDown, // Import for sortable icon
    ArrowUp,
    ArrowUpDown, // Renamed to avoid conflict if 'Search' is also a component
    FileWarning,
    Search as SearchIcon,
    SquarePen,
    Trash2,
} from 'lucide-react';

// TanStack Table
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';

// Custom Modal Components
import RegionModal from '@/components/psgc/region-modal';

// Define the type for your region data
interface Region {
    psgc_reg: string;
    reg_name: string;
    region: string;
    // Add other properties if your region object has them
}

// Extend usePage props to include flash messages
interface PageProps {
    regions: {
        data: Region[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        path: string;
    };
    flash: {
        success?: string;
        error?: string;
    };
    filters: {
        search?: string;
        sort_by?: string;
        sort_direction?: 'asc' | 'desc';
    };
}


export default function Regions() {
    const { regions, flash, filters } = usePage<PageProps>().props;
    const initialSearch = filters?.search || '';
    const initialSortBy = filters?.sort_by || '';
    const initialSortDirection = filters?.sort_direction || '';

    const [isCreateModalVisible, setIsCreateModal] = useState(false);
    const [isEditModalVisible, setIsEditModal] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [sorting, setSorting] = useState<SortingState>(
        initialSortBy && initialSortDirection ? [{ id: initialSortBy, desc: initialSortDirection === 'desc' }] : [],
    );
    const [isLoading, setIsLoading] = useState(true); // New loading state for skeleton

    const itemStartIndex = useMemo(() => {
        return (regions.current_page - 1) * regions.per_page;
    }, [regions.current_page, regions.per_page]);


    // Simulate loading on initial mount and data changes
    useEffect(() => {
        setIsLoading(true); // Set loading to true when data might change
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800); // Simulate 800ms loading time
        return () => clearTimeout(timer);
    }, [regions]); // Dependency on 'regions' prop to trigger loading on data updates

    // Define your table columns using TanStack Table's ColumnDef
    const columns = useMemo<ColumnDef<Region>[]>(() => [
    {
        id: 'index',
        header: () => <div className="text-center">#</div>,
        cell: ({ row }) => (
            <div className="text-center">
                {itemStartIndex + row.index + 1}
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: 'psgc_reg',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                disabled={isLoading}
            >
                Code
                {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
                {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
                {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
            </Button>
        ),
        cell: ({ row }) => <div className="text-center">{row.original.psgc_reg}</div>,
    },
            {
                accessorKey: 'reg_name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        disabled={isLoading} // Disable sort button when loading
                    >
                        Name
                        {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </Button>
                ),
                cell: ({ row }) => <div className="text-center">{row.original.reg_name}</div>,
            },
            {
                accessorKey: 'region',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        disabled={isLoading} // Disable sort button when loading
                    >
                        Classification
                        {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </Button>
                ),
                cell: ({ row }) => <div className="text-center">{row.original.region}</div>,
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
                            disabled={isLoading} // Disable action buttons when loading
                        >
                            <SquarePen className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => confirmDelete(row.original.psgc_reg)}
                            className="delete-btn"
                            disabled={isLoading} // Disable action buttons when loading
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
                enableSorting: false, // Actions column should not be sortable
            },
        ],
        [itemStartIndex, isLoading]);

    // TanStack Table instance
    const table = useReactTable({
        data: regions.data || [], // Ensure data is an array
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualSorting: true, // Indicate that sorting is handled manually (server-side)
    });

    const paginationPages = useCallback(() => {
        const current = regions.current_page;
        const last = regions.last_page;
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
    }, [regions.current_page, regions.last_page]);

    const openCreateModal = () => {
        setIsCreateModal(true);
    };

    const closeCreateModal = () => {
        setIsCreateModal(false);
        router.reload({ only: ['regions', 'filters'] });
    };

    const openEditModal = (region: Region) => {
        setSelectedRegion(region);
        setIsEditModal(true);
    };

    const closeEditModal = () => {
        setIsEditModal(false);
        setSelectedRegion(null);
        router.reload({ only: ['regions', 'filters'] });
    };

    const confirmDelete = (regionId: string) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                deleteRegion(regionId);
            }
        });
    };

    const deleteRegion = (regionId: string) => {
        router.delete(route('region.destroy', regionId), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The region has been deleted.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                });
            },
            onError: (errors) => {
                const error = errors.delete_error || Object.values(errors).flat()[0];
                if (error) {
                    Swal.fire({
                        title: 'Cannot Delete!',
                        text: error as string,
                        icon: 'warning',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: 'An unknown error occurred.',
                        icon: 'error',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                }
            },
            onStart: () => setIsLoading(true), // Set loading on start
            onFinish: () => setIsLoading(false), // Set loading on finish
        });
    };

    // Debounced search function
    const performSearch = useCallback(
        debounce((value) => {
            setIsLoading(true); // Set loading when search starts
            const cleanedSearchQuery = value.replace(/[^a-zA-Z0-9\s]/g, '');
            if (cleanedSearchQuery.length >= 3 || cleanedSearchQuery === '') {
                router.get(
                    route('region.index'),
                    {
                        search: cleanedSearchQuery,
                        sort_by: sorting.length > 0 ? sorting[0].id : '',
                        sort_direction: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
                    },
                    {
                        preserveState: true,
                        replace: true,
                        only: ['regions', 'filters'],
                        onFinish: () => setIsLoading(false), // Set loading on finish
                    },
                );
            } else {
                setIsLoading(false); // If less than 3 chars, stop loading immediately
            }
        }, 300),
        [sorting], // Recreate debounce if sorting state changes to include updated sort params
    );

    // Update searchQuery state and trigger debounced search
    const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        performSearch(value);
    };

    const goToPage = (page: number | string) => {
        if (page && page !== '...') {
            setIsLoading(true); // Set loading when changing page
            router.get(
                route('region.index'),
                {
                    page: page,
                    search: searchQuery,
                    sort_by: sorting.length > 0 ? sorting[0].id : '',
                    sort_direction: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
                },
                {
                    only: ['regions', 'filters'],
                    preserveState: true,
                    onFinish: () => setIsLoading(false), // Set loading on finish
                },
            );
        }
    };

    // Effect to handle sorting changes and trigger Inertia request
    useEffect(() => {
        const sortBy = sorting.length > 0 ? sorting[0].id : '';
        const sortDirection = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '';

        if (sortBy !== (filters?.sort_by || '') || sortDirection !== (filters?.sort_direction || '')) {
            setIsLoading(true); // Set loading when sorting changes
            router.get(
                route('region.index'),
                {
                    search: searchQuery,
                    sort_by: sortBy,
                    sort_direction: sortDirection,
                },
                {
                    preserveState: true,
                    replace: true,
                    only: ['regions', 'filters'],
                    onFinish: () => setIsLoading(false), // Set loading on finish
                },
            );
        }
    }, [sorting, searchQuery, filters]);

    useEffect(() => {
        const destroyTippyInstances = (selector: string) => {
            document.querySelectorAll(selector).forEach((el) => {
                if (el._tippy) el._tippy.destroy();
            });
        };

        // Only initialize tippy if not loading
        if (!isLoading) {
            destroyTippyInstances('.edit-btn');
            destroyTippyInstances('.delete-btn');

            tippy('.edit-btn', {
                content: 'Edit Region',
                placement: 'top',
                animation: 'scale-extreme',
            });
            tippy('.delete-btn', {
                content: 'Delete Region',
                placement: 'top',
                animation: 'scale-extreme',
            });
        }

        return () => {
            destroyTippyInstances('.edit-btn');
            destroyTippyInstances('.delete-btn');
        };
    }, [regions.data, isLoading]); // Re-run effect if regions data or loading state changes

    useEffect(() => {
        if (flash.success) {
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

        if (flash.error) {
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

    const breadcrumbs = [
        {
            title: 'Regions',
            href: '/region',
        },
    ];

    return (
        <>
            <Head title="Regions" />

            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="py-2">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <Button onClick={openCreateModal} disabled={isLoading}>
                                        {' '}
                                        {/* Disable button when loading */}
                                        Create Region
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
                                                disabled={isLoading} // Disable input when loading
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
                                                    {headerGroup.headers.map((header) => {
                                                        return (
                                                            <TableHead key={header.id} className="text-center">
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                                            </TableHead>
                                                        );
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                // Skeleton rows while loading
                                                [...Array(regions.per_page || 10)].map((_, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Skeleton className="mx-auto h-4 w-16" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Skeleton className="mx-auto h-4 w-32" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Skeleton className="mx-auto h-4 w-24" />
                                                        </TableCell>
                                                        <TableCell className="flex h-full items-center justify-center space-x-2 py-4">
                                                            <Skeleton className="h-8 w-12 rounded-md" />
                                                            <Skeleton className="h-8 w-12 rounded-md" />
                                                        </TableCell>
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

                                {/* Conditional Rendering for Pagination */}
                                {regions?.data &&
                                    regions.data.length > 0 &&
                                    !isLoading && ( // Only show pagination if not loading
                                        <div className="mt-4 flex justify-center">
                                            <Pagination>
                                                <PaginationContent>
                                                    <PaginationItem>
                                                        <PaginationPrevious
                                                            onClick={() => goToPage(regions.current_page - 1)}
                                                            disabled={regions.current_page <= 1 || isLoading} // Disable when loading
                                                        />
                                                    </PaginationItem>
                                                    {paginationPages().map((page, i) => (
                                                        <PaginationItem key={i}>
                                                            {page === '...' ? (
                                                                <PaginationEllipsis />
                                                            ) : (
                                                                <PaginationLink
                                                                    onClick={() => goToPage(page)}
                                                                    isActive={page === regions.current_page}
                                                                    disabled={isLoading} // Disable when loading
                                                                >
                                                                    {page}
                                                                </PaginationLink>
                                                            )}
                                                        </PaginationItem>
                                                    ))}
                                                    <PaginationItem>
                                                        <PaginationNext
                                                            onClick={() => goToPage(regions.current_page + 1)}
                                                            disabled={regions.current_page >= regions.last_page || isLoading} // Disable when loading
                                                        />
                                                    </PaginationItem>
                                                </PaginationContent>
                                            </Pagination>
                                        </div>
                                    )}

                                {/* Create Region Modal */}
                                {isCreateModalVisible && <RegionModal isModalVisible={isCreateModalVisible} onClose={closeCreateModal} />}

                                {/* Edit Region Modal */}
                                {isEditModalVisible && (
                                    <RegionModal region={selectedRegion} isModalVisible={isEditModalVisible} onClose={closeEditModal} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
