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

const COLORS = ["text-vermilion", "text-vermilion/80", "text-marigold-dark", "text-[#d89b8a]"];

function makeSideHearts(side, count) {
  const dir = side === "left" ? 1 : -1;
  return Array.from({ length: count }, (_, i) => {
    const t = i / Math.max(1, count - 1);
    return {
      id: `${side}-${i}`,
      side,
      // Start just off the side edge
      startX: dir * -(8 + (i % 5) * 4),
      // Travel toward center + beyond slightly
      endX: dir * (42 + t * 95 + (i % 4) * 18),
      startY: -20 + (i % 7) * 12,
      endY: -55 + (i % 9) * 18 + (i % 3) * 8,
      scale: 0.45 + (i % 5) * 0.18,
      rotate: dir * (12 + (i % 6) * 14),
      delay: (i % 8) * 0.035,
      duration: 1.35 + (i % 5) * 0.12,
      color: COLORS[i % COLORS.length],
    };
  });
}

/**
 * Dual-origin heart celebration — left + right emitters after all three reveals.
 */
export default function HeartCelebration({ active = false }) {
  const reduce = useReducedMotion();
  const hearts = useMemo(() => {
    // ~44 total — abundant on mobile without flooding the date
    return [...makeSideHearts("left", 22), ...makeSideHearts("right", 22)];
  }, []);

  if (!active) return null;

  if (reduce) {
    return (
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center" aria-hidden="true">
        <span className="text-vermilion/50">
          <HeartIcon className="h-8 w-8" />
        </span>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden="true">
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          className={`absolute top-1/2 ${h.color} ${
            h.side === "left" ? "left-0" : "right-0"
          }`}
          style={{
            width: `${16 * h.scale}px`,
            height: `${16 * h.scale}px`,
            marginTop: -8 * h.scale,
            ...(h.side === "left"
              ? { marginLeft: -4 }
              : { marginRight: -4 }),
          }}
          initial={{
            opacity: 0,
            x: h.startX,
            y: h.startY,
            scale: 0.15,
            rotate: 0,
          }}
          animate={{
            opacity: [0, 0.95, 0.85, 0],
            x: [h.startX, h.endX * 0.55, h.endX],
            y: [h.startY, h.endY - 18, h.endY + 28],
            scale: [0.15, h.scale * 1.15, h.scale * 0.55],
            rotate: [0, h.rotate * 0.6, h.rotate],
          }}
          transition={{
            duration: h.duration,
            delay: 0.12 + h.delay,
            ease: ease.out,
          }}
        >
          <HeartIcon className="h-full w-full" />
        </motion.span>
      ))}
    </div>
  );
}
