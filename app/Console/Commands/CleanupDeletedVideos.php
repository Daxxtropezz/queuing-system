<?php

namespace App\Console\Commands;

use App\Models\Video;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanupDeletedVideos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'videos:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deletes video files that have been soft deleted.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting video cleanup...');

        $videos = Video::onlyTrashed()->get();

        if ($videos->isEmpty()) {
            $this->info('No soft-deleted videos to clean up.');
            return Command::SUCCESS;
        }

        foreach ($videos as $video) {
            if ($video->file_path) {
                // Remove the /storage/ prefix to get the path relative to the disk root
                $path = str_replace('/storage/', '', $video->file_path);

                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                    $this->info("Deleted file: {$path}");
                } else {
                    $this->warn("File not found: {$path}");
                }
            }

            // Permanently remove the database record
            $video->forceDelete();
        }

        $this->info('Video cleanup complete.');

        return Command::SUCCESS;
    }
}