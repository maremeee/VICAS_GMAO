<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    // ────────────────────────────────────────────────────────
    // POST /api/auth/register
    // ────────────────────────────────────────────────────────
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['required', 'string', 'max:100'],
            'email'      => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone'      => ['nullable', 'string', 'max:20'],
            'role'       => ['required', Rule::in(User::ROLES)],
            'password'   => ['required', 'confirmed', Password::min(6)],
        ], [
            'first_name.required' => 'Le prénom est obligatoire.',
            'last_name.required'  => 'Le nom est obligatoire.',
            'email.required'      => 'L\'adresse email est obligatoire.',
            'email.email'         => 'L\'adresse email n\'est pas valide.',
            'email.unique'        => 'Cette adresse email est déjà utilisée.',
            'role.required'       => 'Le rôle est obligatoire.',
            'role.in'             => 'Le rôle sélectionné n\'est pas valide.',
            'password.required'   => 'Le mot de passe est obligatoire.',
            'password.confirmed'  => 'La confirmation du mot de passe ne correspond pas.',
            'password.min'        => 'Le mot de passe doit contenir au moins 6 caractères.',
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name'  => $validated['last_name'],
            'email'      => $validated['email'],
            'phone'      => $validated['phone'] ?? null,
            'role'       => $validated['role'],
            'password'   => Hash::make($validated['password']),
            'active'     => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Compte créé avec succès.',
            'user'    => $this->formatUser($user),
            'token'   => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    // ────────────────────────────────────────────────────────
    // POST /api/auth/login
    // ────────────────────────────────────────────────────────
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required'    => 'L\'adresse email est obligatoire.',
            'email.email'       => 'L\'adresse email n\'est pas valide.',
            'password.required' => 'Le mot de passe est obligatoire.',
        ]);

        // Chercher l'utilisateur
        $user = User::where('email', $validated['email'])->first();

        // Vérifier l'existence et le mot de passe
        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect.',
                'errors'  => ['email' => ['Identifiants invalides.']],
            ], 401);
        }

        // Vérifier que le compte est actif
        if (! $user->active) {
            return response()->json([
                'message' => 'Votre compte est désactivé. Contactez un administrateur.',
            ], 403);
        }

        // Révoquer les anciens tokens (une session à la fois)
        $user->tokens()->delete();

        // Créer un nouveau token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'    => 'Connexion réussie.',
            'user'       => $this->formatUser($user),
            'token'      => $token,
            'token_type' => 'Bearer',
        ]);
    }

    // ────────────────────────────────────────────────────────
    // POST /api/auth/logout  (authentifié)
    // ────────────────────────────────────────────────────────
    public function logout(Request $request): JsonResponse
    {
        // Révoquer le token actuel
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    // ────────────────────────────────────────────────────────
    // GET /api/auth/me  (authentifié)
    // ────────────────────────────────────────────────────────
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->formatUser($request->user()),
        ]);
    }

    // ────────────────────────────────────────────────────────
    // Formatage de la réponse utilisateur
    // ────────────────────────────────────────────────────────
    private function formatUser(User $user): array
    {
        return [
            'id'         => $user->id,
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
            'full_name'  => $user->full_name,
            'email'      => $user->email,
            'phone'      => $user->phone,
            'role'       => $user->role,
            'active'     => $user->active,
            'created_at' => $user->created_at?->toISOString(),
        ];
    }
}
