import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import Box from '@/components/ui/box';
import type { VideoFilters } from '@/pages/videos/types/types';

interface Props {
    searchQuery: string;
    onSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSearch: (e: React.FormEvent) => void;
    isLoading: boolean;
    filters?: VideoFilters;
}

export default function VideoSearchForm({
    searchQuery,
    onSearchInputChange,
    handleSearch,
    isLoading,
    filters,
}: Props) {
    const activeFilterSearch = filters?.search;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchInputChange(e);
        if (e.target.value.trim().length >= 3) {
            handleSearch(e as any);
        }
    };

    return (
        <form className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Box className="relative w-full max-w-sm">
                {/* Centered icon that stays fixed */}
                <Box className="absolute left-3 top-1/3 -translate-y-1/2 pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </Box>

                <Input
                    value={searchQuery}
                    placeholder="Search..."
                    onChange={handleInputChange}
                    maxLength={50}
                    className="w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 placeholder-slate-500 
                               focus:border-blue-400 focus:ring-1 focus:ring-blue-300 
                               dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 
                               dark:placeholder-slate-500 dark:focus:border-blue-600 dark:focus:ring-1 dark:focus:ring-blue-800 shadow-sm 
                               transition-[border-color,box-shadow] duration-150 ease-in-out"
                    disabled={isLoading}
                />

                {/* Fix: reserve a fixed-height area below the input so layout never shifts */}
                <Box className="h-[1.25rem]">
                    {searchQuery.length > 0 && searchQuery.trim().length < 3 && (
                        <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">
                            {"Type at least 3 characters to search"}
                        </p>
                    )}
                    {activeFilterSearch && (
                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                            {`Showing results for "${activeFilterSearch}"`}
                        </p>
                    )}
                </Box>
            </Box>
        </form>
    );
}