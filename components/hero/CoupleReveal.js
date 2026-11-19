"use client";

import { motion, AnimatePresence } from "framer-motion";
import { heroEase, heroTiming } from "@/lib/hero-motion";
import useCoupleLayout from "@/hooks/useCoupleLayout";

function figureStyle(figure) {
  const side = figure.side || "center";
  if (side === "left") {
    return {
      width: figure.width,
      left: figure.inset || "0%",
      right: "auto",
      transformOrigin: "bottom left",
    };
  }
  if (side === "right") {
    return {
      width: figure.width,
      left: "auto",
      right: figure.inset || "0%",
      transformOrigin: "bottom right",
    };
  }
  return {
    width: figure.width,
    left: "50%",
    right: "auto",
    transformOrigin: "bottom center",
  };
}

/**
 * Bride left / groom right.
 * Fills the remaining hero column below HeroNames (parent is flex-1).
 * Stable motion keys + one layout source so enter pose === settled pose.
 */
export default function CoupleReveal({ assets, active = false, reduce = false }) {
  const { layout, ready } = useCoupleLayout();
  // Wait for client width so enter pose matches desktop/tablet buckets (not SSR mobile).
  const show = active && ready;

  const enter = reduce
    ? { duration: 0.25 }
    : {
        duration: heroTiming.coupleEnter,
        ease: heroEase.couple,
        delay: heroTiming.coupleStart,
      };

  const brideSide = layout.bride.side || "center";
  const groomSide = layout.groom.side || "center";

  return (
    <div
      className="relative z-40 min-h-0 w-full flex-1 overflow-hidden md:-mt-5 lg:mt-0"
      style={{
        // Only bottom inset — top is flush under the names (no stageTop dead zone).
        paddingBottom: layout.stageBottom,
      }}
    >
      <div
        className="relative mx-auto h-full w-full"
        style={{ maxWidth: layout.maxWidth }}
      >
        <AnimatePresence>
          {show && (
            <>
              <motion.div
                key="bride"
                className="absolute bottom-0 h-full will-change-transform"
                style={figureStyle(layout.bride)}
                initial={
                  reduce
                    ? {
                        x: layout.bride.x,
                        y: layout.bride.y,
                        opacity: 1,
                        scale: layout.bride.scale,
                      }
                    : {
                        x: brideSide === "left" ? "-35%" : "-160%",
                        y: layout.bride.y,
                        opacity: 0,
                        scale: layout.bride.scale * 0.98,
                      }
                }
                animate={{
                  x: layout.bride.x,
                  y: layout.bride.y,
                  opacity: 1,
                  scale: layout.bride.scale,
                }}
                transition={enter}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={assets.bride}
                  alt=""
                  draggable={false}
                  className="pointer-events-none h-full w-full object-contain object-bottom"
                />
              </motion.div>

              <motion.div
                key="groom"
                className="absolute bottom-0 h-full will-change-transform"
                style={figureStyle(layout.groom)}
                initial={
                  reduce
                    ? {
                        x: layout.groom.x,
                        y: layout.groom.y,
                        opacity: 1,
                        scale: layout.groom.scale,
                      }
                    : {
                        x: groomSide === "right" ? "35%" : "60%",
                        y: layout.groom.y,
                        opacity: 0,
                        scale: layout.groom.scale * 0.98,
                      }
                }
                animate={{
                  x: layout.groom.x,
                  y: layout.groom.y,
                  opacity: 1,
                  scale: layout.groom.scale,
                }}
                transition={
                  reduce
                    ? { duration: 0.25 }
                    : { ...enter, delay: heroTiming.coupleStart + 0.05 }
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={assets.groom}
                  alt=""
                  draggable={false}
                  className="pointer-events-none h-full w-full object-contain object-bottom"
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
