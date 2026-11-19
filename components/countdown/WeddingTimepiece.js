"use client";

import { memo, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import CountdownValue from "@/components/countdown/CountdownValue";
import CountdownOrnament, {
  CountdownRule,
} from "@/components/countdown/CountdownOrnament";
import uiCopy from "@/config/ui.copy";
import { useLocale } from "@/context/LocaleProvider";
import { ta } from "@/lib/tamil-type";
import { duration, ease } from "@/lib/motion";

function padReady(value) {
  return value === null || value === undefined ? null : value;
}

function WeddingTimepiece({ remaining, ready }) {
  const reduce = useReducedMotion();
  const { t, isTamil } = useLocale();
  const rootRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start end", "end start"],
  });
  const ornamentY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [10, -10]
  );

  const arrived = remaining && remaining.total <= 0;
  const days = padReady(remaining?.days);
  const hours = padReady(remaining?.hours);
  const minutes = padReady(remaining?.minutes);
  const seconds = padReady(remaining?.seconds);

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-[20.5rem] sm:max-w-[22rem]">
      <motion.div
        className="relative mx-auto aspect-square w-[min(100%,19.5rem)] sm:w-[21rem]"
        style={{ y: ornamentY }}
      >
        <CountdownOrnament
          ready={ready}
          seconds={typeof seconds === "number" ? seconds : 0}
        />

        <div className="absolute inset-x-[24%] inset-y-[20%] flex flex-col items-center justify-center text-center sm:inset-x-[22%] sm:inset-y-[18%]">
          {arrived ? (
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: duration.reveal, ease: ease.out }}
              className="px-2"
            >
              <p
                className={`text-peacock ${
                  isTamil
                    ? ta.heading
                    : "font-display italic text-[clamp(1.45rem,6.5vw,1.85rem)] leading-snug"
                }`}
              >
                {t(uiCopy.countdown.dayHere)}
              </p>
              <span className="mt-3 inline-block text-vermilion/75" aria-hidden="true">
                ♥
              </span>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 14, scale: 0.96 }}
                animate={
                  ready || reduce
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: 0, y: 14, scale: 0.96 }
                }
                transition={{
                  duration: duration.reveal,
                  delay: reduce ? 0 : 0.7,
                  ease: ease.out,
                }}
                className="flex flex-col items-center"
              >
                <CountdownValue value={days} size="hero" pad={false} />
                <span
                  className={`mt-1.5 text-ink-soft/75 ${
                    isTamil
                      ? ta.unit
                      : "font-label text-[9px] uppercase tracking-[0.32em] sm:text-[10px]"
                  }`}
                >
                  {t(uiCopy.countdown.days)}
                </span>
              </motion.div>

              <div className="my-3.5 w-full sm:my-4">
                <CountdownRule ready={ready} />
              </div>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={
                  ready || reduce
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 12 }
                }
                transition={{
                  duration: duration.base,
                  delay: reduce ? 0 : 1.05,
                  ease: ease.out,
                }}
                className="mx-auto grid w-[min(100%,10.25rem)] grid-cols-3 gap-x-2"
                aria-hidden={remaining == null}
              >
                {[
                  { key: "hrs", label: t(uiCopy.countdown.hrs), value: hours },
                  { key: "min", label: t(uiCopy.countdown.min), value: minutes },
                  { key: "sec", label: t(uiCopy.countdown.sec), value: seconds },
                ].map((unit) => (
                  <div key={unit.key} className="flex min-w-0 flex-col items-center">
                    <CountdownValue value={unit.value} size="support" />
                    <span
                      className={`mt-1.5 text-ink-soft/65 ${
                        isTamil
                          ? ta.unit
                          : "font-label text-[7px] uppercase tracking-[0.14em] sm:text-[8px]"
                      }`}
                    >
                      {unit.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default memo(WeddingTimepiece);
