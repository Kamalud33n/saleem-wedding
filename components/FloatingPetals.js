"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const PETAL_COUNT = 14;

function PetalShape({ variant }) {
  if (variant === 1) {
    return (
      <svg viewBox="0 0 20 28" className="h-full w-full" aria-hidden="true">
        <path
          d="M10 1C14 7 18 12 17 18c-1 5-4 8-7 9-3-1-6-4-7-9C2 12 6 7 10 1z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (variant === 2) {
    return (
      <svg viewBox="0 0 18 26" className="h-full w-full" aria-hidden="true">
        <path
          d="M9 0c5 6 8 11 8 16 0 5-3 8-8 10C4 24 1 21 1 16 1 11 4 6 9 0z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 22 18" className="h-full w-full" aria-hidden="true">
      <path
        d="M1 9c4-7 8-8 10-8s6 1 10 8c-4 7-8 8-10 8S5 16 1 9z"
        fill="currentColor"
      />
    </svg>
  );
}

function makePetals() {
  return Array.from({ length: PETAL_COUNT }, (_, i) => {
    const left = 4 + ((i * 17) % 92);
    const size = 10 + (i % 5) * 2.2;
    const duration = 16 + (i % 6) * 2.4;
    const delay = (i * 1.1) % 10;
    const drift = (i % 2 === 0 ? 1 : -1) * (18 + (i % 4) * 8);
    const color = ["#b23a2e", "#e8a93c", "#d89b8a", "#c9923a"][i % 4];
    return {
      id: i,
      left,
      size,
      duration,
      delay,
      drift,
      color,
      opacity: 0.18 + (i % 4) * 0.04,
      variant: i % 3,
      rotate: (i % 2 === 0 ? 1 : -1) * (120 + i * 17),
    };
  });
}

/** Lightweight SVG petal ambience — no particles.js (safer on iOS). */
export default function FloatingPetals({ active = true }) {
  const reduce = useReducedMotion();
  const petals = useMemo(() => makePetals(), []);

  if (reduce || !active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
      aria-hidden="true"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {petals.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[-8%]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.35,
            color: p.color,
            opacity: p.opacity,
            willChange: "transform, opacity",
          }}
          initial={{ y: "-10vh", x: 0, rotate: 0 }}
          animate={{
            y: ["-10vh", "110vh"],
            x: [0, p.drift, p.drift * -0.4, p.drift * 0.6],
            rotate: [0, p.rotate * 0.5, p.rotate],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <PetalShape variant={p.variant} />
        </motion.span>
      ))}
    </div>
  );
}
