import Swal from 'sweetalert2';
import { checkVideoExists } from '../utils/api';
import type { VideoRecord } from '../types/types';

const DEFAULT_TEXT = 'no video found, the video may have been deleted from the path. please check the path or upload a video again and delete this';

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
                    title: 'No Video Found',
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
