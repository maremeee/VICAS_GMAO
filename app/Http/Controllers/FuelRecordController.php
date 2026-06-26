<?php

namespace App\Http\Controllers;

use App\Models\FuelRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FuelRecordController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FuelRecord::with(['vehicle:id,plate', 'driver:id,first_name,last_name']);

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }
        if ($request->filled('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }

        return response()->json($query->orderByDesc('date')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'driver_id'  => 'nullable|exists:drivers,id',
            'date'       => 'required|date',
            'fuel_type'  => 'required|in:diesel,essence',
            'liters'     => 'required|numeric|min:0.1',
            'cost'       => 'required|numeric|min:0',
            'odometer'   => 'nullable|integer|min:0',
            'supplier'   => 'nullable|string|max:150',
        ]);

        $record = FuelRecord::create($validated);

        // Mettre à jour le kilométrage du véhicule
        if (!empty($validated['odometer'])) {
            $record->vehicle->update(['km' => $validated['odometer']]);
        }

        return response()->json([
            'message' => 'Plein enregistré avec succès.',
            'record'  => $record->load(['vehicle:id,plate', 'driver:id,first_name,last_name']),
        ], 201);
    }

    public function show(FuelRecord $fuelRecord): JsonResponse
    {
        return response()->json($fuelRecord->load(['vehicle', 'driver']));
    }

    public function destroy(FuelRecord $fuelRecord): JsonResponse
    {
        $fuelRecord->delete();
        return response()->json(['message' => 'Enregistrement supprimé.']);
    }

    // GET /api/fuel-records/stats
    public function stats(): JsonResponse
    {
        $records = FuelRecord::all();
        return response()->json([
            'total_liters' => $records->sum('liters'),
            'total_cost'   => $records->sum('cost'),
            'avg_price'    => $records->sum('liters') > 0
                ? round($records->sum('cost') / $records->sum('liters'), 2)
                : 0,
            'records_count' => $records->count(),
        ]);
    }
}
