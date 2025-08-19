import VideoModal from '@/components/videos/video-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { FileWarning, Search as SearchIcon, SquarePen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function Videos() {
    const { videos, flash, filters = {} } = usePage().props;
    const [isCreateModalVisible, setIsCreateModal] = useState(false);
    const [isEditModalVisible, setIsEditModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
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
                route('videos.index'),
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
        router.reload({ only: ['videos'] });
    };

    const openEditModal = (video) => {
        setSelectedVideo(video);
        setIsEditModal(true);
    };

    const closeEditModal = () => {
        setIsEditModal(false);
        setSelectedVideo(null);
        router.reload({ only: ['videos'] });
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
                router.delete(route('videos.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Video deleted successfully.',
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
            <Head title="Videos" />
            <AppLayout>
                {/* Page wrapper (matches main-page light/dark gradient and text colors) */}
                <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-white via-slate-50 to-white text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
                    {/* Decorative radial glows (like main-page) */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-600/20" />
                        <div className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-red-500/10 blur-3xl dark:bg-red-600/15" />
                    </div>

                    {/* Header (like main-page header) */}
                    <header className="relative z-10 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-slate-800/70 dark:bg-slate-900/70">
                        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-6 text-center md:py-8">
                            <h1 className="bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-3xl font-extrabold tracking-[0.18em] text-transparent uppercase drop-shadow-sm md:text-5xl dark:from-amber-300 dark:via-yellow-200 dark:to-amber-400">
                                Videos
                            </h1>
                            <p className="text-sm font-medium tracking-wide text-slate-600 md:text-base dark:text-slate-300">
                                Manage and search videos
                            </p>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="relative z-10 mx-auto flex w-full flex-1 flex-col px-4 pt-6 pb-12 md:px-8 md:pt-10">
                        <div className="mx-auto w-full max-w-7xl">
                            {/* Card container */}
                            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-200/60 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-900/70 dark:ring-slate-800/50">
                                <div className="p-6">
                                    {/* Top bar */}
                                    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                        <h2 className="text-lg font-semibold tracking-wide text-slate-800 md:text-xl dark:text-slate-200">
                                            <Button
                                                onClick={openCreateModal}
                                                disabled={isLoading}
                                                className="rounded-xl bg-amber-400 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60"
                                            >
                                                Create Video
                                            </Button>
                                        </h2>
                                        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
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
                                                {searchQuery.length > 0 && searchQuery.length < 3 && (
                                                    <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">
                                                        Type at least 3 characters to search
                                                    </p>
                                                )}
                                                {filters?.search && (
                                                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                                        Showing results for "{filters.search}"
                                                    </p>
                                                )}
                                            </div>

                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40">
                                        <Table className="w-full">
                                            <TableHeader className="bg-slate-50 dark:bg-slate-900/60">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="w-16 text-center text-slate-600 dark:text-slate-300">#</TableHead>
                                                    <TableHead className="text-center text-slate-600 dark:text-slate-300">Title</TableHead>
                                                    <TableHead className="text-center text-slate-600 dark:text-slate-300">Description</TableHead>
                                                    <TableHead className="text-center text-slate-600 dark:text-slate-300">Video</TableHead>
                                                    <TableHead className="text-center text-slate-600 dark:text-slate-300">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {videos?.data?.length > 0 ? (
                                                    videos.data.map((video, index) => (
                                                        <TableRow key={video.id}>
                                                            <TableCell className="text-center">{index + 1}</TableCell>
                                                            <TableCell className="text-center">{video.title}</TableCell>
                                                            <TableCell className="text-center">{video.description}</TableCell>
                                                            <TableCell className="text-center">
                                                                <video width="160" controls className="mx-auto rounded">
                                                                    <source src={`/storage/${video.file_path}`} type="video/mp4" />
                                                                    Your browser does not support video playback.
                                                                </video>
                                                            </TableCell>
                                                            <TableCell className="space-x-2 text-center">
                                                                <Button size="sm" onClick={() => openEditModal(video)}>
                                                                    <SquarePen className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="sm" variant="destructive" onClick={() => confirmDelete(video.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-10">No videos found</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>

                                        </Table>

                                    </div>
                                </div>

                                {/* Create Modal */}
                                {isCreateModalVisible && <VideoModal isModalVisible={isCreateModalVisible} onClose={closeCreateModal} />}
                                {/* Edit Modal */}
                                {isEditModalVisible && (
                                    <VideoModal video={selectedVideo} isModalVisible={isEditModalVisible} onClose={closeEditModal} />
                                )}
                            </div>
                        </div>
                    </main>

                    {/* Footer (optional, mirrors main-page) */}
                    <footer className="relative z-10 mt-auto w-full border-t border-slate-200/70 bg-white/80 py-4 text-center text-xs font-medium tracking-wide text-slate-600 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-400">
                        DSWD Queuing System • Videos
                    </footer>
                </div>
            </AppLayout>
        </>
    );
}