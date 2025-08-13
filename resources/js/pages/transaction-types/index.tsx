import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileWarning, SquarePen, Trash2, Search as SearchIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import TransactionTypeModal from '@/components/transaction-types/transactiontype-modal';
import { Input } from '@/components/ui/input';

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
                }
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
            text: "This action cannot be undone.",
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
                 <div className="py-2">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <Button onClick={openCreateModal} disabled={isLoading}>
                                        {' '}
                                        {/* Disable button when loading */}
                                        Create Transaction Type
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
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">Name</TableHead>
                                    <TableHead className="text-center">Description</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {types?.data?.length > 0 ? (
                                    types.data.map((type) => (
                                        <TableRow key={type.id}>
                                            <TableCell className="text-center">{type.name}</TableCell>
                                            <TableCell className="text-center">{type.description}</TableCell>
                                            <TableCell className="text-center space-x-2">
                                                <Button size="sm" onClick={() => openEditModal(type)}>
                                                    <SquarePen className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => confirmDelete(type.id)}
                                                >
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
                {isCreateModalVisible && (
                    <TransactionTypeModal isModalVisible={isCreateModalVisible} onClose={closeCreateModal} />
                )}

                {/* Edit Modal */}
                {isEditModalVisible && (
                    <TransactionTypeModal
                        type={selectedType}
                        isModalVisible={isEditModalVisible}
                        onClose={closeEditModal}
                    />
                )}
                </div>
                </div>
                </div>
            </AppLayout>
        </>
    );
}
