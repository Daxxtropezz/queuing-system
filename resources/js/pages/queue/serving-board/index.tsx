import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import Box from '@/components/ui/box';

import HeaderBar from './components/HeaderBar';
import BrandTitle from './components/BrandTitle';
import DataWarning from './components/DataWarning';
import VideoSlot from './components/VideoSlot';
import WaitingList from './components/WaitingList';
import ServingList from './components/ServingList';

import { useBoardData } from './hooks/useBoardData';
import { useCapacities } from './hooks/useCapacities';

import type { ServingBoardPageProps, Teller } from './types';
import { buildTellerMap, getTellerName as _getTellerName } from './utils';

export default function MainPage({ boardData, transactionTypes = [], tellers = [] }: ServingBoardPageProps) {
    const { servingWrapRef, waitingWrapRef, servingCapacity, waitingCapacity } = useCapacities();
    const { servingTickets, waitingTickets, loading, lastUpdated, redirectError } = useBoardData(boardData);

    const tellerMap = useMemo(() => buildTellerMap(tellers as Teller[]), [tellers]);
    const getTellerName = (t: any) => _getTellerName(t, tellerMap);

    return (
        <>
            <Head title="Now Serving" />
            <Box className="relative flex h-screen min-h-screen flex-col overflow-hidden bg-gradient-to-br from-white via-slate-50 to-white text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
                <Box className="pointer-events-none absolute inset-0 overflow-hidden">
                    <Box className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-600/20" />
                    <Box className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-red-500/10 blur-3xl dark:bg-red-600/15" />
                </Box>

                <HeaderBar lastUpdated={lastUpdated} loading={loading} />

                <main className="relative z-10 mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden px-4 pt-3 pb-3 md:px-8 md:pt-5 md:pb-5">
                    {redirectError && <DataWarning message={redirectError} />}

                    <Box className="mx-auto grid h-full w-full max-w-7xl gap-4 lg:grid-cols-12">
                        <section className="flex min-h-0 flex-col gap-4 lg:col-span-7">
                            <Box>
                                <BrandTitle />
                                <VideoSlot emptyText="No video found." />
                            </Box>

                            <Box className="flex min-h-0 flex-1 flex-col gap-3">
                                <header className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold tracking-wide text-slate-800 md:text-xl dark:text-slate-200">
                                        <span className="bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent dark:from-slate-200 dark:to-slate-400">{"Waiting List"}</span>
                                    </h3>
                                    <Box className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                                        {waitingTickets.length} {"queued"}
                                    </Box>
                                </header>
                                <Box ref={waitingWrapRef} className="min-h-0 flex-1">
                                    <Box className="grid h-full grid-cols-1 gap-3 px-3">
                                        {loading && waitingTickets.length === 0 && (
                                            <>
                                                {Array.from({ length: 2 }).map((_, i) => (
                                                    <Box key={`w-skel-${i}`} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40">
                                                        <Box className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-800/40 dark:via-slate-800/10 dark:to-slate-900/40" />
                                                        <Box className="relative mb-6 h-8 w-24 rounded bg-slate-200 dark:bg-slate-700/40" />
                                                        <Box className="relative h-10 w-32 rounded bg-slate-200 dark:bg-slate-700/40" />
                                                    </Box>
                                                ))}
                                            </>
                                        )}

                                        <WaitingList waitingTickets={waitingTickets} waitingCapacity={waitingCapacity} transactionTypes={transactionTypes} getTellerName={getTellerName} />
                                    </Box>
                                </Box>
                            </Box>
                        </section>

                        <section className="flex min-h-0 flex-col gap-3 lg:col-span-5">
                            <header className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold tracking-wide text-slate-800 md:text-2xl dark:text-slate-200">
                                    <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent dark:from-amber-500 dark:via-yellow-400 dark:to-amber-500">{"Serving List"}</span>
                                </h2>
                                <Box className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                                    {servingTickets.length} {"active"}
                                </Box>
                            </header>

                            <Box ref={servingWrapRef} className="min-h-0 flex-1 overflow-hidden">
                                <ServingList servingTickets={servingTickets} servingCapacity={servingCapacity} transactionTypes={transactionTypes} getTellerName={getTellerName} />
                            </Box>
                        </section>
                    </Box>
                </main>

                <footer className="relative z-10 mt-auto w-full shrink-0 border-t border-slate-200/70 bg-white/80 py-3 text-center text-xs font-medium tracking-wide text-slate-600 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-400">
                    {"DSWD Queuing System • Real-time Serving Board"}
                </footer>
            </Box>
        </>
    );
}
