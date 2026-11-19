"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ease } from "@/lib/motion";

function HeartIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 21s-6.7-4.35-9.33-7.7C.5 10.5 1.2 6.8 4.2 5.3c1.9-.95 4.1-.35 5.4 1.25L12 9l2.4-2.45c1.3-1.6 3.5-2.2 5.4-1.25 3 1.5 3.7 5.2 1.53 7.99C18.7 16.65 12 21 12 21z" />
    </svg>
  );
}

const COLORS = [
  "text-vermilion",
  "text-vermilion/85",
  "text-marigold-dark",
  "text-peacock/70",
];

/**
 * Hearts rise from the Send Love button — short, elegant, invitation-appropriate.
 */
export default function SendLoveCelebration({ active = false }) {
  const reduce = useReducedMotion();

  const hearts = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        id: i,
        x: (i - 4) * 14 + (i % 2 ? 6 : -4),
        y: -18 - (i % 4) * 22,
        scale: 0.35 + (i % 3) * 0.14,
        delay: i * 0.06,
        duration: 1.05 + (i % 3) * 0.12,
        color: COLORS[i % COLORS.length],
      })),
    []
  );

  if (!active) return null;

  if (reduce) {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="text-vermilion/60">
          <HeartIcon className="h-9 w-9" />
        </span>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      aria-hidden="true"
    >
      <motion.span
        className="absolute bottom-[3.25rem] left-1/2 text-vermilion"
        style={{ width: 28, height: 28, marginLeft: -14 }}
        initial={{ opacity: 0, scale: 0.4, y: 0 }}
        animate={{
          opacity: [0, 1, 0.9, 0],
          scale: [0.4, 1.15, 0.95, 0.5],
          y: [0, -36, -72, -96],
        }}
        transition={{ duration: 1.15, ease: ease.out }}
      >
        <HeartIcon className="h-full w-full drop-shadow-[0_2px_8px_rgba(196,75,58,0.35)]" />
      </motion.span>

      <motion.span
        className="absolute bottom-[3.25rem] left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-marigold/25"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.55, 0], scale: [0.6, 1.6, 2] }}
        transition={{ duration: 0.9, ease: ease.out }}
      />

      {hearts.map((h) => (
        <motion.span
          key={h.id}
          className={`absolute bottom-[3.25rem] left-1/2 ${h.color}`}
          style={{
            width: `${18 * h.scale}px`,
            height: `${18 * h.scale}px`,
            marginLeft: `${-9 * h.scale}px`,
          }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.2 }}
          animate={{
            opacity: [0, 0.9, 0.7, 0],
            x: [0, h.x * 0.5, h.x],
            y: [0, h.y * 0.45, h.y],
            scale: [0.2, h.scale * 1.1, h.scale * 0.6],
          }}
          transition={{
            duration: h.duration,
            delay: 0.08 + h.delay,
            ease: ease.out,
          }}
        >
          <HeartIcon className="h-full w-full" />
        </motion.span>
      ))}
    </div>
  );
}
