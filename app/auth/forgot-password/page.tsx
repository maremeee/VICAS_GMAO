"use client";

import styles from "./page.module.css";


import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, MailCheck, Send } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [sent,      setSent]      = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(data: ForgotPasswordInput) {
    setSentEmail(data.email);
    setSent(true);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>

        

        {!sent ? (
          <>
            <h1 className={styles.heading}>Mot de passe oublié</h1>
            <p className={styles.subText}>
              Indiquez votre email, nous vous enverrons un lien de
              réinitialisation.
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

              <Button type="submit" variant="orange" className="w-full" disabled={isSubmitting}>
                <Send size={16} />
                Envoyer le lien
              </Button>
            </form>
          </>
        ) : (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>
              <MailCheck size={26} />
            </div>
            <p className={styles.successTitle}>Email envoyé</p>
            <p className={styles.successText}>
              Si un compte existe pour{" "}
              <strong style={{ color: "#0e2154" }}>{sentEmail}</strong>,
              un lien de réinitialisation du mot de passe vient de lui être envoyé.
            </p>
          </div>
        )}

        <Link href="/auth/login" className={styles.backLink}>
          <ArrowLeft size={14} />
          Retour à la connexion
        </Link>

      </div>
    </div>
  );
}