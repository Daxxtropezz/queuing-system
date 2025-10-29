<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VideoController extends Controller
{
    public function index(Request $request)
    {
        $query = Video::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $videos = $query->latest()->paginate(10)->withQueryString();

        return inertia('videos/index', [
            'videos' => $videos,
            'filters' => ['search' => $search],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|max:255',
            'description' => 'nullable|max:1000',
            'file_path' => 'required|mimes:mp4,mov,avi,wmv|max:512000', 
        ]);

        $path = $request->file('file_path')->store('videos', 'public');

        Video::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_path' => $path,
        ]);

        return redirect()->route('videos.index')->with('success', 'Video uploaded successfully.');
    }

   public function update(Request $request, Video $video)
{
    $validated = $request->validate([
        'title' => 'required|max:255',
        'description' => 'nullable|max:1000',
        'file_path' => 'nullable|mimes:mp4,mov,avi,wmv|max:512000',
    ]);

    if ($request->hasFile('file_path')) {
        // delete old file
        if ($video->file_path && Storage::disk('public')->exists($video->file_path)) {
            Storage::disk('public')->delete($video->file_path);
        }
        $path = $request->file('file_path')->store('videos', 'public');
        $validated['file_path'] = $path;
    } else {
        unset($validated['file_path']); // ⬅️ don’t overwrite with null
    }

    $video->update($validated);

    return redirect()->route('videos.index')->with('success', 'Video updated successfully.');
}
public function destroy(Video $video)
{
    // Don't attempt to delete the file here.
    // Just delete the database record.
    $video->delete();

    return redirect()->back()->with('success', 'Video deleted.');
}

}
