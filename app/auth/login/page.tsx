"use client";

import styles from "./page.module.css";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { useAuthStore } from "@/lib/auth-store";
import { ROLE_DEFAULT_PAGE, ROLE_LABELS } from "@/lib/permissions";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { MOCK_USERS } from "@/lib/mock-data";
import type { Role } from "@/types";

const DEMO_ROLE_COLORS: Record<Role, string> = {
  administrateur:         "#f97316",
  responsable_logistique: "#2251d9",
  chef_atelier:           "#7c3aed",
  mecanicien:             "#475569",
  chauffeur:              "#059669",
  direction:              "#d97706",
};

export default function LoginPage() {
  const router = useRouter();
  const login  = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError,  setServerError]  = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // ✅ async + await
  async function onSubmit(data: LoginInput) {
    setServerError("");
    const result = await login(data.email, data.password);
    if (!result.ok) {
      setServerError(result.error ?? "Connexion impossible.");
      return;
    }
    // ✅ récupérer l'user depuis le store après connexion
    const currentUser = useAuthStore.getState().currentUser;
    if (currentUser) {
      router.push(ROLE_DEFAULT_PAGE[currentUser.role as Role]);
    }
  }

  function quickFill(email: string) {
    setValue("email", email);
    setValue("password", "demo1234");
    setServerError("");
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>

      

<div className={styles.logoRow}>
  <Image
    src="/logo.png"
    alt="VICAS GMAO"
    width={120}
    height={40}
    style={{ objectFit: "contain" }}
  />
</div>
        <h1 className={styles.heading}>Connexion</h1>
        <p className={styles.subText}>
          Accédez à votre espace de gestion de flotte.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Field label="Adresse email" error={errors.email?.message} required>
            <Input
              type="email"
              placeholder="nom@vicas.sn"
              error={!!errors.email}
              {...register("email")}
            />
          </Field>

          <Field label="Mot de passe" error={errors.password?.message} required>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                error={!!errors.password}
                style={{ paddingRight: "2.5rem" }}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#6272a0" }}
                aria-label="Afficher le mot de passe"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {serverError && (
            <div
              className="text-sm rounded-lg px-3 py-2 mb-4"
              style={{ background: "rgba(239,68,68,0.10)", color: "#dc2626" }}
            >
              {serverError}
            </div>
          )}

          <div className={styles.forgotRow}>
            <Link href="/auth/forgot-password" className={styles.forgotLink}>
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" variant="orange" className="w-full" disabled={isSubmitting}>
            <LogIn size={16} />
            Se connecter
          </Button>
        </form>

        <p className={styles.footer}>
          Pas encore de compte ?{" "}
          <Link href="/auth/register" className={styles.footerLink}>
            Créer un compte
          </Link>
        </p>

        <div className={styles.demoSection}>
          <p className={styles.demoTitle}>Comptes de démonstration</p>
          <div className={styles.demoGrid}>
            {MOCK_USERS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => quickFill(u.email)}
                className={styles.demoBtn}
              >
                <div
                  className={styles.demoDot}
                  style={{ background: DEMO_ROLE_COLORS[u.role] }}
                />
                <span className={styles.demoRole}>{ROLE_LABELS[u.role]}</span>
                <span className={styles.demoEmail}>{u.email}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}