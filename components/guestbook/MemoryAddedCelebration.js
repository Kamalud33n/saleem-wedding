"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ease } from "@/lib/motion";

function HeartIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 21s-6.7-4.35-9.33-7.7C.5 10.5 1.2 6.8 4.2 5.3c1.9-.95 4.1-.35 5.4 1.25L12 9l2.4-2.45c1.3-1.6 3.5-2.2 5.4-1.25 3 1.5 3.7 5.2 1.53 7.99C18.7 16.65 12 21 12 21z" />
    </svg>
  );
}

/** Brief memory-book flourish after a note is saved. */
export default function MemoryAddedCelebration({ active = false }) {
  const reduce = useReducedMotion();

  if (!active) return null;

  if (reduce) {
    return (
      <div
        className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center"
        aria-hidden="true"
      >
        <span className="text-vermilion/50">
          <HeartIcon className="h-5 w-5" />
        </span>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 overflow-hidden"
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 text-vermilion/80"
          style={{ width: 14, height: 14, marginLeft: -7 }}
          initial={{ opacity: 0, y: 8, x: (i - 1) * 10, scale: 0.5 }}
          animate={{
            opacity: [0, 0.9, 0],
            y: [8, -28 - i * 8, -44 - i * 10],
            x: [(i - 1) * 10, (i - 1) * 18, (i - 1) * 24],
            scale: [0.5, 1, 0.6],
          }}
          transition={{
            duration: 0.95,
            delay: i * 0.08,
            ease: ease.out,
          }}
        >
          <HeartIcon className="h-full w-full" />
        </motion.span>
      ))}
    </div>
  );
}
