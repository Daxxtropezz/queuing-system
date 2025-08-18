import TransactionTypeModal from '@/components/transaction-types/transactiontype-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { FileWarning, Search as SearchIcon, SquarePen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function TransactionTypes() {
    const { types, flash, filters = {} } = usePage().props;
    const [isCreateModalVisible, setIsCreateModal] = useState(false);
    const [isEditModalVisible, setIsEditModal] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                title: 'Success',
                text: flash.success,
                icon: 'success',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false,
            });
        }
        if (flash.error) {
            Swal.fire({
                title: 'Error',
                text: flash.error,
                icon: 'error',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false,
            });
        }
    }, [flash]);

    const onSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.length >= 3 || value.length === 0) {
            setIsLoading(true);
            router.get(
                route('transaction-types.index'),
                { search: value },
                {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setIsLoading(false),
                },
            );
        }
    };

    const openCreateModal = () => {
        setIsCreateModal(true);
    };

    const closeCreateModal = () => {
        setIsCreateModal(false);
        router.reload({ only: ['types'] });
    };

    const openEditModal = (type) => {
        setSelectedType(type);
        setIsEditModal(true);
    };

    const closeEditModal = () => {
        setIsEditModal(false);
        setSelectedType(null);
        router.reload({ only: ['types'] });
    };

    const confirmDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('transaction-types.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Transaction type deleted successfully.',
                            icon: 'success',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000,
                        });
                    },
                });
            }
        });
    };

    return (
        <>
            <Head title="Transaction Types" />
            <AppLayout>
                {/* Themed wrapper like main-page */}
                <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
                        <div className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-indigo-700/10 blur-3xl" />
                    </div>

                    <div className="relative py-6">
                        <div className="mx-auto max-w-7xl px-4 md:px-6">
                            <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/70 shadow-2xl backdrop-blur-sm">
                                <div className="p-6">
                                    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                        <h1 className="bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-2xl font-extrabold tracking-[0.12em] text-transparent uppercase md:text-3xl">
                                            Transaction Types
                                        </h1>
                                        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                                            <div className="relative w-full sm:w-72">
                                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                                    <SearchIcon className="h-4 w-4 text-slate-500" />
                                                </span>
                                                <Input
                                                    value={searchQuery}
                                                    placeholder="Search..."
                                                    onChange={onSearchInputChange}
                                                    maxLength={50}
                                                    className="w-full rounded-md border border-slate-700 bg-slate-900 py-2 pr-3 pl-8 text-sm text-slate-100 placeholder-slate-500 focus:border-slate-600 focus:ring-0"
                                                    disabled={isLoading}
                                                />
                                                {searchQuery.length > 0 && searchQuery.length < 3 && (
                                                    <p className="mt-1 text-xs text-rose-400">Type at least 3 characters to search</p>
                                                )}
                                                {filters?.search && (
                                                    <p className="mt-1 text-xs text-emerald-400">Showing results for "{filters.search}"</p>
                                                )}
                                            </div>
                                            <Button
                                                onClick={openCreateModal}
                                                disabled={isLoading}
                                                className="rounded-xl bg-amber-400 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60"
                                            >
                                                Create Transaction Type
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto rounded-xl border border-slate-800/70 bg-slate-900/40">
                                        <Table className="w-full">
                                            <TableHeader className="bg-slate-900/60">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="text-center text-slate-300">Name</TableHead>
                                                    <TableHead className="text-center text-slate-300">Description</TableHead>
                                                    <TableHead className="text-center text-slate-300">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {types?.data?.length > 0 ? (
                                                    types.data.map((type) => (
                                                        <TableRow key={type.id}>
                                                            <TableCell className="text-center">{type.name}</TableCell>
                                                            <TableCell className="text-center">{type.description}</TableCell>
                                                            <TableCell className="space-x-2 text-center">
                                                                <Button size="sm" onClick={() => openEditModal(type)}>
                                                                    <SquarePen className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="sm" variant="destructive" onClick={() => confirmDelete(type.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="p-10 text-center">
                                                            <div className="flex flex-col items-center">
                                                                <FileWarning className="h-12 w-12 text-gray-400" />
                                                                <p className="text-lg font-medium">No Transaction Types Found</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                {/* Create Modal */}
                                {isCreateModalVisible && <TransactionTypeModal isModalVisible={isCreateModalVisible} onClose={closeCreateModal} />}

                                {/* Edit Modal */}
                                {isEditModalVisible && (
                                    <TransactionTypeModal type={selectedType} isModalVisible={isEditModalVisible} onClose={closeEditModal} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
