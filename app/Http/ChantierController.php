<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChantierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Chantier::query();
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        return response()->json($query->orderByDesc('start_date')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:200',
            'code'       => 'required|string|unique:chantiers,code',
            'location'   => 'required|string',
            'manager'    => 'required|string',
            'status'     => 'nullable|in:actif,termine,suspendu',
            'start_date' => 'required|date',
            'end_date'   => 'nullable|date|after:start_date',
        ]);

        $chantier = Chantier::create($validated);
        return response()->json(['message' => 'Chantier créé.', 'chantier' => $chantier], 201);
    }

    public function show(Chantier $chantier): JsonResponse
    {
        return response()->json($chantier->load('assignments'));
    }

    public function update(Request $request, Chantier $chantier): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'sometimes|string|max:200',
            'code'       => "sometimes|string|unique:chantiers,code,{$chantier->id}",
            'location'   => 'sometimes|string',
            'manager'    => 'sometimes|string',
            'status'     => 'sometimes|in:actif,termine,suspendu',
            'start_date' => 'sometimes|date',
            'end_date'   => 'sometimes|nullable|date',
        ]);

        $chantier->update($validated);
        return response()->json(['message' => 'Chantier mis à jour.', 'chantier' => $chantier->fresh()]);
    }

    public function destroy(Chantier $chantier): JsonResponse
    {
        $chantier->delete();
        return response()->json(['message' => 'Chantier supprimé.']);
    }
}
