import TellerModal from '@/components/tellers/teller-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { FileWarning, Search as SearchIcon, SquarePen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
// 🔑 IMPORT NEW COMPONENTS
import LoadingOverlay from '@/components/loading-overlay'; 
import Pagination from '@/components/pagination'; 

export default function Tellers() {
    // Extract pagination metadata, filters, and flash messages
    const { tellers, flash, filters = {} } = usePage().props;
    const [isCreateModalVisible, setIsCreateModal] = useState(false);
    const [isEditModalVisible, setIsEditModal] = useState(false);
    const [selectedTeller, setSelectedTeller] = useState(null);
    // Use filters.search as the initial value for the input
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

    // 1. UPDATED: Only update local state, remove automatic search
    const onSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // 2. NEW: Function to execute the search when the button is clicked or Enter is hit
    const handleSearch = (e) => {
        e.preventDefault(); // Prevents page reload if wrapped in a form
        
        const finalQuery = searchQuery.trim();
        const minLength = 3;

        // Allow search if query is empty (to reset) or meets the minimum length
        if (finalQuery.length === 0 || finalQuery.length >= minLength) {
            setIsLoading(true);
            router.get(
                route('tellers.index'),
                { 
                    search: finalQuery, 
                    // Preserve current per_page setting
                    per_page: filters.per_page 
                }, 
                {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setIsLoading(false),
                },
            );
        } else {
            Swal.fire({
                title: 'Search Too Short',
                text: `Please enter at least ${minLength} characters to search.`,
                icon: 'info',
                toast: true,
                position: 'top-end',
                timer: 4000,
                showConfirmButton: false,
            });
        }
    };
    
    // NEW: Function to handle page and per_page changes from the Pagination component
    const handlePaginationChange = (page, perPage) => {
        setIsLoading(true);
        router.get(
            route('tellers.index'),
            { ...filters, page: page, per_page: perPage },
            { 
                preserveState: true, 
                replace: true, 
                onFinish: () => setIsLoading(false) 
            }
        );
    }

    const openCreateModal = () => setIsCreateModal(true);
    const closeCreateModal = () => {
        setIsCreateModal(false);
        router.reload({ only: ['tellers'] });
    };

    const openEditModal = (teller) => {
        setSelectedTeller(teller);
        setIsEditModal(true);
    };

    const closeEditModal = () => {
        setIsEditModal(false);
        setSelectedTeller(null);
        router.reload({ only: ['tellers'] });
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
                // Set loading state on delete initiation
                setIsLoading(true);
                router.delete(route('tellers.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Teller deleted successfully.',
                            icon: 'success',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000,
                        });
                    },
                    onError: (errors) => {
                        console.error(errors);
                    },
                    // Ensure loading state is reset after any result
                    onFinish: () => setIsLoading(false),
                });
            }
        });
    };
    
    // NEW: Extract pagination metadata from the tellers prop
    const paginationProps = {
        current_page: tellers.current_page,
        last_page: tellers.last_page,
        total: tellers.total,
        per_page: tellers.per_page,
    };


    return (
        <>
            <Head title="Tellers" />
            <AppLayout>
                <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-white via-slate-50 to-white text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-600/20" />
                        <div className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-red-500/10 blur-3xl dark:bg-red-600/15" />
                    </div>

                    <header className="relative z-10 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70">
                        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-6 text-center md:py-8">
                            <h1 className="bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-3xl font-extrabold tracking-[0.18em] text-transparent uppercase drop-shadow-sm md:text-5xl dark:from-amber-300 dark:via-yellow-200 dark:to-amber-400">
                                Tellers
                            </h1>
                            <p className="text-sm font-medium tracking-wide text-slate-600 md:text-base dark:text-slate-300">
                                Manage and search tellers
                            </p>
                        </div>
                    </header>

                    <main className="relative z-10 mx-auto flex w-full flex-1 flex-col px-4 pt-6 pb-12 md:px-8 md:pt-10">
                        <div className="mx-auto w-full max-w-7xl">
                            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-200/60 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-900/70 dark:ring-slate-800/50">
                                <div className="p-6">
                                    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                        <h2 className="text-lg font-semibold tracking-wide text-slate-800 md:text-xl dark:text-slate-200">
                                            <Button
                                                onClick={openCreateModal}
                                                disabled={isLoading}
                                                className="rounded-xl bg-amber-400 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60"
                                            >
                                                Create Teller
                                            </Button>
                                        </h2>
                                        
                                        {/* 3. WRAP SEARCH INPUT AND BUTTON IN A FORM AND ADD BUTTON */}
                                        <form onSubmit={handleSearch} className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                                            <div className="relative w-full sm:w-72">
                                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                                    <SearchIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                                </span>
                                                <Input
                                                    value={searchQuery}
                                                    placeholder="Search..."
                                                    onChange={onSearchInputChange}
                                                    maxLength={50}
                                                    className="w-full rounded-md border border-slate-300 bg-white py-2 pr-3 pl-8 text-sm text-slate-900 placeholder-slate-500 focus:border-slate-400 focus:ring-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-600"
                                                    disabled={isLoading}
                                                />
                                                {searchQuery.length > 0 && searchQuery.trim().length < 3 && (
                                                    <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">
                                                        Type at least 3 characters or click search
                                                    </p>
                                                )}
                                                {filters?.search && (
                                                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                                        Showing results for **"{filters.search}"**
                                                    </p>
                                                )}
                                            </div>
                                            <Button 
                                                type="submit" 
                                                disabled={isLoading}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold disabled:opacity-60"
                                            >
                                                <SearchIcon className="h-4 w-4 mr-1" />
                                            </Button>
                                        </form>
                                    </div>

                                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40">
                                        <Table className="w-full">
                                            <TableHeader className="bg-slate-50 dark:bg-slate-900/60">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="w-16 text-center text-slate-600 dark:text-slate-300">#</TableHead>
                                                    <TableHead className="text-center text-slate-600 dark:text-slate-300">Name</TableHead>
                                                    <TableHead className="text-center text-slate-600 dark:text-slate-300">Description</TableHead>
                                                    <TableHead className="text-center text-slate-600 dark:text-slate-300">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {tellers?.data?.length > 0 ? (
                                                    tellers.data.map((teller, index) => (
                                                        <TableRow 
                                                            key={teller.id}
                                                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                                                        >
                                                            <TableCell className="text-center text-slate-700 dark:text-slate-200">
                                                                {/* Calculate actual index based on current_page and per_page */}
                                                                {(tellers.current_page - 1) * tellers.per_page + index + 1}
                                                            </TableCell>
                                                            <TableCell className="text-center text-slate-700 dark:text-slate-200">{teller.name}</TableCell>
                                                            <TableCell className="text-center text-slate-600 dark:text-slate-300">{teller.description}</TableCell>
                                                            <TableCell className="space-x-2 text-center">
                                                                <Button size="sm" onClick={() => openEditModal(teller)} disabled={isLoading}>
                                                                    <SquarePen className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="destructive" 
                                                                    onClick={() => confirmDelete(teller.id)}
                                                                    disabled={isLoading}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="p-10">
                                                            <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-400">
                                                                <FileWarning className="mb-2 h-12 w-12 text-slate-400 dark:text-slate-500" />
                                                               <p className="text-xl font-semibold">No Records Found</p>
                                                                <p className="text-muted-foreground"> "No results match your filters. Try adjusting your search criteria."</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                        
                                        {/* 4. PAGINATION COMPONENT */}
                                        <Pagination
                                            pagination={paginationProps}
                                            filters={filters}
                                            baseUrl={route('tellers.index')}
                                            isLoading={isLoading}
                                            onPageChange={(page) => handlePaginationChange(page, filters.per_page)}
                                            onPerPageChange={(perPage) => handlePaginationChange(tellers.current_page, perPage)}
                                        />
                                    </div>
                                </div>

                                {isCreateModalVisible && <TellerModal isModalVisible={isCreateModalVisible} onClose={closeCreateModal} />}
                                {isEditModalVisible && (
                                    <TellerModal teller={selectedTeller} isModalVisible={isEditModalVisible} onClose={closeEditModal} />
                                )}
                            </div>
                        </div>
                    </main>

                    <footer className="relative z-10 mt-auto w-full border-t border-slate-200/70 bg-white/80 py-4 text-center text-xs font-medium tracking-wide text-slate-600 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-400">
                        DSWD Queuing System • Tellers
                    </footer>
                </div>
                {/* 5. LOADING OVERLAY */}
                <LoadingOverlay 
                    visible={isLoading} 
                    title="Please wait..." 
                    message="Fetching data from the server."
                />
            </AppLayout>
        </>
    );
}