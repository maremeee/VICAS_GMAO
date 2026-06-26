<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // ── Rôles disponibles ─────────────────────────────────
    const ROLES = [
        'administrateur',
        'responsable_logistique',
        'chef_atelier',
        'mecanicien',
        'chauffeur',
        'direction',
    ];

    // ── Champs autorisés en mass assignment ───────────────
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'role',
        'password',
        'active',
    ];

    // ── Champs cachés dans les réponses JSON ──────────────
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // ── Casts automatiques ────────────────────────────────
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'active'            => 'boolean',
        ];
    }

    // ── Accesseurs ────────────────────────────────────────
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    // ── Helpers rôles ─────────────────────────────────────
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'administrateur';
    }

    public function isActive(): bool
    {
        return $this->active === true;
    }
}
