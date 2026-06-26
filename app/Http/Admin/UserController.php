<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // GET /api/admin/users
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(fn($q2) => $q2
                ->where('first_name', 'ilike', "%{$q}%")
                ->orWhere('last_name', 'ilike', "%{$q}%")
                ->orWhere('email', 'ilike', "%{$q}%")
            );
        }

        return response()->json($query->orderBy('last_name')->get());
    }

    // POST /api/admin/users
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'required|email|unique:users,email',
            'phone'      => 'nullable|string|max:20',
            'role'       => ['required', Rule::in(User::ROLES)],
            'password'   => 'required|min:6',
            'active'     => 'nullable|boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        return response()->json([
            'message' => 'Utilisateur créé.',
            'user'    => $user,
        ], 201);
    }

    // GET /api/admin/users/{id}
    public function show(User $user): JsonResponse
    {
        return response()->json($user);
    }

    // PUT /api/admin/users/{id}
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:100',
            'last_name'  => 'sometimes|string|max:100',
            'email'      => "sometimes|email|unique:users,email,{$user->id}",
            'phone'      => 'sometimes|nullable|string|max:20',
            'role'       => ['sometimes', Rule::in(User::ROLES)],
            'password'   => 'sometimes|min:6',
            'active'     => 'sometimes|boolean',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Utilisateur mis à jour.',
            'user'    => $user->fresh(),
        ]);
    }

    // PATCH /api/admin/users/{id}/toggle-active
    public function toggleActive(User $user): JsonResponse
    {
        $user->update(['active' => ! $user->active]);

        return response()->json([
            'message' => $user->active ? 'Compte activé.' : 'Compte désactivé.',
            'user'    => $user->fresh(),
        ]);
    }

    // DELETE /api/admin/users/{id}
    public function destroy(User $user): JsonResponse
    {
        $user->tokens()->delete();
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}
