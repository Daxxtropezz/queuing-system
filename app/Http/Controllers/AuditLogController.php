<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::query()
            ->with(['causer.roles'])
            ->latest();

        // Filters
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('log_name', 'like', "%{$search}%")
                    ->orWhere('event', 'like', "%{$search}%");
            });
        }

        if ($logName = $request->get('log_name')) {
            $query->where('log_name', $logName);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // ✅ Handle dynamic per_page (default to 10)
    $perPage = $request->get('per_page', 10);

    // Paginate with query string preservation
    $logs = $query->paginate($perPage)->withQueryString();

        $logNames = Activity::select('log_name')
            ->distinct()
            ->orderBy('log_name')
            ->pluck('log_name');

        return Inertia::render('audit-logs', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'log_name' => $logName,
                'per_page' => $perPage,
            ],
            'logNames' => $logNames,
        ]);
    }

     public function log(Request $request)
    {
        // 1. Validate the incoming request data
        $request->validate([
            'log_name' => 'required|string|max:255',
            'description' => 'required|string',
            'properties' => 'nullable|array',
            'event' => 'nullable|string', // Assuming you added 'event' in the JS call
        ]);

        try {
            // 2. Log the activity using the Spatie helper
            activity()
                ->useLog($request->input('log_name'))
                ->causedBy(Auth::user())
                ->event($request->input('event', 'interaction')) // Use the event or default to 'interaction'
                ->withProperties($request->input('properties', []))
                ->log($request->input('description'));

            return response()->json(['message' => 'Activity logged successfully.'], 200);

        } catch (\Exception $e) {
            Log::error("Failed to log activity from frontend: " . $e->getMessage(), $request->all());

            return response()->json(['message' => 'Failed to process activity log.'], 500);
        }
    }
}
