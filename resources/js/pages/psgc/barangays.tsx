import { Head, router, usePage } from '@inertiajs/react';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { ArrowDown, ArrowUp, ArrowUpDown, FileWarning, Search as SearchIcon, SquarePen, Trash2 } from 'lucide-react';
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import BarangayModal from '@/components/psgc/barangay-modal';
import AppLayout from '@/layouts/app-layout';

interface Region {
    psgc_reg: string;
    reg_name: string;
}
interface Province {
    psgc_reg: string;
    psgc_prov: string;
    prov_name: string;
}
interface Citymun {
    psgc_prov: string;
    psgc_mun: string;
    mun_name: string;
}
interface Barangay {
    psgc_reg: string;
    psgc_prov: string;
    psgc_mun: string;
    psgc_brgy: string;
    brgy_name: string;
    region?: Region;
    province?: Province;
    citymun?: Citymun;
    status?: string;
}
interface BarangaysPaginationData {
    current_page: number;
    data: Barangay[];
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}
interface PageProps {
    regions: Region[];
    provinces: Province[];
    citymuns: Citymun[];
    barangays: BarangaysPaginationData;
    filters: { search?: string; sort_by?: string; sort_direction?: string };
    flash: { success?: string; error?: string };
}

export default function BarangaysPage() {
    const { props } = usePage<PageProps>();
    const { regions, provinces, citymuns, barangays, filters, flash } = props;

    const initialSearch = filters?.search || '';
    const initialSortBy = filters?.sort_by || '';
    const initialSortDirection = filters?.sort_direction || '';

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedBarangay, setSelectedBarangay] = useState<Barangay | null>(null);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [sorting, setSorting] = useState<SortingState>(
        initialSortBy && initialSortDirection ? [{ id: initialSortBy, desc: initialSortDirection === 'desc' }] : [],
    );
    const [isLoading, setIsLoading] = useState(true);

    const itemStartIndex = useMemo(() => {
        return (barangays.current_page - 1) * barangays.per_page;
    }, [barangays.current_page, barangays.per_page]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [barangays]);

    const columns = useMemo<ColumnDef<Barangay>[]>(
        () => [
            {
                id: 'index',
                header: () => <div className="text-center">#</div>,
                cell: ({ row }) => <div className="text-center">{itemStartIndex + row.index + 1}</div>,
                enableSorting: false,
            },
            {
    id: 'region.reg_name',
    accessorFn: row => row.region?.reg_name,
    header: ({ column }) => (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            disabled={isLoading}
        >
            Region
            {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
            {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
            {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.original.region?.reg_name || 'N/A'}</div>,
},
{
    id: 'province.prov_name',
    accessorFn: row => row.province?.prov_name,
    header: ({ column }) => (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            disabled={isLoading}
        >
            Province
            {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
            {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
            {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.original.province?.prov_name || 'N/A'}</div>,
},
{
    id: 'citymun.mun_name',
    accessorFn: row => row.citymun?.mun_name,
    header: ({ column }) => (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            disabled={isLoading}
        >
            City/Municipality
            {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
            {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
            {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.original.citymun?.mun_name || 'N/A'}</div>,
},
            {
                accessorKey: 'psgc_brgy',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        disabled={isLoading}
                    >
                        Barangay Code
                        {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </Button>
                ),
                cell: ({ row }) => <div className="text-center">{row.original.psgc_brgy}</div>,
            },
            {
                accessorKey: 'brgy_name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        disabled={isLoading}
                    >
                        Barangay Name
                        {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
                        {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </Button>
                ),
                cell: ({ row }) => <div className="text-center">{row.original.brgy_name}</div>,
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
        data: barangays.data || [],
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualSorting: true,
    });

    const paginationPages = useCallback(() => {
        const current = barangays.current_page;
        const last = barangays.last_page;
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
    }, [barangays.current_page, barangays.last_page]);

    const openCreateModal = () => setIsCreateModalVisible(true);
    const closeCreateModal = () => {
        setIsCreateModalVisible(false);
        router.reload({ only: ['barangays', 'filters'] });
    };
    const openEditModal = (barangay: Barangay) => {
        setSelectedBarangay(barangay);
        setIsEditModalVisible(true);
    };
    const closeEditModal = () => {
        setIsEditModalVisible(false);
        setSelectedBarangay(null);
        router.reload({ only: ['barangays', 'filters'] });
    };

    const confirmDelete = (barangay: Barangay) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert this! Deleting ${barangay.brgy_name}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                deleteBarangay(barangay.psgc_brgy);
            }
        });
    };

    const deleteBarangay = (psgc_brgy: string) => {
        router.delete(`/barangay/${psgc_brgy}`, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The barangay has been deleted.',
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
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const performSearch = useCallback(
        debounce((value) => {
            setIsLoading(true);
            const cleanedSearchQuery = value.replace(/[^a-zA-Z0-9\s]/g, '');
            if (cleanedSearchQuery.length >= 3 || cleanedSearchQuery === '') {
                router.get(
                    '/barangay',
                    {
                        search: cleanedSearchQuery,
                        sort_by: sorting.length > 0 ? sorting[0].id : '',
                        sort_direction: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
                    },
                    {
                        preserveState: true,
                        replace: true,
                        only: ['barangays', 'filters'],
                        onFinish: () => setIsLoading(false),
                    },
                );
            } else {
                setIsLoading(false);
            }
        }, 300),
        [sorting],
    );

    const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        performSearch(value);
    };

    const goToPage = (page: number | string) => {
        if (page && page !== '...') {
            setIsLoading(true);
            router.get(
                '/barangay',
                {
                    page: page,
                    search: searchQuery,
                    sort_by: sorting.length > 0 ? sorting[0].id : '',
                    sort_direction: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
                },
                {
                    only: ['barangays', 'filters'],
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
                '/barangay',
                {
                    search: searchQuery,
                    sort_by: sortBy,
                    sort_direction: sortDirection,
                },
                {
                    preserveState: true,
                    replace: true,
                    only: ['barangays', 'filters'],
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

    const breadcrumbs = [
        {
            title: 'Barangays',
            href: '/barangay',
        },
    ];

    return (
        <>
            <Head title="Barangays" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="py-2">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <Button onClick={openCreateModal} disabled={isLoading}>
                                        Create Barangay
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
                                                [...Array(barangays.per_page || 10)].map((_, index) => (
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
                                {barangays?.data && barangays.data.length > 0 && !isLoading && (
                                    <div className="mt-4 flex justify-center">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        onClick={() => goToPage(barangays.current_page - 1)}
                                                        disabled={barangays.current_page <= 1 || isLoading}
                                                    />
                                                </PaginationItem>
                                                {paginationPages().map((page, i) => (
                                                    <PaginationItem key={i}>
                                                        {page === '...' ? (
                                                            <PaginationEllipsis />
                                                        ) : (
                                                            <PaginationLink
                                                                onClick={() => goToPage(page)}
                                                                isActive={page === barangays.current_page}
                                                                disabled={isLoading}
                                                            >
                                                                {page}
                                                            </PaginationLink>
                                                        )}
                                                    </PaginationItem>
                                                ))}
                                                <PaginationItem>
                                                    <PaginationNext
                                                        onClick={() => goToPage(barangays.current_page + 1)}
                                                        disabled={barangays.current_page >= barangays.last_page || isLoading}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                                {/* Create Modal */}
                                {isCreateModalVisible && (
                                    <BarangayModal
                                        isModalVisible={isCreateModalVisible}
                                        onClose={closeCreateModal}
                                        regions={regions}
                                        provinces={provinces}
                                        citymuns={citymuns}
                                    />
                                )}
                                {/* Edit Modal */}
                                {isEditModalVisible && (
                                    <BarangayModal
                                        barangay={selectedBarangay}
                                        isModalVisible={isEditModalVisible}
                                        onClose={closeEditModal}
                                        regions={regions}
                                        provinces={provinces}
                                        citymuns={citymuns}
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