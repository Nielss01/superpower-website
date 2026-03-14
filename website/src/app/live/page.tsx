"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import OrgBlob from "@/components/design/OrgBlob";
import { C, GRAD, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { saveProfileToSupabase } from "@/lib/supabase/profile-queries";
import type { ProfileData } from "@/lib/types";
import { EMPTY_PROFILE } from "@/lib/types";

// ── Animation ease ───────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const;

// ══════════════════════════════════════════════════════════════════════════════
// CANVAS CONFETTI — high-performance particle system
// ══════════════════════════════════════════════════════════════════════════════
const CONFETTI_PALETTE = [
  C.greenBr, C.greenLt, C.oceanBr, C.oceanLt,
  C.orange, C.orangeBr, C.pinkBr, C.pinkLt,
  "#FFD700", "#FF6B6B", "#A78BFA", C.white,
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  gravity: number;
  drag: number;
  wobble: number;
  wobbleSpeed: number;
  wobblePhase: number;
  shape: "rect" | "circle" | "star" | "streamer";
  life: number;
  maxLife: number;
}

function createParticle(
  originX: number,
  originY: number,
  angleRange: [number, number],
  speedRange: [number, number],
): Particle {
  const angle = angleRange[0] + Math.random() * (angleRange[1] - angleRange[0]);
  const speed = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
  const shapes: Particle["shape"][] = ["rect", "rect", "circle", "star", "streamer", "rect"];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];

  return {
    x: originX + (Math.random() - 0.5) * 20,
    y: originY + (Math.random() - 0.5) * 10,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.3,
    width: shape === "streamer" ? 3 + Math.random() * 2 : 5 + Math.random() * 8,
    height: shape === "streamer" ? 14 + Math.random() * 16 : shape === "circle" ? 0 : 3 + Math.random() * 5,
    color: CONFETTI_PALETTE[Math.floor(Math.random() * CONFETTI_PALETTE.length)],
    opacity: 1,
    gravity: 0.12 + Math.random() * 0.08,
    drag: 0.98 + Math.random() * 0.015,
    wobble: 0,
    wobbleSpeed: 0.03 + Math.random() * 0.06,
    wobblePhase: Math.random() * Math.PI * 2,
    shape,
    life: 0,
    maxLife: 120 + Math.random() * 100,
  };
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.opacity;

  ctx.fillStyle = p.color;

  switch (p.shape) {
    case "rect":
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      break;
    case "circle":
      ctx.beginPath();
      ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "star": {
      const r = p.width / 2;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const method = i === 0 ? "moveTo" : "lineTo";
        ctx[method](Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "streamer":
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      // Add a slight curl
      ctx.fillStyle = p.color + "80";
      ctx.fillRect(-p.width / 2 + 1, -p.height / 2, p.width - 2, p.height * 0.3);
      break;
  }

  ctx.restore();
}

function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const burstsQueued = useRef<{ time: number; originX: number; originY: number; count: number; angle: [number, number]; speed: [number, number] }[]>([]);
  const startTime = useRef(0);

  const fire = useCallback((
    originX: number,
    originY: number,
    count: number,
    angleRange: [number, number] = [-Math.PI * 0.8, -Math.PI * 0.2],
    speedRange: [number, number] = [6, 18],
  ) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(createParticle(originX, originY, angleRange, speedRange));
    }
  }, []);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    startTime.current = performance.now();
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Schedule burst waves
    burstsQueued.current = [
      // Wave 1: center cannon — immediate
      { time: 0, originX: w * 0.5, originY: h * 0.6, count: 60, angle: [-Math.PI * 0.85, -Math.PI * 0.15], speed: [8, 20] },
      // Wave 2: left side
      { time: 300, originX: w * 0.2, originY: h * 0.7, count: 35, angle: [-Math.PI * 0.75, -Math.PI * 0.1], speed: [6, 16] },
      // Wave 3: right side
      { time: 500, originX: w * 0.8, originY: h * 0.7, count: 35, angle: [-Math.PI * 0.9, -Math.PI * 0.25], speed: [6, 16] },
      // Wave 4: gentle center rain
      { time: 1200, originX: w * 0.5, originY: -20, count: 40, angle: [Math.PI * 0.3, Math.PI * 0.7], speed: [2, 5] },
      // Wave 5: final pop
      { time: 2200, originX: w * 0.5, originY: h * 0.45, count: 50, angle: [0, Math.PI * 2], speed: [4, 12] },
    ];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsed = performance.now() - startTime.current;

      // Fire queued bursts
      burstsQueued.current = burstsQueued.current.filter((b) => {
        if (elapsed >= b.time) {
          fire(b.originX, b.originY, b.count, b.angle, b.speed);
          return false;
        }
        return true;
      });

      // Update & draw
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;

        // Wobble
        p.wobble = Math.sin(p.wobblePhase + p.life * p.wobbleSpeed) * 2;
        p.x += p.vx + p.wobble;
        p.y += p.vy;

        p.rotation += p.rotationSpeed;

        // Fade out in last 30% of life
        const fadeStart = p.maxLife * 0.7;
        if (p.life > fadeStart) {
          p.opacity = 1 - (p.life - fadeStart) / (p.maxLife * 0.3);
        }

        if (p.life >= p.maxLife || p.opacity <= 0) return false;

        drawParticle(ctx, p);
        return true;
      });

      // Keep animating if there are particles or pending bursts
      if (particlesRef.current.length > 0 || burstsQueued.current.length > 0) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      particlesRef.current = [];
    };
  }, [active, fire]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 60,
        pointerEvents: "none",
      }}
    />
  );
}

