"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ease } from "@/lib/motion";

const HAND_SRC = "/gallery/cartoon-hand-gesture-icon.png";

/**
 * Silent scratch cue: a fingertip rubs the foil.
 * No labels — the motion is the instruction.
 */
function ScratchHand({ className = "" }) {
  return (
    <Image
      src={HAND_SRC}
      alt=""
      width={144}
      height={168}
      aria-hidden="true"
      draggable={false}
      className={className}
    />
  );
}

const RUB = {
  x: ["8%", "46%", "16%", "52%", "12%"],
  y: ["22%", "36%", "54%", "40%", "26%"],
  rotate: [-18, 8, -12, 14, -16],
};

export default function ScratchHintGesture() {
  const reduce = useReducedMotion();
  const hostRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = hostRef.current?.parentElement;
    if (!node) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { threshold: 0.5 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return undefined;
    const show = window.setTimeout(() => setVisible(true), reduce ? 180 : 900);
    return () => window.clearTimeout(show);
  }, [inView, reduce]);

  useEffect(() => {
    if (!reduce || !visible) return undefined;
    const hide = window.setTimeout(() => setVisible(false), 4200);
    return () => window.clearTimeout(hide);
  }, [reduce, visible]);

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 z-20 overflow-visible">
      <AnimatePresence>
        {visible ? (
          <motion.div
            className="absolute inset-0 overflow-visible"
            aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: ease.out }}
        >
          <motion.div
            className="absolute left-5 top-5"
            style={{ width: "40%", height: "46%" }}
            animate={reduce ? { x: "28%", y: "34%", rotate: -8 } : RUB}
            transition={
              reduce
                ? { duration: 0.5, ease: ease.out }
                : {
                    duration: 2.35,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 0.85,
                  }
            }
          >
            {!reduce ? (
              <motion.span
                className="absolute left-[8%] top-[10%] h-[28%] w-[38%] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(232,169,60,0.45) 0%, rgba(246,215,152,0.12) 55%, transparent 72%)",
                  filter: "blur(2px)",
                }}
                animate={{ opacity: [0.25, 0.7, 0.2], scale: [0.75, 1.15, 0.8] }}
                transition={{
                  duration: 0.58,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : null}

            {!reduce
              ? [0, 0.18, 0.36].map((delay) => (
                  <motion.span
                    key={delay}
                    className="absolute left-[12%] top-[14%] h-[5px] w-[5px] rounded-full bg-marigold"
                    style={{ boxShadow: "0 0 6px rgba(232,169,60,0.8)" }}
                    animate={{
                      x: [-2, -14, -22],
                      y: [0, 6, 12],
                      opacity: [0, 0.95, 0],
                      scale: [0.4, 1, 0.2],
                    }}
                    transition={{
                      duration: 0.7,
                      delay,
                      repeat: Infinity,
                      repeatDelay: 1.65,
                      ease: "easeOut",
                    }}
                  />
                ))
              : null}

            {!reduce ? (
              <motion.svg
                viewBox="0 0 40 24"
                className="absolute left-[-14%] top-[4%] h-[38%] w-[70%] text-marigold-dark/70"
                animate={{ opacity: [0, 0.7, 0], x: [4, -6] }}
                transition={{
                  duration: 0.7,
                  repeat: Infinity,
                  repeatDelay: 1.65,
                  ease: "easeOut",
                }}
              >
                <path
                  d="M4 18c6-6 12-8 20-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M8 22c6-5 14-6 22-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  opacity="0.65"
                />
              </motion.svg>
            ) : null}

            <ScratchHand className="relative h-full w-full object-contain drop-shadow-[0_4px_8px_rgba(36,27,18,0.22)]" />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
    </div>
  );
}
