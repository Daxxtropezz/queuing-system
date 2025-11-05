import { Link } from '@inertiajs/react';

export default function BrandTitle() {
    return (
        <header className="mb-3 flex items-center justify-between">
            <Link href="/tellers" prefetch>
                <h2 className="flex items-center text-xl font-semibold tracking-wide text-slate-800 md:text-2xl dark:text-slate-200">
                    <span className="bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent dark:from-slate-200 dark:to-slate-400">
                        {"Department of Social Welfare and Development"}
                    </span>
                </h2>
            </Link>
        </header>
    );
}
