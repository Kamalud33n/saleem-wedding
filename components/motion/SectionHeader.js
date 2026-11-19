"use client";

import { motion, useReducedMotion } from "framer-motion";
import { duration, ease, viewportOnce } from "@/lib/motion";

function isTamilType(className = "") {
  return className.includes("font-tamil") || className.includes("ta-");
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  className = "",
  showOrnament = true,
  eyebrowClassName = "",
  titleClassName = "",
  subtitleClassName = "",
}) {
  const reduce = useReducedMotion();
  const tamilEyebrow = isTamilType(eyebrowClassName);
  const tamilTitle = isTamilType(titleClassName);
  const tamilSubtitle = isTamilType(subtitleClassName);

  return (
    <div className={`text-center ${className}`}>
      {eyebrow ? (
        <motion.p
          initial={
            reduce
              ? false
              : tamilEyebrow
                ? { opacity: 0 }
                : { opacity: 0, letterSpacing: "0.5em" }
          }
          whileInView={
            reduce
              ? undefined
              : tamilEyebrow
                ? { opacity: 1 }
                : { opacity: 1, letterSpacing: "0.32em" }
          }
          viewport={viewportOnce}
          transition={{ duration: duration.slow, ease: ease.out }}
          className={
            tamilEyebrow
              ? `mb-4 text-vermilion ${eyebrowClassName}`
              : `mb-4 font-label text-[10px] uppercase tracking-[0.32em] text-vermilion ${eyebrowClassName}`
          }
        >
          {eyebrow}
        </motion.p>
      ) : null}

      <div className="overflow-hidden">
        <motion.h2
          initial={reduce ? false : { y: "110%" }}
          whileInView={reduce ? undefined : { y: "0%" }}
          viewport={viewportOnce}
          transition={{ duration: duration.reveal, ease: ease.out, delay: 0.06 }}
          className={
            tamilTitle
              ? `text-peacock ${titleClassName}`
              : `font-display italic text-[1.85rem] leading-tight text-peacock sm:text-3xl ${titleClassName}`
          }
        >
          {title}
        </motion.h2>
      </div>

      {subtitle ? (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: duration.base, delay: 0.18, ease: ease.out }}
          className={
            tamilSubtitle
              ? `mx-auto mt-3 max-w-xs text-ink-soft ${subtitleClassName}`
              : `mx-auto mt-3 max-w-xs font-body text-[13px] leading-relaxed text-ink-soft sm:text-sm ${subtitleClassName}`
          }
        >
          {subtitle}
        </motion.p>
      ) : null}

      {showOrnament ? (
        <motion.div
          aria-hidden="true"
          initial={reduce ? false : { scaleX: 0, opacity: 0 }}
          whileInView={reduce ? undefined : { scaleX: 1, opacity: 1 }}
          viewport={viewportOnce}
          transition={{ duration: duration.base, delay: 0.28, ease: ease.out }}
          className="mt-6 mx-auto flex items-center justify-center gap-2 origin-center"
        >
          <span className="h-px w-10 bg-marigold-dark/45" />
          <span className="h-1 w-1 rotate-45 bg-vermilion/80" />
          <span className="h-px w-10 bg-marigold-dark/45" />
        </motion.div>
      ) : null}
    </div>
  );
}
