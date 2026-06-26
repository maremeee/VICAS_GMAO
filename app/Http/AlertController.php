<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Alert::with('vehicle:id,plate,type,brand,model');

        if ($request->filled('treated')) {
            $query->where('treated', filter_var($request->treated, FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->filled('level')) {
            $query->where('level', $request->level);
        }
        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }

        return response()->json($query->orderByRaw("
            CASE level
                WHEN 'critical' THEN 1
                WHEN 'danger'   THEN 2
                WHEN 'warning'  THEN 3
                WHEN 'info'     THEN 4
            END
        ")->orderBy('due_date')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'type'       => 'required|in:vidange,revision,assurance,visite_technique,compteur',
            'level'      => 'required|in:info,warning,danger,critical',
            'message'    => 'required|string',
            'due_date'   => 'nullable|date',
        ]);

        $alert = Alert::create($validated);

        return response()->json([
            'message' => 'Alerte créée.',
            'alert'   => $alert->load('vehicle:id,plate'),
        ], 201);
    }

    public function show(Alert $alert): JsonResponse
    {
        return response()->json($alert->load('vehicle'));
    }

    // POST /api/alerts/{id}/treat
    public function treat(Alert $alert): JsonResponse
    {
        if ($alert->treated) {
            return response()->json(['message' => 'Alerte déjà traitée.'], 422);
        }

        $alert->update([
            'treated'    => true,
            'treated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Alerte marquée comme traitée.',
            'alert'   => $alert->fresh(),
        ]);
    }

    public function destroy(Alert $alert): JsonResponse
    {
        $alert->delete();
        return response()->json(['message' => 'Alerte supprimée.']);
    }
}