// ── Animated ring pulse (behind Google button) ──────────────────────────────
function PulseRing() {
  return (
    <motion.div
      animate={{
        scale: [1, 1.5, 2],
        opacity: [0.3, 0.1, 0],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      style={{
        position: "absolute",
        inset: -8,
        borderRadius: "999px",
        border: `2px solid ${C.greenBr}`,
        pointerEvents: "none",
      }}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LIVE PAGE — /live — Celebration → Login Gate → Share
// ══════════════════════════════════════════════════════════════════════════════
type Phase = "celebrate" | "login" | "claimed";

export default function LivePage() {
  const [lang, setLang] = useState<Lang>("sa");
  const [profileName, setProfileName] = useState("");
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("celebrate");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sph-lang") as Lang | null;
    if (saved === "en" || saved === "sa") setLang(saved);

    try {
      const raw = localStorage.getItem("sph-profile");
      if (raw) {
        const data = JSON.parse(raw);
        setProfileName(data.name || "");
        setSlug(data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "my-superpower");
      }
    } catch {}

    // Check Supabase session (covers return from Google OAuth redirect)
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        localStorage.setItem("sph-claimed", "google");
        setPhase("claimed");
        setShowConfetti(false);
        setTimeout(() => setShowConfetti(true), 50);

        // Save profile to Supabase
        try {
          const raw = localStorage.getItem("sph-profile");
          if (raw) {
            const profileData = { ...EMPTY_PROFILE, ...JSON.parse(raw) } as ProfileData;
            const savedLang = localStorage.getItem("sph-lang") || "en";
            const result = await saveProfileToSupabase(profileData, savedLang);
            if (result?.slug) {
              setSlug(result.slug);
            }
          }
        } catch (e) {
          console.error("Failed to save profile to Supabase:", e);
        }
      } else {
        const claimed = localStorage.getItem("sph-claimed");
        if (claimed) setPhase("claimed");
      }
    });
  }, []);

  // Start confetti immediately and auto-transition phases
  useEffect(() => {
    if (!mounted) return;
    if (phase === "celebrate") {
      setShowConfetti(true);
      const timer = setTimeout(() => setPhase("login"), 4000);
      return () => clearTimeout(timer);
    }
  }, [phase, mounted]);

  const t = LANG[lang];
  const shareUrl = `superpowers.org/s/${slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${shareUrl}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const supabaseAvailable = !!createClient();

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    if (!supabase) {
      // No Supabase — skip to claimed
      setPhase("claimed");
      return;
    }
    setIsSigningIn(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/live`,
      },
    });
  };

  const handleSkip = () => {
    setPhase("claimed");
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.navy,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      {/* Canvas confetti */}
      <ConfettiCanvas active={showConfetti} />

      {/* Background blobs */}
      <div style={{ position: "absolute", top: -80, left: -100, width: 400, opacity: 0.08, pointerEvents: "none" }}>
        <OrgBlob variant={1} color={C.greenBr} />
      </div>
      <div style={{ position: "absolute", bottom: -60, right: -80, width: 350, opacity: 0.06, pointerEvents: "none" }}>
        <OrgBlob variant={2} color={C.pinkBr} />
      </div>
      <div style={{ position: "absolute", top: "30%", right: -40, width: 250, opacity: 0.05, pointerEvents: "none" }}>
        <OrgBlob variant={3} color={C.oceanBr} />
      </div>

      {/* Subtle gradient orb */}
      <div
        style={{
          position: "absolute",
          width: 500, height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.greenBr}15 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ── Main content — phases ─────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* ── PHASE 1: Celebration ──────────────────────────────── */}
        {phase === "celebrate" && (
          <motion.div
            key="celebrate"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.8, ease }}
            style={{
              textAlign: "center",
              maxWidth: "480px",
              position: "relative",
              zIndex: 10,
            }}
          >
            {/* Lightning bolt */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
              style={{ fontSize: "64px", marginBottom: "20px" }}
            >
              ⚡
            </motion.div>

            <h1
              style={{
                fontFamily: FONT.serif,
                fontSize: "clamp(36px, 7vw, 52px)",
                fontWeight: 400,
                color: C.white,
                lineHeight: 1.05,
                margin: "0 0 16px",
              }}
            >
              {lang === "sa" ? "Jou Superpower is live!" : "Your Superpower is live!"}
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                fontFamily: FONT.sans,
                fontSize: "16px",
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {profileName && (
                <span style={{ color: C.greenLt, fontWeight: 500 }}>{profileName}</span>
              )}
              {lang === "sa"
                ? ", jou besigheidsprofiel is nou lewendig."
                : ", your business profile is now live."}
            </motion.p>

            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginTop: "40px",
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                  style={{
                    width: 6, height: 6,
                    borderRadius: "50%",
                    background: C.greenBr,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ── PHASE 2: Login Gate ───────────────────────────────── */}
        {phase === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.6, ease }}
            style={{
              textAlign: "center",
              maxWidth: "420px",
              position: "relative",
              zIndex: 10,
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
              style={{
                width: 72, height: 72,
                borderRadius: "20px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: "32px",
                backdropFilter: "blur(20px)",
              }}
            >
              🔐
            </motion.div>

            <h2
              style={{
                fontFamily: FONT.serif,
                fontSize: "clamp(26px, 5vw, 34px)",
                fontWeight: 400,
                color: C.white,
                lineHeight: 1.15,
                margin: "0 0 10px",
              }}
            >
              {t.login_claim}
            </h2>

            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: "14px",
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.6,
                margin: "0 0 32px",
              }}
            >
              {t.login_sub}
            </p>

            {/* Google sign-in button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ position: "relative", display: "inline-flex" }}
            >
              <PulseRing />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  width: "100%",
                  minWidth: "300px",
                  padding: "16px 32px",
                  borderRadius: "999px",
                  background: C.white,
                  color: C.ink,
                  fontFamily: FONT.sans,
                  fontSize: "15px",
                  fontWeight: 600,
                  border: "none",
                  cursor: isSigningIn ? "wait" : "pointer",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)",
                  opacity: isSigningIn ? 0.7 : 1,
                  transition: "opacity 200ms",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {isSigningIn ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: 20, height: 20,
                      borderRadius: "50%",
                      border: `2.5px solid ${C.sandLt}`,
                      borderTopColor: C.green,
                    }}
                  />
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {t.login_google}
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Skip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ marginTop: "20px" }}
            >
              <button
                onClick={handleSkip}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: FONT.sans,
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textDecorationColor: "rgba(255,255,255,0.15)",
                  textUnderlineOffset: "3px",
                }}
              >
                {t.login_skip}
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{
                fontFamily: FONT.sans,
                fontSize: "11px",
                color: "rgba(255,255,255,0.2)",
                lineHeight: 1.5,
                marginTop: "28px",
                maxWidth: "280px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {t.login_why}
            </motion.p>
          </motion.div>
        )}

        {/* ── PHASE 3: Claimed — Share + View ───────────────────── */}
        {phase === "claimed" && (
          <motion.div
            key="claimed"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease }}
            style={{
              textAlign: "center",
              maxWidth: "480px",
              position: "relative",
              zIndex: 10,
            }}
          >
            {/* Checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              style={{
                width: 64, height: 64,
                borderRadius: "50%",
                background: GRAD.flow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                boxShadow: `0 8px 32px ${C.greenBr}40`,
              }}
            >
              <motion.svg width="28" height="28" viewBox="0 0 24 24">
                <motion.path
                  d="M5 13l4 4L19 7"
                  stroke={C.white}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                />
              </motion.svg>
            </motion.div>

            <h1
              style={{
                fontFamily: FONT.serif,
                fontSize: "clamp(28px, 5.5vw, 40px)",
                fontWeight: 400,
                color: C.white,
                lineHeight: 1.1,
                margin: "0 0 12px",
              }}
            >
              {lang === "sa" ? "Jou Superpower is live!" : "Your Superpower is live!"}
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                fontFamily: FONT.sans,
                fontSize: "14px",
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.6,
                margin: "0 0 28px",
              }}
            >
              {profileName && (
                <span style={{ color: C.greenLt, fontWeight: 500 }}>{profileName}</span>
              )}
              {lang === "sa"
                ? ", deel jou profiel met die wêreld."
                : ", share your profile with the world."}
            </motion.p>

            {/* Shareable URL box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                marginBottom: "24px",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                style={{
                  flex: 1,
                  fontFamily: FONT.sans,
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.8)",
                  textAlign: "left",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: C.greenBr, fontWeight: 600 }}>superpowers.org</span>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>/s/{slug}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyLink}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: copied ? C.green : "rgba(255,255,255,0.15)",
                  color: C.white,
                  fontFamily: FONT.sans,
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 200ms",
                  flexShrink: 0,
                }}
              >
                {copied
                  ? (lang === "sa" ? "Gekopieer!" : "Copied!")
                  : (lang === "sa" ? "Kopieer" : "Copy")}
              </motion.button>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <Link
                href={`/s/${slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "16px 28px",
                  borderRadius: "999px",
                  background: GRAD.flow,
                  color: C.white,
                  fontFamily: FONT.sans,
                  fontSize: "15px",
                  fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: "0 6px 24px rgba(34,160,107,0.35)",
                }}
              >
                ⚡ {lang === "sa" ? "Sien my Superpower" : "View my Superpower"}
              </Link>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  lang === "sa"
                    ? `Kyk na my Superpower profiel! 🔥 https://${shareUrl}`
                    : `Check out my Superpower profile! 🔥 https://${shareUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "14px 28px",
                  borderRadius: "999px",
                  background: "transparent",
                  color: C.white,
                  fontFamily: FONT.sans,
                  fontSize: "14px",
                  fontWeight: 500,
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                {lang === "sa" ? "Deel op WhatsApp" : "Share on WhatsApp"}
              </a>
            </motion.div>

            {/* Navigation links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              style={{ marginTop: "28px", display: "flex", gap: "20px", justifyContent: "center" }}
            >
              <Link
                href="/build"
                style={{
                  fontFamily: FONT.sans,
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                }}
              >
                ← {lang === "sa" ? "Terug na chat" : "Back to chat"}
              </Link>
              <Link
                href="/"
                style={{
                  fontFamily: FONT.sans,
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.35)",
                  textDecoration: "none",
                }}
              >
                {lang === "sa" ? "Tuisblad" : "Home"}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer brand */}
      <div
        style={{
          position: "absolute",
          bottom: "24px",
          fontFamily: FONT.sans,
          fontSize: "10px",
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.04em",
          zIndex: 5,
        }}
      >
        Built with <span style={{ color: C.greenBr }}>Superpowers</span>
      </div>
    </div>
  );
}
