<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Vérifie que l'utilisateur connecté possède l'un des rôles autorisés.
     *
     * Usage dans les routes :
     *   ->middleware('role:administrateur')
     *   ->middleware('role:administrateur,chef_atelier')
     */
    public function handle(Request $request, Closure $next, string ...$roles): JsonResponse|mixed
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Non authentifié.',
            ], 401);
        }

        if (! $user->active) {
            return response()->json([
                'message' => 'Votre compte est désactivé.',
            ], 403);
        }

        if (! empty($roles) && ! in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Accès refusé. Vous n\'avez pas les droits nécessaires.',
                'required_roles' => $roles,
                'your_role'      => $user->role,
            ], 403);
        }

        return $next($request);
    }
}
