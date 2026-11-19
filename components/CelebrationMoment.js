"use client";

import { motion, useReducedMotion } from "framer-motion";
import { duration, ease, viewportOnce } from "@/lib/motion";

/** One-time soft celebration bloom — not confetti spam. */
export default function CelebrationMoment({ active = false, children, className = "" }) {
  const reduce = useReducedMotion();

  return (
    <div className={`relative ${className}`}>
      {!reduce && active && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {[...Array(10)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full"
              style={{
                left: `${12 + (i * 9) % 76}%`,
                top: "55%",
                background: i % 2 === 0 ? "#e8a93c" : "#b23a2e",
              }}
              initial={{ opacity: 0, y: 0, scale: 0.4 }}
              animate={{
                opacity: [0, 0.7, 0],
                y: [-10, -70 - (i % 4) * 12],
                x: [(i % 2 === 0 ? 1 : -1) * (8 + i * 2)],
                scale: [0.4, 1, 0.2],
              }}
              transition={{ duration: 1.4, delay: i * 0.04, ease: ease.out }}
            />
          ))}
        </div>
      )}
      <motion.div
        initial={reduce ? false : { opacity: 0.92, scale: 0.985 }}
        whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
        viewport={viewportOnce}
        transition={{ duration: duration.slow, ease: ease.out }}
      >
        {children}
      </motion.div>
    </div>
  );
}
