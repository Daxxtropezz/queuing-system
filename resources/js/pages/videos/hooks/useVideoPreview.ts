import Swal from 'sweetalert2';
import { checkVideoExists } from '../utils/api';
import type { VideoRecord } from '../types/types';

const DEFAULT_TEXT = 'It may have been removed or the path is invalid. Please verify the path or re-upload the video.';

type Options = {
    onOpen: (video: VideoRecord) => void;
    setGlobalLoading?: (v: boolean) => void;
    onNotFoundText?: string;
};

export default function useVideoPreview({ onOpen, setGlobalLoading, onNotFoundText }: Options) {
    const openPreviewModal = async (video: VideoRecord) => {
        setGlobalLoading?.(true);
        try {
            const { exists } = await checkVideoExists(video.id);
            if (exists) {
                onOpen(video);
            } else {
                Swal.fire({
                    title: 'Video not found.',
                    text: onNotFoundText ?? DEFAULT_TEXT,
                    icon: 'warning',
                    toast: true,
                    position: 'top-end',
                    timer: 4000,
                    showConfirmButton: false,
                });
            }
        } finally {
            setGlobalLoading?.(false);
        }
    };

    return { openPreviewModal };
}
