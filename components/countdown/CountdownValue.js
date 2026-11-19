"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";

const SIZE = {
  hero: {
    text: "text-[clamp(2.75rem,14vw,4.25rem)]",
    minW: "min-w-[1.2em]",
  },
  support: {
    text: "text-[clamp(1.15rem,4.8vw,1.55rem)]",
    minW: "min-w-[1.55em]",
  },
};

/**
 * Editorial masked tick — old value rises out, new rises in.
 * Wrapper font-size matches the digit so the mask never crops glyphs.
 */
export default function CountdownValue({
  value,
  size = "support",
  pad = true,
  className = "",
}) {
  const reduce = useReducedMotion();
  const display =
    value === null || value === undefined
      ? "--"
      : pad
        ? String(value).padStart(2, "0")
        : String(value);

  const tokens = SIZE[size] || SIZE.support;
  const typeClass = `font-display tabular-nums leading-[1.2] text-peacock ${tokens.text}`;

  if (reduce) {
    return (
      <span className={`inline-flex items-center justify-center ${typeClass} ${className}`}>
        {display}
      </span>
    );
  }

  return (
    <span
      className={`relative inline-flex overflow-hidden ${tokens.minW} ${tokens.text} ${className}`}
    >
      {/* Sizer uses the same type size as the digit (em min-width is correct). */}
      <span aria-hidden="true" className={`invisible ${typeClass}`}>
        {pad || String(display).length >= 2 ? display : "00"}
      </span>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={display}
          initial={{ y: "45%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-45%", opacity: 0 }}
          transition={{ duration: duration.fast, ease: ease.out }}
          className={`absolute inset-0 flex items-center justify-center ${typeClass}`}
        >
          {display}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
