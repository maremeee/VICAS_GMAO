<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkOrderController extends Controller
{
    // GET /api/work-orders
    public function index(Request $request): JsonResponse
    {
        $query = WorkOrder::with(['vehicle:id,plate', 'mechanic:id,first_name,last_name', 'parts']);

        // Filtre par mécanicien (rôle mecanicien voit seulement les siens)
        if ($request->filled('mechanic_id')) {
            $query->where('mechanic_id', $request->mechanic_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }

        $orders = $query->orderByDesc('date')->get()->map(function ($wo) {
            return array_merge($wo->toArray(), [
                'parts_total'  => $wo->parts_total,
                'labor_total'  => $wo->labor_total,
                'grand_total'  => $wo->grand_total,
            ]);
        });

        return response()->json($orders);
    }

    // POST /api/work-orders
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id'          => 'required|exists:vehicles,id',
            'type'                => 'required|in:preventive,corrective',
            'description'         => 'required|string',
            'mechanic_id'         => 'required|exists:mechanics,id',
            'date'                => 'required|date',
            'status'              => 'nullable|in:ouvert,en_cours,attente_pieces,termine,cloture',
            'hours_worked'        => 'nullable|numeric|min:0',
            'labor_cost_per_hour' => 'nullable|numeric|min:0',
            'observations'        => 'nullable|string',
            'parts'               => 'nullable|array',
            'parts.*.ref'         => 'nullable|string',
            'parts.*.designation' => 'required_with:parts|string',
            'parts.*.qty'         => 'required_with:parts|integer|min:1',
            'parts.*.unit_price'  => 'required_with:parts|numeric|min:0',
        ]);

        $parts = $validated['parts'] ?? [];
        unset($validated['parts']);

        $workOrder = WorkOrder::create($validated);

        if (!empty($parts)) {
            $workOrder->parts()->createMany($parts);
        }

        return response()->json([
            'message'    => 'Bon de travail créé avec succès.',
            'work_order' => $workOrder->load(['vehicle:id,plate', 'mechanic:id,first_name,last_name', 'parts']),
        ], 201);
    }

    // GET /api/work-orders/{id}
    public function show(WorkOrder $workOrder): JsonResponse
    {
        $workOrder->load(['vehicle', 'mechanic', 'parts']);
        return response()->json(array_merge($workOrder->toArray(), [
            'parts_total' => $workOrder->parts_total,
            'labor_total' => $workOrder->labor_total,
            'grand_total' => $workOrder->grand_total,
        ]));
    }

    // PUT /api/work-orders/{id}
    public function update(Request $request, WorkOrder $workOrder): JsonResponse
    {
        $validated = $request->validate([
            'type'                => 'sometimes|in:preventive,corrective',
            'description'         => 'sometimes|string',
            'mechanic_id'         => 'sometimes|exists:mechanics,id',
            'date'                => 'sometimes|date',
            'status'              => 'sometimes|in:ouvert,en_cours,attente_pieces,termine,cloture',
            'hours_worked'        => 'sometimes|numeric|min:0',
            'labor_cost_per_hour' => 'sometimes|numeric|min:0',
            'observations'        => 'sometimes|nullable|string',
            'parts'               => 'sometimes|array',
            'parts.*.ref'         => 'nullable|string',
            'parts.*.designation' => 'required_with:parts|string',
            'parts.*.qty'         => 'required_with:parts|integer|min:1',
            'parts.*.unit_price'  => 'required_with:parts|numeric|min:0',
        ]);

        $parts = $validated['parts'] ?? null;
        unset($validated['parts']);

        $workOrder->update($validated);

        // Remplace les pièces si fournies
        if ($parts !== null) {
            $workOrder->parts()->delete();
            $workOrder->parts()->createMany($parts);
        }

        return response()->json([
            'message'    => 'Bon de travail mis à jour.',
            'work_order' => $workOrder->fresh()->load(['vehicle:id,plate', 'mechanic:id,first_name,last_name', 'parts']),
        ]);
    }

    // POST /api/work-orders/{id}/close
    public function close(WorkOrder $workOrder): JsonResponse
    {
        $workOrder->update(['status' => 'cloture']);

        // Mettre à jour la date de dernière maintenance du véhicule
        $workOrder->vehicle->update([
            'last_maintenance_date' => now()->toDateString(),
        ]);

        return response()->json([
            'message'    => 'Bon de travail clôturé.',
            'work_order' => $workOrder->fresh(),
        ]);
    }

    // DELETE /api/work-orders/{id}
    public function destroy(WorkOrder $workOrder): JsonResponse
    {
        $workOrder->parts()->delete();
        $workOrder->delete();
        return response()->json(['message' => 'Bon de travail supprimé.']);
    }
}
