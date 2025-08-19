import { useEffect } from 'react';

export default function VideoPreviewModal({ video, isModalVisible, onClose }) {
    if (!isModalVisible || !video) return null;

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            {/* Modal Box */}
            <div className="relative w-[90%] max-w-6xl h-[90vh] flex flex-col rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
                
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 text-white text-2xl hover:text-rose-400"
                >
                    ✕
                </button>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {video.title}
                </h3>

                {/* Video */}
                <div className="flex-1 flex items-center justify-center">
                    <video
                        autoPlay
                        controls
                        className="max-h-full max-w-full rounded-lg object-contain"
                    >
                        <source src={`/storage/${video.file_path}`} type="video/mp4" />
                        Your browser does not support video playback.
                    </video>
                </div>

                {/* Description */}
                {video.description && (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                        {video.description}
                    </p>
                )}
            </div>
        </div>
    );
}
