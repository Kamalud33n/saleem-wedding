"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import weddingConfig from "@/config/wedding.config";
import uiCopy from "@/config/ui.copy";
import ScratchHeart from "@/components/discover-date/ScratchHeart";
import HeartCelebration from "@/components/discover-date/HeartCelebration";
import { useLocale } from "@/context/LocaleProvider";
import { ta } from "@/lib/tamil-type";
import { duration, ease, viewportOnce } from "@/lib/motion";

/**
 * Date discovery scene — interactive hearts within the shared journey canvas.
 */
export default function DiscoverDate() {
  const { weddingDateDisplay, discoverInviteLine } = weddingConfig;
  const { t, isTamil } = useLocale();
  const reduce = useReducedMotion();
  const [done, setDone] = useState({ date: false, month: false, year: false });
  const [celebrate, setCelebrate] = useState(false);
  const [forceAll, setForceAll] = useState(false);
  const [hintActive, setHintActive] = useState(true);
  const celebrateArmed = useRef(false);

  const dismissHint = useCallback(() => setHintActive(false), []);

  const parts = useMemo(() => {
    const monthShort = t(weddingDateDisplay.monthShort) || t(weddingDateDisplay.month);
    return [
      { key: "date", value: weddingDateDisplay.day, label: t(uiCopy.discover.labelDate) },
      { key: "month", value: monthShort, label: t(uiCopy.discover.labelMonth) },
      {
        key: "year",
        value: String(weddingDateDisplay.year),
        label: t(uiCopy.discover.labelYear),
      },
    ];
  }, [weddingDateDisplay, t]);

  const dateLine = `${weddingDateDisplay.day} · ${parts[1].value} · ${weddingDateDisplay.year}`;
  const inviteLine = t(discoverInviteLine);
  const allComplete = done.date && done.month && done.year;

  const tryCelebrate = useCallback(
    (next) => {
      if (!(next.date && next.month && next.year) || celebrateArmed.current) return;
      celebrateArmed.current = true;
      const pause = reduce ? 40 : 220;
      window.setTimeout(() => setCelebrate(true), pause);
    },
    [reduce]
  );

  const onHeartComplete = useCallback(
    (key) => {
      setDone((prev) => {
        if (prev[key]) return prev;
        const next = { ...prev, [key]: true };
        tryCelebrate(next);
        return next;
      });
    },
    [tryCelebrate]
  );

  const revealAll = () => {
    setHintActive(false);
    setForceAll(true);
    setDone({ date: true, month: true, year: true });
    tryCelebrate({ date: true, month: true, year: true });
  };

  return (
    <section
      className="journey-scene relative px-5 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8"
      aria-label={t(uiCopy.discover.aria)}
    >
      <div className="relative mx-auto max-w-[22rem] sm:max-w-md">
        <div className="text-center">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: duration.slow, ease: ease.out }}
            className={`text-vermilion/90 ${
              isTamil ? ta.caption : "font-label text-[9px] uppercase tracking-[0.3em] sm:text-[10px]"
            }`}
          >
            {t(uiCopy.discover.eyebrow)}
          </motion.p>

          <div className="mt-2.5 overflow-hidden">
            <motion.h2
              initial={reduce ? false : { y: "110%" }}
              whileInView={reduce ? undefined : { y: "0%" }}
              viewport={viewportOnce}
              transition={{ duration: duration.reveal, ease: ease.out, delay: 0.05 }}
              className={`text-peacock ${
                isTamil
                  ? ta.heading
                  : "font-display italic text-[clamp(1.55rem,6.2vw,1.95rem)] leading-tight"
              }`}
            >
              {t(uiCopy.discover.title)}
            </motion.h2>
          </div>

          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            whileInView={reduce ? undefined : { opacity: 1 }}
            viewport={viewportOnce}
            transition={{ duration: duration.base, delay: 0.15, ease: ease.out }}
            className={`mx-auto mt-2.5 max-w-[16rem] text-ink-soft/80 ${
              isTamil ? ta.subhead : "font-body text-[12px] leading-relaxed sm:text-[13px]"
            }`}
          >
            {t(uiCopy.discover.hint)}
          </motion.p>
        </div>

        <div className="relative mt-8 sm:mt-9">
          <HeartCelebration active={celebrate} />

          <div className="relative z-10 flex items-start justify-center gap-[clamp(1rem,5vw,1.75rem)]">
            {parts.map((part, i) => (
              <ScratchHeart
                key={part.key}
                index={i}
                value={part.value}
                label={part.label}
                forceReveal={forceAll}
                showScratchHint={hintActive && i === 0}
                onInteract={dismissHint}
                onComplete={() => onHeartComplete(part.key)}
              />
            ))}
          </div>

          {allComplete ? (
            <motion.div
              className="mt-6 text-center sm:mt-7"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.65, ease: ease.out }}
            >
              <p
                className={`text-peacock ${
                  isTamil
                    ? ta.heading
                    : "font-display italic text-[1.3rem] sm:text-[1.5rem]"
                }`}
                aria-live="polite"
              >
                {dateLine}
              </p>
              {inviteLine ? (
                <motion.p
                  className={`mt-3 text-vermilion/85 sm:mt-3.5 ${
                    isTamil
                      ? ta.caption
                      : "font-label text-[9px] uppercase tracking-[0.28em] sm:text-[10px]"
                  }`}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: reduce ? 0 : 0.85,
                    duration: duration.base,
                    ease: ease.out,
                  }}
                >
                  {inviteLine}
                </motion.p>
              ) : null}
            </motion.div>
          ) : (
            <button
              type="button"
              onClick={revealAll}
              className={`mx-auto mt-6 block text-ink-soft/65 underline decoration-marigold/50 underline-offset-4 ${
                isTamil ? ta.meta : "font-body text-[11px] tracking-wide"
              }`}
            >
              {t(uiCopy.discover.revealAll)}
            </button>
          )}

          {allComplete ? (
            <p className="sr-only" aria-live="polite">
              {t(uiCopy.discover.revealedPrefix)} {dateLine}. {inviteLine || ""}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
