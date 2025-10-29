<?php

namespace App\Observers;

use App\Models\Video;
use Illuminate\Support\Facades\Storage;

class VideoObserver
{
    public function deleting(Video $video)
    {
        if ($video->file_path) {
            // Remove leading "/storage/" if present
            $path = ltrim(str_replace('/storage/', '', $video->file_path), '/');

            // Check if the file exists in the public disk
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}
