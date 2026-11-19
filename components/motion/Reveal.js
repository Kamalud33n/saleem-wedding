"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeRise, stagger, viewportOnce } from "@/lib/motion";

export function Reveal({
  children,
  className = "",
  as = "div",
  delay = 0,
  variants = fadeRise,
  amount,
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;

  if (reduce) {
    return <Comp className={className}>{children}</Comp>;
  }

  return (
    <Comp
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={amount ? { ...viewportOnce, amount } : viewportOnce}
      custom={delay}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Comp>
  );
}

export function StaggerGroup({ children, className = "", staggerChildren = 0.12, delayChildren = 0.08 }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={stagger(staggerChildren, delayChildren)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "", variants = fadeRise }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
