import Box from '@/components/ui/box';

export default function DataWarning({ message }: { message: string }) {
    return (
        <Box className="mx-auto mb-4 w-full max-w-7xl rounded-lg border border-yellow-500/30 bg-yellow-100/60 px-5 py-3 text-sm text-yellow-900 dark:border-amber-600/40 dark:bg-amber-900/30 dark:text-amber-200">
            <strong className="font-semibold">{"Data Load Warning:"}</strong> {message}
            <Box className="mt-2 text-xs opacity-80">
                {"Fix: In routes/web.php, make sure the following route is NOT inside any auth middleware:"}
                <pre className="mt-1 rounded bg-yellow-50 p-2 font-mono text-[11px] whitespace-pre-wrap text-slate-800 dark:bg-amber-950/40 dark:text-amber-200">
                    {`Route::get('/queue/board-data',[QueueBoardController::class,'data'])->name('queue.board.data');`}
                </pre>
            </Box>
        </Box>
    );
}
