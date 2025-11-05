export async function checkVideoExists(id: number): Promise<{ exists: boolean; url?: string }> {
    try {
        const res = await fetch(`/api/videos/${id}/exists`, {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
        });
        if (!res.ok) return { exists: false };
        const json = await res.json();
        return { exists: !!json?.exists, url: json?.url };
    } catch {
        return { exists: false };
    }
}
