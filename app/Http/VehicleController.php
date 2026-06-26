<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    // GET /api/vehicles
    public function index(Request $request): JsonResponse
    {
        $query = Vehicle::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(fn($q2) => $q2
                ->where('plate', 'ilike', "%{$q}%")
                ->orWhere('brand', 'ilike', "%{$q}%")
                ->orWhere('model', 'ilike', "%{$q}%")
            );
        }

        return response()->json($query->orderBy('plate')->get());
    }

    // POST /api/vehicles
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plate'                  => 'required|string|unique:vehicles,plate',
            'type'                   => 'required|in:camion,pelleteuse,grue,compacteur,bulldozer,chargeuse,nacelle,vehicule_leger',
            'brand'                  => 'required|string|max:100',
            'model'                  => 'required|string|max:100',
            'year'                   => 'required|integer|min:1990|max:2030',
            'km'                     => 'nullable|integer|min:0',
            'hours'                  => 'nullable|integer|min:0',
            'status'                 => 'nullable|in:disponible,en_mission,en_maintenance,en_panne,hors_service',
            'fuel_type'              => 'nullable|in:diesel,essence',
            'tank_capacity'          => 'nullable|integer|min:0',
            'acquisition_date'       => 'nullable|date',
            'chassis_number'         => 'nullable|string',
            'insurance_expiry'       => 'nullable|date',
            'technical_visit_expiry' => 'nullable|date',
            'last_maintenance_date'  => 'nullable|date',
            'next_maintenance_km'    => 'nullable|integer|min:0',
            'site'                   => 'nullable|string',
            'notes'                  => 'nullable|string',
        ]);

        $vehicle = Vehicle::create($validated);

        return response()->json([
            'message' => 'Véhicule créé avec succès.',
            'vehicle' => $vehicle,
        ], 201);
    }

    // GET /api/vehicles/{id}
    public function show(Vehicle $vehicle): JsonResponse
    {
        return response()->json($vehicle->load(['workOrders', 'alerts']));
    }

    // PUT /api/vehicles/{id}
    public function update(Request $request, Vehicle $vehicle): JsonResponse
    {
        $validated = $request->validate([
            'plate'                  => "sometimes|string|unique:vehicles,plate,{$vehicle->id}",
            'type'                   => 'sometimes|in:camion,pelleteuse,grue,compacteur,bulldozer,chargeuse,nacelle,vehicule_leger',
            'brand'                  => 'sometimes|string|max:100',
            'model'                  => 'sometimes|string|max:100',
            'year'                   => 'sometimes|integer|min:1990|max:2030',
            'km'                     => 'sometimes|integer|min:0',
            'hours'                  => 'sometimes|integer|min:0',
            'status'                 => 'sometimes|in:disponible,en_mission,en_maintenance,en_panne,hors_service',
            'fuel_type'              => 'sometimes|in:diesel,essence',
            'tank_capacity'          => 'sometimes|integer|min:0',
            'acquisition_date'       => 'sometimes|nullable|date',
            'chassis_number'         => 'sometimes|nullable|string',
            'insurance_expiry'       => 'sometimes|nullable|date',
            'technical_visit_expiry' => 'sometimes|nullable|date',
            'last_maintenance_date'  => 'sometimes|nullable|date',
            'next_maintenance_km'    => 'sometimes|integer|min:0',
            'site'                   => 'sometimes|nullable|string',
            'notes'                  => 'sometimes|nullable|string',
        ]);

        $vehicle->update($validated);

        return response()->json([
            'message' => 'Véhicule mis à jour.',
            'vehicle' => $vehicle->fresh(),
        ]);
    }

    // DELETE /api/vehicles/{id}
    public function destroy(Vehicle $vehicle): JsonResponse
    {
        $vehicle->delete();
        return response()->json(['message' => 'Véhicule supprimé.']);
    }
}
