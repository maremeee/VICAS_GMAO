"use client";

import styles from "./page.module.css";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, HardHat, UserPlus } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { useAuthStore } from "@/lib/auth-store";
import { useToastStore } from "@/lib/toast-store";
import { ROLE_LABELS } from "@/lib/permissions";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { Role } from "@/types";

const ROLES: Role[] = [
  
  "responsable_logistique",
  "chef_atelier",
  "mecanicien",
  "chauffeur",
  "direction",
];

function strengthOf(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "#d2dbf2" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score: 1, label: "Faible", color: "#dc2626" };
  if (score <= 3) return { score: 2, label: "Moyen",  color: "#d97706" };
  return            { score: 3, label: "Fort",   color: "#059669" };
}

export default function RegisterPage() {
  const router    = useRouter();
  const register2 = useAuthStore((s) => s.register);
  const showToast = useToastStore((s) => s.show);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [serverError,  setServerError]  = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      firstName: "", lastName: "", email: "",
      phone: "", password: "", confirmPassword: "", role: "chauffeur",
    },
  });

  const password = watch("password");
  const strength = strengthOf(password || "");

  function onSubmit(data: RegisterInput) {
    setServerError("");
    const result = register2({
      firstName: data.firstName,
      lastName:  data.lastName,
      email:     data.email,
      phone:     data.phone,
      role:      data.role,
    });
    if (!result.ok) {
      setServerError(result.error ?? "Inscription impossible.");
      return;
    }
    showToast("Compte créé avec succès. Vous pouvez vous connecter.", "success");
    router.push("/auth/login");
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>
            <HardHat size={16} color="white" />
          </div>
          <span className={styles.logoName}>VICAS GMAO</span>
        </div>

        <h1 className={styles.heading}>Créer un compte</h1>
        <p className={styles.subText}>
          Renseignez vos informations pour accéder à la plateforme.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.nameGrid}>
            <Field label="Prénom" error={errors.firstName?.message} required>
              <Input placeholder="Moussa" error={!!errors.firstName} {...register("firstName")} />
            </Field>
            <Field label="Nom" error={errors.lastName?.message} required>
              <Input placeholder="Diop" error={!!errors.lastName} {...register("lastName")} />
            </Field>
          </div>

          <Field label="Adresse email" error={errors.email?.message} required>
            <Input type="email" placeholder="nom@vicas.sn" error={!!errors.email} {...register("email")} />
          </Field>

          <Field label="Téléphone" error={errors.phone?.message} required>
            <Input placeholder="77 123 45 67" error={!!errors.phone} {...register("phone")} />
          </Field>

          <Field label="Rôle" error={errors.role?.message} required>
            <Select error={!!errors.role} {...register("role")}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </Select>
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
            {password && (
              <div className="mt-1.5">
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthFill}
                    style={{
                      width: `${(strength.score / 3) * 100}%`,
                      background: strength.color,
                    }}
                  />
                </div>
                <span className="text-xs mt-1 block font-medium" style={{ color: strength.color }}>
                  Sécurité : {strength.label}
                </span>
              </div>
            )}
          </Field>

          <Field label="Confirmer le mot de passe" error={errors.confirmPassword?.message} required>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                error={!!errors.confirmPassword}
                style={{ paddingRight: "2.5rem" }}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#6272a0" }}
                aria-label="Afficher le mot de passe"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
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

          <Button type="submit" variant="orange" className="w-full" disabled={isSubmitting}>
            <UserPlus size={16} />
            Créer mon compte
          </Button>
        </form>

        <p className={styles.footer}>
          Déjà un compte ?{" "}
          <Link href="/auth/login" className={styles.footerLink}>
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  );
}