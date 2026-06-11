"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, PartyPopper, Sparkles } from "lucide-react";

// Qipi brand palette (cyan-based) + warm accents for pop
const CONFETTI_COLORS = [
  "hsl(186 75% 28%)", // primary
  "hsl(186 55% 48%)", // primary light
  "hsl(186 70% 65%)", // cyan soft
  "hsl(168 70% 45%)", // teal
  "hsl(45 95% 58%)", // gold
  "hsl(0 0% 100%)", // white
];

// Deterministic pseudo-random so SSR/CSR match (no Math.random in render path issues)
function rand(seed: number) {
  const x = Math.sin(seed * 99991.3) * 10000;
  return x - Math.floor(x);
}

const PIECES = Array.from({ length: 80 }, (_, i) => {
  const left = rand(i + 1) * 100;
  const delay = rand(i + 2) * 0.6;
  const duration = 2.4 + rand(i + 3) * 1.8;
  const size = 6 + rand(i + 4) * 10;
  const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
  const rotate = rand(i + 5) * 720 - 360;
  const drift = rand(i + 6) * 120 - 60;
  const round = rand(i + 7) > 0.5;
  return { left, delay, duration, size, color, rotate, drift, round };
});

export default function CelebrationOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Confetti layer */}
          <div className="pointer-events-none absolute inset-0">
            {PIECES.map((p, i) => (
              <motion.span
                key={i}
                className="absolute top-[-5%]"
                style={{
                  left: `${p.left}%`,
                  width: p.size,
                  height: p.round ? p.size : p.size * 0.5,
                  borderRadius: p.round ? "9999px" : "2px",
                  backgroundColor: p.color,
                }}
                initial={{ y: "-10vh", x: 0, opacity: 0, rotate: 0 }}
                animate={{
                  y: "110vh",
                  x: p.drift,
                  opacity: [0, 1, 1, 0.9],
                  rotate: p.rotate,
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeIn",
                  repeat: Infinity,
                  repeatDelay: 0.2,
                }}
              />
            ))}
          </div>

          {/* Card */}
          <motion.div
            className="relative mx-4 w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-2xl ring-1 ring-primary/10"
            initial={{ scale: 0.7, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          >
            {/* Glow ring behind icon */}
            <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/15"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [0.6, 1.3, 1], opacity: [0, 0.8, 0.5] }}
                transition={{ duration: 1.2, delay: 0.2 }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/10"
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.3 }}
              >
                <CheckCircle2 className="h-11 w-11" strokeWidth={2.5} />
              </motion.div>

              {/* Sparkles around icon */}
              <motion.div
                className="absolute -right-1 -top-1 text-[hsl(45_95%_58%)]"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: 1, rotate: [0, 20, 0] }}
                transition={{ duration: 0.8, delay: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
              >
                <Sparkles className="h-5 w-5" />
              </motion.div>
              <motion.div
                className="absolute -bottom-1 -left-2 text-primary"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1, 0.9], opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8, repeat: Infinity, repeatDelay: 1.8 }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
                <PartyPopper className="h-6 w-6 text-primary" />
                ¡Asamblea finalizada!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                El acta fue generada con éxito. ¡Excelente trabajo del equipo!
              </p>
            </motion.div>

            <motion.button
              onClick={onClose}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Continuar
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
