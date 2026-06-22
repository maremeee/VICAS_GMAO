import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Role } from "@/types";
import { MOCK_USERS } from "@/lib/mock-data";
import { uid } from "@/lib/utils";

interface AuthState {
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string; user?: User };
  logout: () => void;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: Role;
  }) => { ok: boolean; error?: string };
  addUser: (data: Omit<User, "id" | "createdAt">) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserActive: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: MOCK_USERS,
      currentUser: null,
      isAuthenticated: false,

      login: (email, password) => {
        if (!password || password.length < 1) {
          return { ok: false, error: "Le mot de passe est requis." };
        }
        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase().trim()
        );
        if (!user) {
          return { ok: false, error: "Aucun compte ne correspond à cet email." };
        }
        if (!user.active) {
          return { ok: false, error: "Ce compte a été désactivé. Contactez un administrateur." };
        }
        set({ currentUser: user, isAuthenticated: true });
        return { ok: true, user };
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      register: (data) => {
        const exists = get().users.some(
          (u) => u.email.toLowerCase() === data.email.toLowerCase().trim()
        );
        if (exists) {
          return { ok: false, error: "Un compte existe déjà avec cet email." };
        }
        const newUser: User = {
          id: uid("u"),
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          role: data.role,
          active: true,
          createdAt: new Date().toISOString(),
        };
        set({ users: [...get().users, newUser] });
        return { ok: true };
      },

      addUser: (data) => {
        const newUser: User = {
          ...data,
          id: uid("u"),
          createdAt: new Date().toISOString(),
        };
        set({ users: [...get().users, newUser] });
      },

      updateUser: (id, data) => {
        set({
          users: get().users.map((u) => (u.id === id ? { ...u, ...data } : u)),
          currentUser:
            get().currentUser?.id === id
              ? { ...get().currentUser!, ...data }
              : get().currentUser,
        });
      },

      deleteUser: (id) => {
        set({ users: get().users.filter((u) => u.id !== id) });
      },

      toggleUserActive: (id) => {
        set({
          users: get().users.map((u) =>
            u.id === id ? { ...u, active: !u.active } : u
          ),
        });
      },
    }),
    {
      name: "vicas-auth-storage",
    }
  )
);
