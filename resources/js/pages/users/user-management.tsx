import UserRoleModal from '@/components/user-role-modal';
import LoadingOverlay from '@/components/loading-overlay';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { FileWarning, Search as SearchIcon } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { debounce } from 'lodash';

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
        per_page?: number;
    };
}

export default function UserIndex() {
    const { users, filters, roles } = usePage<UsersProps>().props;
    const authUser = usePage().props.auth.user as User;
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedUserRole, setSelectedUserRole] = useState('');

    // 🟡 Debounced Search
    const handleSearch = useMemo(
        () =>
            debounce((value: string) => {
                const finalQuery = value.trim();
                if (finalQuery.length === 0 || finalQuery.length >= 3) {
                    setIsLoading(true);
                    router.get(
                        users.path,
                        { search: finalQuery, per_page: filters.per_page },
                        {
                            preserveState: true,
                            replace: true,
                            only: ['users'],
                            onFinish: () => setIsLoading(false),
                        },
                    );
                } else {
                    Swal.fire({
                        title: 'Search Too Short',
                        text: 'Type at least 3 characters or clear to reset.',
                        icon: 'info',
                        toast: true,
                        position: 'top-end',
                        timer: 2500,
                        showConfirmButton: false,
                    });
                }
            }, 600),
        [users.path],
    );

    // 🟢 Pagination Handling
    const handlePaginationChange = (page: number, perPage: number) => {
        setIsLoading(true);
        router.get(
            users.path,
            { page, per_page: perPage, search: filters.search },
            {
                preserveState: true,
                replace: true,
                only: ['users'],
                onFinish: () => setIsLoading(false),
            },
        );
    };

    // 🟣 Toggle Status
    const toggleUserStatus = (user: User) => {
        Swal.fire({
            title: `Are you sure you want to ${user.is_enabled ? 'deactivate' : 'activate'} this user?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: user.is_enabled ? 'Deactivate' : 'Activate',
        }).then((result) => {
            if (result.isConfirmed) {
                setIsLoading(true);
                router.put(
                    `/users/${user.id}/toggle-status`,
                    { is_enabled: !user.is_enabled },
                    {
                        onSuccess: () => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: `User has been ${user.is_enabled ? 'deactivated' : 'activated'}.`,
                                toast: true,
                                position: 'top-end',
                                timer: 2000,
                                showConfirmButton: false,
                            });
                        },
                        onFinish: () => setIsLoading(false),
                    },
                );
            }
        });
    };

    // 🟢 Modal Handlers
    const openRoleModal = (user: User) => {
        setSelectedUserId(user.id);
        setSelectedUserRole(user.role);
        setRoleModalOpen(true);
    };

    const handleRoleChange = (userId: number, newRole: string) => {
        setIsLoading(true);
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
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const itemStartIndex = (users.current_page - 1) * users.per_page;
    const paginationProps = {
        current_page: users.current_page,
        last_page: users.last_page,
        total: users.total,
        per_page: users.per_page,
    };

    return (
        <>
            <Head title="User Management" />
            <AppLayout>
                <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-white via-slate-50 to-white text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
                    {/* Background */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-600/20" />
                        <div className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-600/15" />
                    </div>

                    {/* Header */}
                    <header className="relative z-10 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70">
                        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-6 text-center md:py-8">
                            <h1 className="bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-3xl font-extrabold tracking-[0.18em] text-transparent uppercase drop-shadow-sm md:text-5xl dark:from-amber-300 dark:via-yellow-200 dark:to-amber-400">
                                User Management
                            </h1>
                            <p className="text-sm font-medium tracking-wide text-slate-600 md:text-base dark:text-slate-300">
                                Manage users, roles, and account status
                            </p>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="relative z-10 mx-auto flex w-full flex-1 flex-col px-4 pt-6 pb-12 md:px-8 md:pt-10">
                        <div className="mx-auto w-full max-w-7xl">
                            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-200/60 dark:border-slate-800/70 dark:bg-slate-900/70 dark:ring-slate-800/50">
                                <div className="p-6">
                                    {/* Search Bar */}
                                    <div className="mb-6 flex justify-end">
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSearch(searchQuery);
                                            }}
                                            className="flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end"
                                        >
                                            <div className="relative w-full sm:w-72">
                                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                                    <SearchIcon className="h-4 w-4 text-slate-400" />
                                                </span>
                                                <Input
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search users..."
                                                    className="w-full rounded-md border border-slate-300 bg-white py-2 pr-3 pl-8 text-sm text-slate-900 placeholder-slate-500 focus:border-slate-400 focus:ring-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                                    disabled={isLoading}
                                                />
                                                {searchQuery.length > 0 && searchQuery.length < 3 && (
                                                    <p className="mt-1 text-xs text-rose-500">Type at least 3 characters</p>
                                                )}
                                                {filters?.search && (
                                                    <p className="mt-1 text-xs text-emerald-600">
                                                        Showing results for "{filters.search}"
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                type="submit"
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold disabled:opacity-60"
                                                disabled={isLoading}
                                            >
                                                <SearchIcon className="h-4 w-4 mr-1" />
                                            </Button>
                                        </form>
                                    </div>


                                    {/* Table */}
                                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40">
                                        <Table className="w-full">
                                            <TableHeader className="bg-slate-50 dark:bg-slate-900/60">
                                                <TableRow>
                                                    <TableHead className="text-center w-16">#</TableHead>
                                                    <TableHead className="text-center">Name</TableHead>
                                                    <TableHead className="text-center">Email</TableHead>
                                                    <TableHead className="text-center">Role</TableHead>
                                                    <TableHead className="text-center">Status</TableHead>
                                                    <TableHead className="text-center">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {users.data.length > 0 ? (
                                                    users.data.map((user, index) => (
                                                        <TableRow
                                                            key={user.id}
                                                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                                                        >
                                                            <TableCell className="text-center">
                                                                {itemStartIndex + index + 1}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {user.first_name} {user.last_name}
                                                            </TableCell>
                                                            <TableCell className="text-center">{user.email}</TableCell>
                                                            <TableCell className="text-center">{user.role}</TableCell>
                                                            <TableCell className="text-center">
                                                                <span
                                                                    onClick={() => toggleUserStatus(user)}
                                                                    className={[
                                                                        'inline-flex cursor-pointer items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase',
                                                                        user.is_enabled
                                                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                                                            : 'bg-rose-100 text-rose-700 border border-rose-300',
                                                                    ].join(' ')}
                                                                >
                                                                    {user.is_enabled ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {authUser.id !== user.id && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => openRoleModal(user)}
                                                                        className="text-xs"
                                                                        disabled={isLoading}
                                                                    >
                                                                        Change Role
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="p-10 text-center">
                                                            <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50">
                                                                <FileWarning className="h-12 w-12 text-muted-foreground" />
                                                                <p className="text-xl font-semibold">No Records Found</p>
                                                                <p className="text-muted-foreground">
                                                                    No users found. Try adjusting your search criteria.
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>

                                        {/* Pagination */}
                                        <Pagination
                                            pagination={paginationProps}
                                            filters={filters}
                                            baseUrl={users.path}
                                            isLoading={isLoading}
                                            onPageChange={(page) => handlePaginationChange(page, filters.per_page ?? 10)}
                                            onPerPageChange={(perPage) =>
                                                handlePaginationChange(users.current_page, perPage)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="relative z-10 mt-auto w-full border-t border-slate-200/70 bg-white/80 py-4 text-center text-xs font-medium tracking-wide text-slate-600 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-400">
                        DSWD Queuing System • User Management
                    </footer>
                </div>

                {/* Role Modal */}
                <UserRoleModal
                    open={roleModalOpen}
                    onClose={() => setRoleModalOpen(false)}
                    onSubmit={handleRoleChange}
                    userId={selectedUserId}
                    currentRole={selectedUserRole}
                    roles={roles}
                />

                {/* Loading Overlay */}
                <LoadingOverlay visible={isLoading} title="Please wait..." message="Processing your request..." />
            </AppLayout>
        </>
    );
}
