import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

    return (
        <Box className="w-full flex flex-col items-end">
            {/* Search Input + Button */}
            <form
                onSubmit={handleSearch}
                className="flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end"
            >
                <Box className="relative w-full sm:w-72">
                    {/* Search Icon */}
                    <Box className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </Box>

                    {/* Input */}
                    <Input
                        value={searchQuery}
                        placeholder="Search videos..."
                        onChange={onSearchInputChange}
                        maxLength={50}
                        className="w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 placeholder-slate-500 
                                   focus:border-blue-400 focus:ring-1 focus:ring-blue-300 
                                   dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 
                                   dark:placeholder-slate-500 dark:focus:border-blue-600 dark:focus:ring-1 dark:focus:ring-blue-800 shadow-sm 
                                   transition-[border-color,box-shadow] duration-150 ease-in-out"
                        disabled={isLoading}
                    />
                </Box>

                {/* Search Button */}
                <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md disabled:opacity-60 h-[42px]"
                    disabled={isLoading}
                >
                    <SearchIcon className="h-4 w-4 mr-2" />
                </Button>
            </form>

            {/* Validation or Active Filter Message */}
            <Box className="mt-2 text-right w-full max-w-md">
                {searchQuery.length > 0 && searchQuery.trim().length < 3 && (
                    <p className="text-xs text-rose-500 dark:text-rose-400">
                        Type at least 3 characters to search
                    </p>
                )}
                {activeFilterSearch && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        Showing results for "{activeFilterSearch}"
                    </p>
                )}
            </Box>
        </Box>
    );
}
