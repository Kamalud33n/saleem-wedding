"use client";

import { motion } from "framer-motion";
import { heroEase, heroTiming } from "@/lib/hero-motion";

/** Soft ivory / champagne atmosphere — environment only, never over the couple. */
export default function StageAtmosphere({ active = false, reduce = false }) {
  const t = reduce
    ? { duration: 0.2 }
    : { duration: heroTiming.decor, ease: heroEase.soft };

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={t}
        style={{
          background:
            "radial-gradient(ellipse 85% 55% at 50% 0%, rgba(242,201,122,0.2), transparent 55%), radial-gradient(ellipse 70% 48% at 50% 100%, rgba(246,238,221,0.25), transparent 62%), radial-gradient(ellipse 60% 45% at 50% 55%, rgba(255,253,248,0.85), transparent 70%), transparent",
        }}
      />
      <motion.div
        className="absolute left-1/2 top-[48%] h-[50%] w-[70%] -translate-x-1/2 rounded-full"
        initial={false}
        animate={{ opacity: active ? 0.55 : 0, scale: active ? 1 : 0.85 }}
        transition={t}
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(242,201,122,0.2) 0%, transparent 68%)",
        }}
      />
    </div>
  );
}
