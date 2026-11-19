"use client";

import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";

const VIEW = 200;
const CX = 100;
const CY = 100;

/** Markers around the outer ring — ceremonial ticks, not clock hands. */
const TICKS = Array.from({ length: 12 }, (_, i) => {
  const a = ((i * 30 - 90) * Math.PI) / 180;
  const r0 = 88;
  const r1 = i % 3 === 0 ? 82 : 85;
  return {
    x1: CX + Math.cos(a) * r0,
    y1: CY + Math.sin(a) * r0,
    x2: CX + Math.cos(a) * r1,
    y2: CY + Math.sin(a) * r1,
  };
});

/**
 * Abstract wedding ornament — dual rings, floral accents, drawn on enter.
 * Slow ambient rotation only when motion is allowed.
 */
function CountdownOrnament({ seconds = 0, ready = false }) {
  const reduce = useReducedMotion();
  const draw = reduce
    ? { pathLength: 1, opacity: 0.85 }
    : ready
      ? { pathLength: 1, opacity: 1 }
      : { pathLength: 0, opacity: 0 };

  const drawTransition = {
    duration: reduce ? 0 : 1.25,
    ease: ease.out,
    delay: reduce ? 0 : 0.2,
  };

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <motion.svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="absolute inset-0 h-full w-full text-marigold-dark/55"
        initial={false}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={
          reduce
            ? undefined
            : { duration: 140, repeat: Infinity, ease: "linear" }
        }
      >
        {/* Outer ring */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={90}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.7}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={draw}
          transition={drawTransition}
        />

        {TICKS.map((t, i) => (
          <motion.line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="currentColor"
            strokeWidth={i % 3 === 0 ? 1.1 : 0.55}
            strokeLinecap="round"
            initial={reduce ? false : { opacity: 0 }}
            animate={ready || reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={{
              delay: reduce ? 0 : 0.55 + i * 0.03,
              duration: 0.4,
              ease: ease.out,
            }}
          />
        ))}

        {/* Soft floral accents at cardinal points */}
        {[0, 90, 180, 270].map((deg, i) => {
          const a = ((deg - 90) * Math.PI) / 180;
          const x = CX + Math.cos(a) * 90;
          const y = CY + Math.sin(a) * 90;
          return (
            <motion.g
              key={deg}
              transform={`translate(${x} ${y})`}
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={
                ready || reduce
                  ? { opacity: 0.7, scale: 1 }
                  : { opacity: 0, scale: 0.6 }
              }
              transition={{
                delay: reduce ? 0 : 0.9 + i * 0.08,
                duration: 0.55,
                ease: ease.out,
              }}
            >
              <circle r={1.4} fill="currentColor" />
              <path
                d="M0 -4.5 C1.6 -2.8 1.6 -1 0 0 C-1.6 -1 -1.6 -2.8 0 -4.5Z"
                fill="currentColor"
                opacity={0.55}
                transform={`rotate(${deg})`}
              />
            </motion.g>
          );
        })}
      </motion.svg>

      {/* Inner ring — opposite drift */}
      <motion.svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="absolute inset-[8%] h-[84%] w-[84%] text-peacock/25"
        initial={false}
        animate={reduce ? undefined : { rotate: -360 }}
        transition={
          reduce
            ? undefined
            : { duration: 200, repeat: Infinity, ease: "linear" }
        }
      >
        <motion.circle
          cx={CX}
          cy={CY}
          r={78}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.55}
          strokeDasharray="2.5 5.5"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={draw}
          transition={{ ...drawTransition, delay: reduce ? 0 : 0.35 }}
        />
      </motion.svg>

      {/* Symbolic second traveler — small arc segment, one lap per minute */}
      {!reduce && (
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="absolute inset-0 h-full w-full"
        >
          <g
            style={{
              transformOrigin: "100px 100px",
              transform: `rotate(${(seconds % 60) * 6}deg)`,
              transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <path
              d="M100 12 A88 88 0 0 1 118 16"
              fill="none"
              stroke="var(--color-marigold)"
              strokeWidth={1.4}
              strokeLinecap="round"
              opacity={0.55}
            />
            <circle cx={100} cy={12} r={1.6} fill="var(--color-vermilion)" opacity={0.7} />
          </g>
        </svg>
      )}

      {/* Breathing heart at the base of the timepiece */}
      <motion.div
        className="absolute left-1/2 bottom-[6%] -translate-x-1/2"
        initial={reduce ? false : { opacity: 0, scale: 0.75 }}
        animate={
          ready || reduce ? { opacity: 0.85, scale: 1 } : { opacity: 0, scale: 0.75 }
        }
        transition={{
          delay: reduce ? 0 : 1.35,
          duration: 0.55,
          ease: ease.out,
        }}
      >
        <motion.span
          className="block"
          animate={reduce ? undefined : { scale: [1, 1.05, 1] }}
          transition={
            reduce
              ? undefined
              : { duration: 4.8, repeat: Infinity, ease: ease.inOut }
          }
        >
          <svg width="14" height="13" viewBox="0 0 14 13" className="text-vermilion/70">
            <path
              d="M7 12C7 12 1.2 8.2 1.2 4.6C1.2 2.7 2.7 1.3 4.5 1.3C5.5 1.3 6.4 1.8 7 2.6C7.6 1.8 8.5 1.3 9.5 1.3C11.3 1.3 12.8 2.7 12.8 4.6C12.8 8.2 7 12 7 12Z"
              fill="currentColor"
            />
          </svg>
        </motion.span>
      </motion.div>
    </div>
  );
}

/** Thin editorial rule that draws under the days label. */
export function CountdownRule({ ready }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className="mx-auto flex h-px w-[min(11rem,48%)] origin-center bg-marigold-dark/40"
      initial={reduce ? false : { scaleX: 0, opacity: 0 }}
      animate={
        ready || reduce ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }
      }
      transition={{
        duration: reduce ? 0.2 : duration.base,
        delay: reduce ? 0 : 0.85,
        ease: ease.out,
      }}
    />
  );
}

export default memo(CountdownOrnament);
