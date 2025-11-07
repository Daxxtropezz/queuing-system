import VideoModal from '@/pages/videos/components/VideoModal';
import VideoPreviewModal from '@/pages/videos/components/VideoPreviewModal';
import VideoSearchForm from '@/pages/videos/components/VideoSearchForm';
import VideoTable from '@/pages/videos/components/VideoTable';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import LoadingOverlay from '@/components/loading-overlay';
import Pagination from '@/components/pagination';
import Box from '@/components/ui/box';
import useVideoPreview from '@/pages/videos/hooks/useVideoPreview';
import type { Paginated, VideoRecord, VideoFilters } from '@/pages/videos/types/types';

interface PageProps {
    videos: Paginated<VideoRecord>;
    flash?: { success?: string; error?: string };
    filters?: VideoFilters;
    [key: string]: any;
}

export default function Videos() {
    const { videos, flash, filters = {} as PageProps['filters'] } = usePage<PageProps>().props;
    const [isCreateModalVisible, setIsCreateModal] = useState(false);
    const [isEditModalVisible, setIsEditModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({ title: 'Success', text: flash.success, icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        }
        if (flash?.error) {
            Swal.fire({ title: 'Error', text: flash.error, icon: 'error', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        }
    }, [flash]);

    const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const finalQuery = searchQuery.trim();
        const minLength = 3;
        if (finalQuery.length === 0 || finalQuery.length >= minLength) {
            setIsLoading(true);
            router.get(
                route('videos.index'),
                { search: finalQuery, per_page: filters?.per_page },
                { preserveState: true, replace: true, only: ['videos'], onFinish: () => setIsLoading(false) },
            );
        }
    };

    const handlePaginationChange = (page: number, perPage: number | undefined) => {
        setIsLoading(true);
        router.get(
            route('videos.index'),
            { ...filters, page, per_page: perPage },
            { preserveState: true, replace: true, only: ['videos'], onFinish: () => setIsLoading(false) }
        );
    };

    const openCreateModal = () => setIsCreateModal(true);
    const closeCreateModal = () => { setIsCreateModal(false); router.reload({ only: ['videos'] }); };
    const openEditModal = (video: VideoRecord) => { setSelectedVideo(video); setIsEditModal(true); };
    const closeEditModal = () => { setIsEditModal(false); setSelectedVideo(null); router.reload({ only: ['videos'] }); };

    const confirmDelete = (id: number) => {
        Swal.fire({ title: 'Are you sure?', text: 'This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' }).then((result) => {
            if (result.isConfirmed) {
                setIsLoading(true);
                router.delete(route('videos.destroy', id), {
                    onSuccess: () => Swal.fire({ title: 'Deleted!', text: 'Video deleted successfully.', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }),
                    onError: (errors) => { console.error(errors); Swal.fire({ title: 'Error!', text: 'An error occurred while deleting the video.', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }); },
                    onFinish: () => setIsLoading(false),
                });
            }
        });
    };

    const { openPreviewModal } = useVideoPreview({
        onOpen: (video) => { setSelectedVideo(video); setIsPreviewModalVisible(true); },
        setGlobalLoading: setIsLoading,
    });

    const paginationProps = { current_page: videos.current_page, last_page: videos.last_page, total: videos.total, per_page: videos.per_page };

    return (
        <>
            <Head title="Videos" />
            {/* Use persistent layout to avoid re-mounting the app shell on each navigation */}
            <Box className="relative flex min-h-screen flex-col bg-gradient-to-br from-white via-slate-50 to-white text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
                <Box className="pointer-events-none absolute inset-0 overflow-hidden">
                    <Box className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-600/20" />
                    <Box className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-red-500/10 blur-3xl dark:bg-red-600/15" />
                </Box>

                <header className="relative z-10 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-slate-800/70 dark:bg-slate-900/70">
                    <Box className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-6 text-center md:py-8">
                        <h1 className="bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-3xl font-extrabold tracking-[0.18em] text-transparent uppercase drop-shadow-sm md:text-5xl dark:from-amber-300 dark:via-yellow-200 dark:to-amber-400">
                            {"Videos"}
                        </h1>
                        <p className="text-sm font-medium tracking-wide text-slate-600 md:text-base dark:text-slate-300">
                            {"Manage and search videos"}
                        </p>
                    </Box>
                </header>

                <main className="relative z-10 mx-auto flex w-full flex-1 flex-col px-4 pt-6 pb-12 md:px-8 md:pt-10">
                    <Box className="mx-auto w-full max-w-7xl">
                        <Box className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-200/60 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-900/70 dark:ring-slate-800/50">
                            <Box className="p-6">
                                <Box className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                    <h2 className="text-lg font-semibold tracking-wide text-slate-800 md:text-xl dark:text-slate-200">
                                        <Button
                                            onClick={openCreateModal}
                                            disabled={isLoading}
                                            className="rounded-xl bg-amber-400 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60"
                                        >
                                            {"Create Video"}
                                        </Button>
                                    </h2>
                                    {/* 3. WRAP SEARCH INPUT AND BUTTON IN A FORM AND ADD BUTTON */}
                                    <VideoSearchForm
                                        searchQuery={searchQuery}
                                        onSearchInputChange={onSearchInputChange}
                                        handleSearch={handleSearch}
                                        isLoading={isLoading}
                                        filters={filters}
                                    />
                                </Box>

                                <Box className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40">
                                    <VideoTable
                                        videos={videos}
                                        openPreviewModal={openPreviewModal}
                                        openEditModal={openEditModal}
                                        confirmDelete={confirmDelete}
                                        isLoading={isLoading}
                                    />

                                    {/* 4. PAGINATION COMPONENT */}
                                    {videos.total > 0 && (
                                        <Pagination
                                            pagination={paginationProps}
                                            filters={filters as Record<string, any>}
                                            baseUrl={route('videos.index')}
                                            isLoading={isLoading}
                                            onPageChange={(page) => handlePaginationChange(page, filters?.per_page)}
                                            onPerPageChange={(perPage) => handlePaginationChange(videos.current_page, perPage)}
                                        />
                                    )}
                                </Box>
                            </Box>

                            {isCreateModalVisible && <VideoModal isModalVisible={isCreateModalVisible} onClose={closeCreateModal} />}

                            {isEditModalVisible && (
                                <VideoModal
                                    video={selectedVideo}
                                    isModalVisible={isEditModalVisible}
                                    onClose={closeEditModal}
                                />
                            )}

                        </Box>
                    </Box>
                </main>
                {/* Preview Modal */}
                {isPreviewModalVisible && (
                    <VideoPreviewModal
                        video={selectedVideo}
                        isModalVisible={isPreviewModalVisible}
                        onClose={() => { setIsPreviewModalVisible(false); setSelectedVideo(null); }}
                    />
                )}
                {/* Footer (optional, mirrors main-page) */}
                <footer className="relative z-10 mt-auto w-full border-t border-slate-200/70 bg-white/80 py-4 text-center text-xs font-medium tracking-wide text-slate-600 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-400">
                    {"DSWD Queuing System • Videos"}
                </footer>
            </Box>
            <LoadingOverlay
                visible={isLoading}
                title="Processing Request..."
                message="Please wait while the data is being updated."
            />
        </>
    );
}

// Persist the app shell (sidebar, header, etc.) across page navigations for faster transitions.
// This avoids unmounting/mounting the layout on every visit.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Videos as any).layout = (page: any) => <AppLayout>{page}</AppLayout>;