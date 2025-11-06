<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // Validate search input (min 3 chars, no SQL-dangerous chars)
        $request->validate([
            'search' => 'nullable|string|min:3|max:255|regex:/^[^"\';\\\\]*$/',
        ]);

        $usersQuery = User::orderBy('first_name', 'asc')->with('roles');;

        // Only apply search if input exists and has ≥3 chars
        if ($request->has('search') && strlen($request->search) >= 3) {
            $search = $request->input('search');

            // Secure parameterized search (SQL-safe)
            $usersQuery->where(function ($query) use ($search) {
                $query->where('first_name', 'like', '%' . $search . '%')
                    ->orWhere('last_name', 'like', '%' . $search . '%')
                    ->orWhere('role', 'like', '%' . $search . '%');
            });
        }

        // Paginate results (fixed: removed duplicate query)
        $users = $usersQuery->paginate(10);

        // Cache these if they rarely change (better performance) 
        $roles   = Role::groupBy('name')->pluck('name');

        return inertia('users/user-management', [
            'users' => $users->through(function ($user) {
                return [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'role' => $user->roles->pluck('name')->first() ?? 'Guest',
                    'is_enabled' => $user->is_enabled,
                ];
            }),
            'filters' => $request->only('search'),
            'roles' => Role::pluck('name'),
        ]);
    }


    public function toggleStatus(User $user)
    {
        $user->update(['is_enabled' => !$user->is_enabled]);

        return redirect()->route('users.index')->with('success', 'User status updated successfully.');
    }

    public function changeRole(Request $request, User $user)
    {
        // Validate role exists
        $role = Role::where('name', $request->role)->first();

        if (!$role) {
            return redirect()->back()->withErrors(['role' => 'Invalid role']);
        }

        try {
            // Sync role using Spatie
            $user->syncRoles([$role->name]);

            // Also update the `role` column in users table
            $user->role = $role->name;
            $user->save();

            return redirect()->back()->with('success', 'Role updated.');
        } catch (\Exception $e) {
            Log::error('Error assigning role', [
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->withErrors(['error' => 'Something went wrong.']);
        }
    }
}
