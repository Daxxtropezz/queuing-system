<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $rolesQuery = Role::with('createdBy', 'updatedBy')
            ->orderBy('name', 'asc');

        // Check if a search term is provided
        if ($request->has('search')) {
            $search = $request->input('search');
            $rolesQuery->where('name', 'like', '%' . $search . '%');
        }

        // Paginate the results
        $roles = $rolesQuery->paginate(10);

        return inertia('Users/Roles', [
            'roles' => $roles,
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return inertia('Psgc/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'max:255'],
        ]);

        Role::create([
            'name' => $request->name,
            'created_by' => Auth::user()->id,

        ]);

        return redirect()->route('role.index')->with('success', 'Role created successfully.');
    }

    public function edit(Role $role)
    {
        return inertia('Roles/Edit', ['role' => $role]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Ensure only the ID is stored
        $validated['updated_by'] = Auth::id(); // This stores just the ID
        $validated['updated_at'] = now();

        $role->update($validated);

        return redirect()
            ->route('role.index')
            ->with('success', 'Role updated successfully.');
    }



    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        $role->delete();

        return redirect()->back()->with('success', 'Role deleted successfully.');
    }
}
