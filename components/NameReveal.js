"use client";

import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";

export default function NameReveal({ name, delay = 0, className = "", hasOpened = true }) {
  const reduce = useReducedMotion();
  const letters = Array.from(name);

  if (reduce) {
    return <span className={className}>{name}</span>;
  }

  return (
    <span className={`inline-flex justify-center ${className}`} aria-label={name}>
      {letters.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden="true"
          className="inline-block"
          initial={{ opacity: 0, y: "0.55em" }}
          animate={
            hasOpened
              ? { opacity: 1, y: "0em" }
              : { opacity: 0, y: "0.55em" }
          }
          transition={{
            duration: duration.base,
            delay: hasOpened ? delay + i * 0.035 : 0,
            ease: ease.out,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
