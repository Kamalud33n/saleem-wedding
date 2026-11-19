"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import weddingConfig from "@/config/wedding.config";
import uiCopy, { formatCopy } from "@/config/ui.copy";
import WeddingTimepiece from "@/components/countdown/WeddingTimepiece";
import { useLocale } from "@/context/LocaleProvider";
import { ta } from "@/lib/tamil-type";
import { duration, ease } from "@/lib/motion";

function getRemaining(targetIso) {
  const total = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / (1000 * 60)) % 60;
  const hours = Math.floor(total / (1000 * 60 * 60)) % 24;
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, total };
}

export default function Countdown() {
  const [remaining, setRemaining] = useState(null);
  const { t, isTamil } = useLocale();
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });
  const ready = reduce || inView;
  const arrived = remaining && remaining.total <= 0;

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(weddingConfig.weddingDate));
    const immediate = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(immediate);
      clearInterval(id);
    };
  }, []);

  const liveLabel =
    remaining == null
      ? t(uiCopy.countdown.liveCounting)
      : arrived
        ? t(uiCopy.countdown.liveArrived)
        : formatCopy(t(uiCopy.countdown.liveRemaining), remaining);

  return (
    <section
      ref={sectionRef}
      className="journey-scene relative px-5 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-6"
      aria-label={t(uiCopy.countdown.aria)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 sm:h-24"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--color-ivory) 55%, var(--color-parchment)) 100%)",
        }}
      />

      <div className="relative z-[1] mx-auto max-w-[22rem] text-center sm:max-w-md">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: duration.slow, ease: ease.out }}
          className={`text-vermilion/90 ${
            isTamil
              ? ta.caption
              : "font-label text-[9px] uppercase tracking-[0.3em] sm:text-[10px]"
          }`}
        >
          {arrived ? t(uiCopy.countdown.eyebrowToday) : t(uiCopy.countdown.eyebrowWait)}
        </motion.p>

        <div className="mt-2.5 overflow-hidden">
          <motion.h2
            initial={reduce ? false : { y: "115%" }}
            animate={ready ? { y: "0%" } : { y: "115%" }}
            transition={{
              duration: duration.reveal,
              delay: reduce ? 0 : 0.12,
              ease: ease.out,
            }}
            className={`text-peacock ${
              isTamil
                ? ta.heading
                : "font-display italic text-[clamp(1.5rem,6.2vw,1.95rem)] leading-tight"
            }`}
          >
            {arrived ? t(uiCopy.countdown.titleToday) : t(uiCopy.countdown.titleWait)}
          </motion.h2>
        </div>

        <div className="mt-8 sm:mt-10">
          <WeddingTimepiece remaining={remaining} ready={ready} />
        </div>

        <p className="sr-only" aria-live="polite">
          {liveLabel}
        </p>
      </div>
    </section>
  );
}
