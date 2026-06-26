<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Driver::with('user:id,email');
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        return response()->json($query->orderBy('last_name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name'     => 'required|string|max:100',
            'last_name'      => 'required|string|max:100',
            'phone'          => 'nullable|string|max:20',
            'license_number' => 'nullable|string',
            'license_expiry' => 'nullable|date',
            'status'         => 'nullable|in:disponible,en_mission,conge,indisponible',
            'user_id'        => 'nullable|exists:users,id',
        ]);

        $driver = Driver::create($validated);
        return response()->json(['message' => 'Chauffeur créé.', 'driver' => $driver], 201);
    }

    public function show(Driver $driver): JsonResponse
    {
        return response()->json($driver->load(['user:id,email,role', 'assignments']));
    }

    public function update(Request $request, Driver $driver): JsonResponse
    {
        $validated = $request->validate([
            'first_name'     => 'sometimes|string|max:100',
            'last_name'      => 'sometimes|string|max:100',
            'phone'          => 'sometimes|nullable|string|max:20',
            'license_number' => 'sometimes|nullable|string',
            'license_expiry' => 'sometimes|nullable|date',
            'status'         => 'sometimes|in:disponible,en_mission,conge,indisponible',
            'user_id'        => 'sometimes|nullable|exists:users,id',
        ]);

        $driver->update($validated);
        return response()->json(['message' => 'Chauffeur mis à jour.', 'driver' => $driver->fresh()]);
    }

    public function destroy(Driver $driver): JsonResponse
    {
        $driver->delete();
        return response()->json(['message' => 'Chauffeur supprimé.']);
    }
}
