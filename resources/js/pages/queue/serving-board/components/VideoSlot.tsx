import { useEffect, useRef, useState } from 'react';
import Box from '@/components/ui/box';

export default function VideoSlot({ emptyText = 'No video configured' }: { emptyText?: string }) {
    type ActiveVideo = { id: number; title: string; description?: string | null; file_path: string; url: string };

    const [videos, setVideos] = useState<ActiveVideo[]>([]);
    const [index, setIndex] = useState(0);
    const hasVideos = videos.length > 0;
    const src = hasVideos ? videos[index % videos.length]?.url : null;
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        let alive = true;
        const load = async () => {
            try {
                const res = await fetch('/api/videos/active', { headers: { Accept: 'application/json' }, cache: 'no-store' });
                if (!res.ok) return;
                const json = await res.json();
                if (alive && json?.videos) setVideos(Array.isArray(json.videos) ? json.videos : []);
            } catch (e) {
                console.error('load videos error', e);
            }
        };
        load();
        const id = window.setInterval(load, 30000);
        return () => { alive = false; window.clearInterval(id); };
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = 0.4;
        }
    }, [src]);

    useEffect(() => {
        const el = videoRef.current;
        if (!el || !src) return;
        try {
            el.muted = false;
            el.volume = Math.max(el.volume, 0.4);
            const p = el.play();
            if (p && typeof p.then === 'function') {
                p.catch(() => { try { el.muted = true; el.play().catch(() => { }); } catch { } });
            }
        } catch {
            try { el.muted = true; el.play().catch(() => { }); } catch { }
        }
    }, [src]);

    return (
        <Box className="h-[37.5vh] w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-xl ring-1 ring-slate-200/60 backdrop-blur md:h-[37.5vh] lg:h-[42.5vh] xl:h-[47.5vh] dark:border-slate-800/70 dark:bg-slate-900/70 dark:ring-slate-800/50">
            <Box className="relative h-full w-full">
                {src ? (
                    <video
                        ref={videoRef}
                        key={src}
                        className="h-full w-full object-cover"
                        src={src}
                        autoPlay
                        playsInline
                        loop={videos.length === 1}
                        preload="auto"
                        onLoadedData={() => {
                            if (videoRef.current) {
                                videoRef.current.volume = 0.5;
                                try { videoRef.current.play().catch(() => { }); } catch { }
                            }
                        }}
                        onEnded={() => setIndex((i) => (i + 1) % Math.max(1, videos.length))}
                        onError={() => setIndex((i) => (i + 1) % Math.max(1, videos.length))}
                    />
                ) : (
                    <Box className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                        {emptyText} <br /> {"An administrator will be uploading videos, please wait a moment."}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
