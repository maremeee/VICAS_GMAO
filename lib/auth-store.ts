// lib/auth-store.ts — version mock (sans backend)
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ROLE_DEFAULT_PAGE } from "./permissions";
import { MOCK_USERS } from "./mock-data";
import type { Role } from "@/types";

interface AuthState {
  currentUser: any | null;
  token: string | null;
  isAuthenticated: boolean;

  login:    (email: string, password: string) => Promise<{ ok: boolean; user?: any; error?: string }>;
  register: (data: any) => Promise<{ ok: boolean; error?: string }>;
  logout:   () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser:     null,
      token:           null,
      isAuthenticated: false,

      // ── Connexion avec données mock ─────────────────────
      login: async (email, password) => {
        const user = MOCK_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
          return { ok: false, error: "Email ou mot de passe incorrect." };
        }

        if (!user.active) {
          return { ok: false, error: "Votre compte est désactivé." };
        }

        // En mode mock, n'importe quel mot de passe fonctionne
        set({
          currentUser:     user,
          token:           "mock-token-" + user.id,
          isAuthenticated: true,
        });

        return { ok: true, user };
      },

      // ── Inscription mock ────────────────────────────────
      register: async (data) => {
        return { ok: true };
      },

      // ── Déconnexion ─────────────────────────────────────
      logout: async () => {
        set({
          currentUser:     null,
          token:           null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "vicas-auth-storage",
      partialize: (state) => ({
        currentUser:     state.currentUser,
        token:           state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);