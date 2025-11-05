import { useEffect, useRef, useState } from 'react';

type VideoType = { id: number; title: string; description?: string | null; file_path: string };
interface Props {
    video: VideoType | null;
    isModalVisible: boolean;
    onClose: () => void;
}

export default function VideoPreviewModal({ video, isModalVisible, onClose }: Props) {
    if (!isModalVisible || !video) return null;

    const [src, setSrc] = useState<string>(`/storage/${video.file_path}`);
    const vidRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        let alive = true;
        const updateSrc = async () => {
            try {
                const res = await fetch(`/api/videos/${video.id}/exists`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
                if (!res.ok) return;
                const json = await res.json();
                if (!alive) return;
                if (json?.exists && json?.url) setSrc(json.url);
            } catch { }
        };
        updateSrc();
        return () => { alive = false; };
    }, [video]);

    // Attempt autoplay unmuted first; if blocked, fallback to muted autoplay
    useEffect(() => {
        const el = vidRef.current;
        if (!el || !src) return;
        try {
            el.muted = false;
            el.volume = Math.max(el.volume, 0.4);
            const p = el.play();
            if (p && typeof p.then === 'function') {
                p.catch(() => {
                    try { el.muted = true; el.play().catch(() => { }); } catch { }
                });
            }
        } catch {
            try { el.muted = true; el.play().catch(() => { }); } catch { }
        }
    }, [src]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            {/* Modal Box */}
            <div className="relative flex w-[95%] max-w-6xl max-h-[92vh] flex-col rounded-2xl bg-white p-4 shadow-2xl dark:bg-slate-900 md:p-6">
                {/* Close button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-black hover:text-rose-400">✕</button>

                {/* Title */}
                <h3 className="mb-3 line-clamp-2 pr-10 text-base font-semibold text-slate-800 md:text-lg dark:text-slate-100">{video.title}</h3>

                {/* Video area */}
                <div className="relative flex-1 min-h-0 overflow-hidden rounded-xl bg-black/90 p-2">
                    <div className="relative mx-auto aspect-video w-full max-w-5xl">
                        <video
                            ref={vidRef}
                            autoPlay
                            controls
                            className="absolute inset-0 h-full w-full rounded-lg object-contain"
                            onLoadedData={(e) => {
                                const el = e.currentTarget;
                                try {
                                    el.muted = false;
                                    el.volume = Math.max(el.volume, 0.5);
                                    const p = el.play();
                                    if (p && typeof p.then === 'function') {
                                        p.catch(() => { try { el.muted = true; el.play().catch(() => { }); } catch { } });
                                    }
                                } catch {
                                    try { el.muted = true; el.play().catch(() => { }); } catch { }
                                }
                            }}
                        >
                            <source src={src} type="video/mp4" />
                            Your browser does not support video playback.
                        </video>
                    </div>
                </div>

                {/* Description */}
                {video.description && (
                    <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">{video.description}</p>
                )}
            </div>
        </div>
    );
}
