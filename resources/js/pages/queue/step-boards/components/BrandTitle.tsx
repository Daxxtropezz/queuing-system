import { Link } from '@inertiajs/react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export default function BrandTitle() {
    return (
        <header className="mb-3 flex items-center justify-between">
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/tellers" prefetch>
                            <h2 className="flex items-center text-xl font-semibold tracking-wide text-slate-800 md:text-2xl dark:text-slate-200 hover:opacity-90 transition-opacity">
                                <span className="bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent dark:from-slate-200 dark:to-slate-400">
                                    {"Department of Social Welfare and Development"}
                                </span>
                            </h2>
                        </Link>
                    </TooltipTrigger>

                    {/* Tooltip with design */}
                    <TooltipContent
                        side="bottom"
                        align="center"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-md 
                                   dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:shadow-lg flex items-center gap-2"
                    >
                        <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        <span>{"Click me to Login or Navigate to Teller's Page"}</span>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </header>
    );
}
