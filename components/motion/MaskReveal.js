"use client";

import { motion, useReducedMotion } from "framer-motion";
import { duration, ease, viewportOnce } from "@/lib/motion";

export default function MaskReveal({ children, className = "", delay = 0 }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "108%", opacity: 0.4 }}
        whileInView={{ y: "0%", opacity: 1 }}
        viewport={viewportOnce}
        transition={{ duration: duration.reveal, delay, ease: ease.out }}
      >
        {children}
      </motion.div>
    </div>
  );
}
