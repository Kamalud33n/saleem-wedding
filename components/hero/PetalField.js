"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { petalCounts } from "@/lib/hero-motion";

function buildPetals(sources, count) {
  return Array.from({ length: count }, (_, i) => {
    const src = sources[i % sources.length];
    const left = 2 + ((i * 13 + 5) % 94);
    const size = 14 + (i % 6) * 4;
    const duration = 10 + (i % 7) * 1.7;
    // Stagger only — no global gate. First petals start at 0s.
    const delay = (i % 5) * 0.12;
    const drift = (i % 2 === 0 ? 1 : -1) * (16 + (i % 5) * 8);
    const rotate = (i % 2 === 0 ? 1 : -1) * (110 + i * 18);
    // Seed some petals already on-screen so they appear with the Hero.
    const startY = `${-8 + ((i * 23) % 55)}vh`;
    const startOpacity = 0.35 + (i % 3) * 0.12;
    return {
      id: i,
      src,
      left,
      size,
      duration,
      delay,
      drift,
      rotate,
      startY,
      startOpacity,
      opacity: 0.55 + (i % 4) * 0.1,
    };
  });
}

/** Soft petal field — own layer; starts immediately with the Hero (no gate delay). */
export default function PetalField({ sources = [], phase = "idle" }) {
  const reduce = useReducedMotion();
  const maxCount = Math.max(petalCounts.revealing, petalCounts.settled);
  const count = petalCounts[phase] ?? 0;
  const petals = useMemo(
    () => buildPetals(sources, maxCount),
    [sources, maxCount]
  );

  if (reduce || count === 0 || !sources.length) return null;

  const visible = petals.slice(0, count);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[35] overflow-hidden"
      aria-hidden="true"
    >
      {visible.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[-10%]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            willChange: "transform, opacity",
          }}
          initial={{
            y: p.startY,
            x: 0,
            rotate: p.rotate * 0.15,
            opacity: p.startOpacity,
          }}
          animate={{
            y: [p.startY, "115vh"],
            x: [0, p.drift, p.drift * -0.35, p.drift * 0.5],
            rotate: [p.rotate * 0.15, p.rotate * 0.5, p.rotate],
            opacity: [p.startOpacity, p.opacity, p.opacity * 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.src}
            alt=""
            draggable={false}
            className="h-full w-full object-contain"
          />
        </motion.span>
      ))}
    </div>
  );
}
