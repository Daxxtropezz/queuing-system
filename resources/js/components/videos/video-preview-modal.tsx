import { useEffect, useRef } from 'react';

export default function VideoPreviewModal({ video, isModalVisible, onClose }) {
    if (!isModalVisible || !video) return null;

    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        if (!videoRef.current) return;
        try {
            videoRef.current.muted = false;
            videoRef.current.volume = 0.6; // sensible default
            // try autoplay
            videoRef.current.play().catch(() => {
                /* autoplay blocked; leave unmuted & ready */
            });
        } catch {}
    }, [video]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            {/* Modal Box */}
            <div className="relative flex h-[90vh] w-[90%] max-w-6xl flex-col rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
                {/* Close button */}
                <button onClick={onClose} className="absolute top-6 right-6 text-2xl text-white hover:text-rose-400">
                    ✕
                </button>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">{video.title}</h3>

                {/* Video */}
                <div className="flex flex-1 items-center justify-center">
                    <video
                        ref={videoRef}
                        autoPlay
                        // remove visible controls to disable user play/pause/seek UI
                        playsInline
                        controlsList="nodownload noremoteplayback"
                        disablePictureInPicture
                        onContextMenu={(e) => e.preventDefault()}
                        className="max-h-full max-w-full rounded-lg object-contain"
                    >
                        <source src={`/storage/${video.file_path}`} type="video/mp4" />
                        Your browser does not support video playback.
                    </video>
                </div>

                {/* Description */}
                {video.description && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{video.description}</p>}
            </div>
        </div>
    );
}
