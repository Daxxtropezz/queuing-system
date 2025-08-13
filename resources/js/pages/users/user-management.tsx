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
import UserRoleModal from '@/components/user-role-modal';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { debounce } from 'lodash';
import { FileWarning, Search as SearchIcon } from 'lucide-react'; // Import SearchIcon for clarity
import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    is_enabled: 0 | 1;
}

interface UsersProps {
    users: {
        data: User[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        path: string;
    };
    roles: string[];
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/users',
    },
];

export default function UserIndex() {
    const { users, filters } = usePage<UsersProps>().props;
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isLoading, setIsLoading] = useState(true); // New loading state

    // Simulate loading for demonstration purposes
    useEffect(() => {
        // In a real application, you would set isLoading based on your data fetching lifecycle.
        // For example, when an Inertia request starts, set true, and on success/error, set false.
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000); // Simulate 1 second loading time

        return () => clearTimeout(timer);
    }, [users]); // Re-run this effect when users data changes (e.g., on pagination/search)

    const handleSearch = useMemo(
        () =>
            debounce((value: string) => {
                setIsLoading(true); // Set loading to true when search starts
                if (value === '') {
                    router.get(
                        users.path,
                        {},
                        {
                            preserveState: true,
                            replace: true,
                            only: ['users'],
                            onFinish: () => setIsLoading(false), // Set loading to false on finish
                        },
                    );
                    return;
                }

                if (value.length >= 3) {
                    router.get(
                        users.path,
                        { search: value.trim() },
                        {
                            preserveState: true,
                            replace: true,
                            only: ['users'],
                            onFinish: () => setIsLoading(false), // Set loading to false on finish
                        },
                    );
                } else {
                    setIsLoading(false); // If less than 3 chars, stop loading immediately
                }
            }, 500),
        [users.path],
    );

    useEffect(() => {
        setSearchQuery(filters.search || '');
    }, [filters.search]);

    const preventSpecialChars = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (/[^a-zA-Z0-9\s@._-]/.test(event.key)) {
            event.preventDefault();
            return false;
        }
    };

    const paginationPages = useMemo(() => {
        const current = users.current_page;
        const last = users.last_page;
        const range = 2;
        const pages: (number | string)[] = [];

        for (let i = 1; i <= last; i++) {
            if (i === 1 || i === last || (i >= current - range && i <= current + range)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    }, [users.current_page, users.last_page]);

    const toggleUserStatus = (user: User) => {
        Swal.fire({
            title: `Are you sure you want to ${user.is_enabled ? 'deactivate' : 'activate'} this user?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: user.is_enabled ? 'Deactivate' : 'Activate',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline-blue',
                cancelButton:
                    'ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline-gray',
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(
                    `/users/${user.id}/toggle-status`,
                    { is_enabled: !user.is_enabled },
                    {
                        onSuccess: () => {
                            Swal.fire({
                                icon: 'success',
                                title: `Success`,
                                text: `User has been ${user.is_enabled ? 'deactivated' : 'activated'}.`,
                                timer: 2000,
                                showConfirmButton: false,
                            });
                        },
                        onError: () => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Something went wrong. Please try again.',
                            });
                        },
                    },
                );
            }
        });
    };

    const goToPage = (page: number) => {
        setIsLoading(true); // Set loading to true when changing page
        const params: { page: number; search?: string } = { page };
        if (searchQuery) {
            params.search = searchQuery;
        }
        router.get(users.path, params, {
            preserveState: true,
            onFinish: () => setIsLoading(false), // Set loading to false on finish
        });
    };

    const tableHeader = ['Item', 'Name', 'Email', 'Role', 'Status', 'Actions'];
    const itemStartIndex = (users.current_page - 1) * users.per_page;

    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedUserRole, setSelectedUserRole] = useState('');

    const openRoleModal = (user: User) => {
        setSelectedUserId(user.id);
        setSelectedUserRole(user.role);
        setRoleModalOpen(true);
    };

    const handleRoleChange = (userId: number, newRole: string) => {
        router.put(
            `/users/${userId}/change-role`,
            { role: newRole },
            {
                onSuccess: () => {
                    Swal.fire('Success', 'Role updated successfully.', 'success');
                    setRoleModalOpen(false);
                },
                onError: () => {
                    Swal.fire('Error', 'Something went wrong.', 'error');
                },
            },
        );
    };

    return (
        <>
            <Head title="User Management" />

            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="py-2">
                    <div className="mx-4 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="container mx-auto px-4 sm:px-8">
                            <div className="py-8">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="relative block">
                                        <span className="absolute inset-y-0 left-0 flex h-full items-center pl-2">
                                            <SearchIcon className="h-4 w-4 fill-current text-gray-500" /> {/* Using Lucide icon */}
                                        </span>
                                        <div className="relative block">
                                            <Input
                                                value={searchQuery}
                                                placeholder="Search User"
                                                onKeyDown={preventSpecialChars}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    handleSearch(e.target.value);
                                                }}
                                                maxLength={50}
                                                className="w-full py-2 pr-6 pl-8 text-sm"
                                                disabled={isLoading} // Disable search input when loading
                                            />
                                            {searchQuery.length > 0 && searchQuery.length < 3 && (
                                                <p className="mt-1 text-xs text-red-500">Type at least 3 characters to search</p>
                                            )}
                                            {filters.search && <p className="mt-1 text-xs text-green-500">Showing results for "{filters.search}"</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="-mx-4 overflow-x-auto px-4 py-4 sm:-mx-8 sm:px-8">
                                    <div className="overflow-x-auto rounded-lg">
                                        <Table className="w-full">
                                            <TableHeader>
                                                <TableRow>
                                                    {tableHeader.map((header, index) => (
                                                        <TableHead
                                                            key={index}
                                                            className="px-5 py-3 text-center text-xs font-semibold tracking-wider uppercase"
                                                        >
                                                            {header}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isLoading ? (
                                                    // Skeleton rows while loading
                                                    [...Array(users.per_page || 10)].map((_, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <Skeleton className="mx-auto h-4 w-6" />
                                                            </TableCell>
                                                            <TableCell className="p-3">
                                                                <Skeleton className="mx-auto h-4 w-32" />
                                                            </TableCell>
                                                            <TableCell className="p-3">
                                                                <Skeleton className="mx-auto h-4 w-48" />
                                                            </TableCell>
                                                            <TableCell className="p-3">
                                                                <Skeleton className="mx-auto h-4 w-24" />
                                                            </TableCell>
                                                            <TableCell className="p-2 text-center">
                                                                <Skeleton className="mx-auto h-4 w-20 rounded-full" />
                                                            </TableCell>
                                                            <TableCell className="p-3">
                                                                <Skeleton className="mx-auto h-8 w-24" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : users.data.length === 0 ? (
                                                    // No records found
                                                    <TableRow>
                                                        <TableCell colSpan={tableHeader.length} className="p-10 text-center">
                                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                                <FileWarning className="h-12 w-12 text-gray-400" />
                                                                <p className="text-xl font-semibold">No Records Found</p>
                                                                <p className="text-md text-gray-500">It looks like there are no entries here yet.</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    // Actual user data rows
                                                    users.data.map((user, index) => (
                                                        <TableRow key={user.id} className="text-center">
                                                            <TableCell>{itemStartIndex + index + 1}</TableCell>
                                                            <TableCell className="p-3">
                                                                {user.first_name} {user.last_name}
                                                            </TableCell>
                                                            <TableCell className="p-3">{user.email}</TableCell>
                                                            <TableCell className="p-3">{user.role}</TableCell>
                                                            <TableCell className="p-2 text-center">
                                                                <span
                                                                    onClick={() => toggleUserStatus(user)}
                                                                    className={[
                                                                        'inline-flex cursor-pointer items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-tight uppercase transition-colors hover:brightness-90',
                                                                        user.is_enabled === 1
                                                                            ? 'border border-emerald-200 bg-emerald-100 text-emerald-700'
                                                                            : 'border border-rose-200 bg-rose-100 text-rose-700',
                                                                    ].join(' ')}
                                                                    title="Click to toggle status"
                                                                >
                                                                    {user.is_enabled === 1 ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="p-3">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openRoleModal(user)}
                                                                    className="text-xs"
                                                                >
                                                                    Change Role
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    {/* Conditional Rendering for Pagination */}
                                    {users.last_page > 1 &&
                                        !isLoading && ( // Only show pagination if not loading and more than one page
                                            <div className="mt-4 flex justify-center">
                                                <Pagination>
                                                    <PaginationContent>
                                                        <PaginationItem>
                                                            <PaginationPrevious
                                                                onClick={() => goToPage(users.current_page - 1)}
                                                                disabled={users.current_page <= 1 || isLoading}
                                                            />
                                                        </PaginationItem>
                                                        {paginationPages.map((page, i) => (
                                                            <PaginationItem key={i}>
                                                                {page === '...' ? (
                                                                    <PaginationEllipsis />
                                                                ) : (
                                                                    <PaginationLink
                                                                        onClick={() => goToPage(page as number)}
                                                                        isActive={page === users.current_page}
                                                                    >
                                                                        {page}
                                                                    </PaginationLink>
                                                                )}
                                                            </PaginationItem>
                                                        ))}
                                                        <PaginationItem>
                                                            <PaginationNext
                                                                onClick={() => goToPage(users.current_page + 1)}
                                                                disabled={users.current_page >= users.last_page || isLoading}
                                                            />
                                                        </PaginationItem>
                                                    </PaginationContent>
                                                </Pagination>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <UserRoleModal
                    open={roleModalOpen}
                    onClose={() => setRoleModalOpen(false)}
                    onSubmit={handleRoleChange}
                    userId={selectedUserId}
                    currentRole={selectedUserRole}
                    roles={usePage<UsersProps>().props.roles}
                />
            </AppLayout>
        </>
    );
}
