import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';

type VideoType = { id: number; title: string; description?: string | null; file_path?: string };

type ModalProps = {
    isModalVisible: boolean;
    onClose: (open: boolean) => void;
    video?: VideoType | null;
};

export default function VideoModal({ isModalVisible, onClose, video }: ModalProps) {
    const isEditMode = !!video;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: video?.title || '',
        description: video?.description || '',
        file_path: null as File | null,
    });

    useEffect(() => {
        if (isEditMode) {
            setData({ title: video!.title, description: video!.description || '', file_path: null });
        } else {
            reset();
        }
    }, [isModalVisible, video]);

    const isFormInvalid = useMemo(() => {
        const hasTitle = data.title.trim().length > 0;
        if (!isEditMode) return !hasTitle || !data.file_path;
        return !hasTitle;
    }, [data.title, data.file_path, isEditMode]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isFormInvalid) return;

        if (isEditMode) {
            // Use PUT with FormData for file support
            put(route('videos.update', video!.id), {
                forceFormData: true,
                onSuccess: () => {
                    Swal.fire({ title: 'Updated!', text: 'Video updated successfully.', icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                    onClose(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    Swal.fire({ title: 'Error!', text: 'An error occurred while updating the video.', icon: 'error', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                },
            });
        } else {
            post(route('videos.store'), {
                forceFormData: true,
                onSuccess: () => {
                    Swal.fire({ title: 'Uploaded!', text: 'Video uploaded successfully.', icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                    onClose(false);
                },
            });
        }
    };

    return (
        <Dialog open={isModalVisible} onOpenChange={onClose}>
            <DialogContent className="max-w-lg border border-slate-200 bg-white/90 ring-1 ring-slate-200/60 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800/70 dark:bg-slate-900/80 dark:ring-slate-800/50">
                <DialogHeader>
                    <DialogTitle className="text-slate-800 dark:text-slate-100">{isEditMode ? 'Edit Video' : 'Upload Video'}</DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        {isEditMode ? 'Update video details. Leave the file field blank to keep the current file.' : 'Upload a new video file. Fields marked with (*) are required.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <Box className="grid gap-4 py-4">
                        <Box className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-slate-700 dark:text-slate-300">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} className="col-span-3" />
                            {errors.title && <p className="col-span-4 text-red-500 text-sm">{errors.title}</p>}
                        </Box>
                        <Box className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">Description</Label>
                            <Input id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} className="col-span-3" />
                            {errors.description && <p className="col-span-4 text-red-500 text-sm">{errors.description}</p>}
                        </Box>
                        <Box className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file_path" className="text-slate-700 dark:text-slate-300">
                                File {!isEditMode && <span className="text-red-500">*</span>}
                            </Label>
                            <Input id="file_path" type="file" accept="video/*" onChange={(e) => setData('file_path', e.target.files?.[0] ?? null)} className="col-span-3" />
                            {errors.file_path && <p className="col-span-4 text-red-500 text-sm">{errors.file_path}</p>}
                        </Box>
                    </Box>
                    <DialogFooter className="border-t border-slate-200 pt-4 dark:border-slate-800">
                        <Button type="submit" disabled={processing || isFormInvalid} className="focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:outline-none">
                            {isEditMode ? 'Update' : 'Upload'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => onClose(false)} className="focus-visible:ring-2 focus-visible:ring-slate-500/30 focus-visible:outline-none">
                            Cancel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
