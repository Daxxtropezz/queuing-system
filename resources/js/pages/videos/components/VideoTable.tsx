import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Box from '@/components/ui/box';
import { FileWarning, SquarePen, Trash2 } from 'lucide-react';
import type { Paginated, VideoRecord } from '@/pages/videos/types/types';

interface Props {
    videos: Paginated<VideoRecord>;
    isLoading: boolean;
    openEditModal: (video: VideoRecord) => void;
    confirmDelete: (id: number) => void;
    openPreviewModal: (video: VideoRecord) => void;
}

export default function VideoTable({ videos, isLoading, openEditModal, confirmDelete, openPreviewModal }: Props) {
    return (
        <Box className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40">
            <Table className="w-full">
                <TableHeader className="bg-slate-50 dark:bg-slate-900/60">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-16 text-center text-slate-600 dark:text-slate-300">{`#`}</TableHead>
                        <TableHead className="text-center text-slate-600 dark:text-slate-300">{`Title`}</TableHead>
                        <TableHead className="text-center text-slate-600 dark:text-slate-300">{`Description`}</TableHead>
                        <TableHead className="text-center text-slate-600 dark:text-slate-300">{`Video`}</TableHead>
                        <TableHead className="text-center text-slate-600 dark:text-slate-300">{`Actions`}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {videos?.data?.length > 0 ? (
                        videos.data.map((video: VideoRecord, index: number) => (
                            <TableRow key={video.id}>
                                <TableCell className="text-center">{(videos.current_page - 1) * videos.per_page + index + 1}</TableCell>
                                <TableCell className="text-center">{video.title}</TableCell>
                                <TableCell className="text-center">{video.description}</TableCell>
                                <TableCell className="text-center">
                                    <span onClick={() => openPreviewModal(video)} className="cursor-pointer text-blue-600 hover:underline dark:text-blue-400">{`View`}</span>
                                </TableCell>
                                <TableCell className="space-x-2 text-center">
                                    <Button size="sm" onClick={() => openEditModal(video)} disabled={isLoading}>
                                        <SquarePen className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => confirmDelete(video.id)} disabled={isLoading}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="p-10">
                                <Box className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-400">
                                    <FileWarning className="mb-2 h-12 w-12 text-slate-400 dark:text-slate-500" />
                                    <p className="text-xl font-semibold">{`No Records Found`}</p>
                                    <p className="text-muted-foreground">{`No results match your filters. Try adjusting your search criteria.`}</p>
                                </Box>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Box>
    );
}
