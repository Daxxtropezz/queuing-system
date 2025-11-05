<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;

class VideoController extends Controller
{
    public function index(Request $request)
    {
        $query = Video::query();

        // 1. Get per_page from request, default to 10
        $perPage = $request->input('per_page', 10);
        $perPage = min(100, max(1, (int) $perPage));

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $videos = $query->latest()
            // 2. Use the dynamic $perPage variable for pagination
            ->paginate($perPage)
            ->withQueryString();

        return inertia('videos/index', [
            'videos' => $videos,
            'filters' => [
                'search' => $search,
                // 3. Pass per_page back for the UI
                'per_page' => $perPage,
            ],
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

    // NEW: Return only non-deleted videos that still exist on disk
    public function active(Request $request): JsonResponse
    {
        $records = Video::query()
            ->whereNull('deleted_at')
            ->get(['id', 'title', 'description', 'file_path']);

        $videos = $records
            ->filter(function ($v) {
                return $v->file_path && Storage::disk('public')->exists($v->file_path);
            })
            ->map(function ($v) {
                return [
                    'id' => $v->id,
                    'title' => $v->title,
                    'description' => $v->description,
                    'file_path' => $v->file_path,
                    // Use asset() to build public URL consistently with /storage symlink
                    'url' => asset('storage/' . ltrim($v->file_path, '/')),
                ];
            })
            ->values();

        return response()->json([
            'videos' => $videos,
            'generated_at' => now()->toAtomString(),
        ]);
    }

    // NEW: Check if a specific video's file exists on disk
    public function exists(Video $video): JsonResponse
    {
        $exists = $video->file_path && Storage::disk('public')->exists($video->file_path);
        $url = $exists ? asset('storage/' . ltrim($video->file_path, '/')) : null;
        return response()->json([
            'exists' => (bool) $exists,
            'url' => $url,
        ]);
    }
}
