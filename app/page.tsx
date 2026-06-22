"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HardHat,
  Truck,
  Wrench,
  Fuel,
  MapPin,
  Bell,
  ArrowRight,
  ClipboardList,
  BarChart3,
  Shield,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { ROLE_DEFAULT_PAGE } from "@/lib/permissions";
import { Button } from "@/components/ui/Button";
import styles from "./landing.module.css";

const FEATURES = [
  {
    icon: <Truck size={18} />,
    label: "Parc d'engins",
    desc: "Suivi complet de chaque véhicule",
    bg: "rgba(14,33,84,0.09)",
    fg: "var(--navy)",
  },
  {
    icon: <Wrench size={18} />,
    label: "Maintenance",
    desc: "Bons de travail et historique",
    bg: "rgba(34,81,217,0.10)",
    fg: "var(--brand)",
  },
  {
    icon: <Fuel size={18} />,
    label: "Carburant",
    desc: "Consommation et coûts",
    bg: "rgba(249,115,22,0.10)",
    fg: "var(--accent)",
  },
  {
    icon: <MapPin size={18} />,
    label: "Logistique",
    desc: "Missions et chantiers",
    bg: "rgba(5,150,105,0.10)",
    fg: "var(--success)",
  },
  {
    icon: <Bell size={18} />,
    label: "Alertes",
    desc: "Échéances et anomalies",
    bg: "rgba(220,38,38,0.09)",
    fg: "var(--critical)",
  },
  {
    icon: <BarChart3 size={18} />,
    label: "Rapports",
    desc: "Analyses et indicateurs",
    bg: "rgba(124,58,237,0.09)",
    fg: "#7c3aed",
  },
  {
    icon: <ClipboardList size={18} />,
    label: "Bons de travail",
    desc: "Suivi des interventions",
    bg: "rgba(217,119,6,0.10)",
    fg: "var(--warning)",
  },
  {
    icon: <Shield size={18} />,
    label: "Rôles & droits",
    desc: "6 profils d'accès métier",
    bg: "rgba(8,18,62,0.09)",
    fg: "var(--navy)",
  },
];

const STATS = [
  { value: "9+", label: "Types d'engins" },
  { value: "6", label: "Rôles utilisateurs" },
  { value: "100%", label: "Données locales" },
  { value: "∞", label: "Chantiers gérés" },
];

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useAuthStore();

  /* Si déjà connecté → dashboard directement */
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      router.replace(ROLE_DEFAULT_PAGE[currentUser.role]);
    }
  }, [isAuthenticated, currentUser, router]);

  /* Afficher un loader pendant la vérification d'auth */
  if (isAuthenticated && currentUser) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <div className={styles.navLogoIcon}>
            <HardHat size={18} color="white" />
          </div>
          <div>
            <p className={styles.navLogoName}>VICAS GMAO</p>
            <p className={styles.navLogoSub}>Gestion de Parc &amp; Maintenance</p>
          </div>
        </div>
        <div className={styles.navActions}>
          <Link href="/auth/login">
            <Button variant="outline">Se connecter</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="orange">
              Créer un compte
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBlobTop} />
        <div className={styles.heroBlobBottom} />

        <div className={styles.heroTag}>
          <HardHat size={12} />
          Plateforme GMAO BTP
        </div>

        <h1 className={styles.heroTitle}>
          Pilotez votre flotte{" "}
          <span className={styles.heroTitleAccent}>en toute sérénité</span>
        </h1>

        <p className={styles.heroSub}>
          Suivi des engins, maintenance, carburant et missions sur l&apos;ensemble
          de vos chantiers — en un seul espace, accessible à toute votre équipe.
        </p>

        <div className={styles.heroActions}>
          <Link href="/auth/register">
            <Button variant="orange">
              Créer un compte gratuitement
              <ArrowRight size={15} />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline">
              J&apos;ai déjà un compte
            </Button>
          </Link>
        </div>

        {/* Feature cards */}
        <div className={styles.features}>
          {FEATURES.map((f) => (
            <div key={f.label} className={styles.featureCard}>
              <div
                className={styles.featureIcon}
                style={{ background: f.bg, color: f.fg }}
              >
                {f.icon}
              </div>
              <p className={styles.featureLabel}>{f.label}</p>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats banner ── */}
      <div className={styles.stats}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.statItem}>
            <p className={styles.statValue}>{s.value}</p>
            <p className={styles.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <section
        style={{
          padding: "3.5rem 2rem",
          textAlign: "center",
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--foreground)",
            marginBottom: "0.75rem",
          }}
        >
          Prêt à démarrer ?
        </h2>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--muted)",
            marginBottom: "1.75rem",
          }}
        >
          Créez votre compte administrateur et invitez votre équipe en quelques minutes.
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.875rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/auth/register">
            <Button variant="orange">
              Créer un compte
              <ArrowRight size={15} />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="primary">Se connecter</Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p className={styles.footerLeft}>
          © {new Date().getFullYear()} VICAS GMAO — Tous droits réservés
        </p>
        <div className={styles.footerRight}>
          <Link href="/auth/login" className={styles.footerLink}>
            Connexion
          </Link>
          <Link href="/auth/register" className={styles.footerLink}>
            Inscription
          </Link>
        </div>
      </footer>
    </div>
  );
}
