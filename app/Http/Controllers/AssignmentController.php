<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Vehicle;
use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Assignment::with([
            'vehicle:id,plate,type,brand,model',
            'driver:id,first_name,last_name',
            'chantier:id,name,code,location',
        ]);

        if ($request->filled('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('chantier_id')) {
            $query->where('chantier_id', $request->chantier_id);
        }

        return response()->json($query->orderByDesc('start_date')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id'   => 'required|exists:vehicles,id',
            'driver_id'    => 'required|exists:drivers,id',
            'chantier_id'  => 'required|exists:chantiers,id',
            'start_date'   => 'required|date',
            'departure_km' => 'nullable|integer|min:0',
            'notes'        => 'nullable|string',
        ]);

        // Vérifier disponibilité
        $vehicle = Vehicle::findOrFail($validated['vehicle_id']);
        $driver  = Driver::findOrFail($validated['driver_id']);

        if ($vehicle->status !== 'disponible') {
            return response()->json(['message' => 'Ce véhicule n\'est pas disponible.'], 422);
        }
        if ($driver->status !== 'disponible') {
            return response()->json(['message' => 'Ce chauffeur n\'est pas disponible.'], 422);
        }

        $assignment = Assignment::create(array_merge($validated, ['status' => 'active']));

        // Passer en mission
        $vehicle->update(['status' => 'en_mission']);
        $driver->update(['status' => 'en_mission']);

        return response()->json([
            'message'    => 'Affectation créée. Mission démarrée.',
            'assignment' => $assignment->load(['vehicle', 'driver', 'chantier']),
        ], 201);
    }

    public function show(Assignment $assignment): JsonResponse
    {
        return response()->json($assignment->load(['vehicle', 'driver', 'chantier']));
    }

    // POST /api/assignments/{id}/end
    public function end(Request $request, Assignment $assignment): JsonResponse
    {
        if ($assignment->status !== 'active') {
            return response()->json(['message' => 'Cette mission n\'est pas active.'], 422);
        }

        $validated = $request->validate([
            'return_km' => 'nullable|integer|min:0',
        ]);

        $assignment->update([
            'status'   => 'terminee',
            'end_date' => now()->toDateString(),
            'return_km' => $validated['return_km'] ?? null,
        ]);

        // Remettre en disponible
        $assignment->vehicle->update([
            'status' => 'disponible',
            'km'     => $validated['return_km'] ?? $assignment->vehicle->km,
        ]);
        $assignment->driver->update(['status' => 'disponible']);

        return response()->json([
            'message'    => 'Mission terminée.',
            'assignment' => $assignment->fresh()->load(['vehicle', 'driver', 'chantier']),
        ]);
    }

    public function destroy(Assignment $assignment): JsonResponse
    {
        $assignment->delete();
        return response()->json(['message' => 'Affectation supprimée.']);
    }
}
