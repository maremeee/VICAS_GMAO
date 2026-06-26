<?php

namespace App\Http\Controllers;

use App\Models\Mechanic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MechanicController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Mechanic::with('user:id,email')->orderBy('last_name')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'phone'      => 'nullable|string|max:20',
            'speciality' => 'nullable|string|max:150',
            'user_id'    => 'nullable|exists:users,id',
        ]);

        $mechanic = Mechanic::create($validated);
        return response()->json(['message' => 'Mécanicien créé.', 'mechanic' => $mechanic], 201);
    }

    public function show(Mechanic $mechanic): JsonResponse
    {
        return response()->json($mechanic->load(['user:id,email,role', 'workOrders']));
    }

    public function update(Request $request, Mechanic $mechanic): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:100',
            'last_name'  => 'sometimes|string|max:100',
            'phone'      => 'sometimes|nullable|string|max:20',
            'speciality' => 'sometimes|nullable|string|max:150',
            'user_id'    => 'sometimes|nullable|exists:users,id',
        ]);

        $mechanic->update($validated);
        return response()->json(['message' => 'Mécanicien mis à jour.', 'mechanic' => $mechanic->fresh()]);
    }

    public function destroy(Mechanic $mechanic): JsonResponse
    {
        $mechanic->delete();
        return response()->json(['message' => 'Mécanicien supprimé.']);
    }
}
