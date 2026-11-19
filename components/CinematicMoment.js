"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import weddingConfig from "@/config/wedding.config";
import uiCopy from "@/config/ui.copy";
import { useLocale } from "@/context/LocaleProvider";
import { ta } from "@/lib/tamil-type";
import { getInvitationScroller } from "@/lib/visual-viewport";

const CREAM =
  "color-mix(in srgb, var(--color-ivory) 72%, var(--color-parchment))";
const PARCHMENT = "var(--color-parchment)";
const PHOTO = "/gallery/cinematic.jpeg";

// Same RGB, alpha only — `transparent` interpolates through black and draws a line.
const PAPER_TOP_RGB = "249, 244, 233";
const PAPER_BOTTOM_RGB = "246, 238, 221";
const FADE_LENGTH = "8rem";

function paperEdgeFade(rgb, deg) {
  return `linear-gradient(${deg}, rgba(${rgb}, 1) 0%, rgba(${rgb}, 0.7) 32%, rgba(${rgb}, 0.32) 64%, rgba(${rgb}, 0.08) 86%, rgba(${rgb}, 0) 100%)`;
}

const PHOTO_EDGE_MASK = `linear-gradient(180deg, transparent 0%, #000 1.25rem, #000 calc(100% - 1.25rem), transparent 100%)`;

/**
 * Cinematic memory — couple photo with soft edge merges.
 */
export default function CinematicMoment() {
  const { couple, cinematic } = weddingConfig;
  const { t, isTamil   } = useLocale();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const frameScrollRef = useRef(null);
  const [useFrameScroll, setUseFrameScroll] = useState(false);
  const src = cinematic?.src || PHOTO;
  const names = `${t(couple.partnerOne.name)} & ${t(couple.partnerTwo.name)}`;
  const line = t(cinematic.line);

  useLayoutEffect(() => {
    const scroller = getInvitationScroller();
    frameScrollRef.current = scroller;
    setUseFrameScroll(Boolean(scroller));
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    ...(useFrameScroll ? { container: frameScrollRef } : {}),
    offset: ["start end", "end start"],
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0.02, 0.3],
    reduce
      ? ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
      : ["inset(62% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );

  const photoScale = useTransform(
    scrollYProgress,
    [0.05, 0.45],
    // Keep scale at 1 — fractional scales (e.g. 1.05) blur the photo on GPU layers.
    [1, 1]
  );

  const photoY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : ["-3%", "4%"]
  );

  const quoteOpacity = useTransform(
    scrollYProgress,
    reduce ? [0, 0.01] : [0.3, 0.44, 0.8, 0.94],
    reduce ? [1, 1] : [0, 1, 1, 0.4]
  );

  const quoteY = useTransform(
    scrollYProgress,
    [0.3, 0.48],
    reduce ? [0, 0] : [18, 0]
  );

  const namesOpacity = useTransform(
    scrollYProgress,
    reduce ? [0, 0.01] : [0.38, 0.52, 0.8, 0.94],
    reduce ? [1, 1] : [0, 1, 1, 0.4]
  );

  const namesY = useTransform(
    scrollYProgress,
    [0.38, 0.52],
    reduce ? [0, 0] : [12, 0]
  );

  return (
    <section
      ref={ref}
      className="cinematic-scene relative h-[100dvh] min-h-[34rem] max-h-[52rem] overflow-hidden"
      aria-label={t(uiCopy.cinematic.aria)}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${CREAM} 0%, ${PARCHMENT} 100%)`,
        }}
      />

      {/* Photograph — tiny equal mask so the bitmap itself has no hard edge */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ clipPath, scale: photoScale, y: photoY }}
      >
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage: PHOTO_EDGE_MASK,
            maskImage: PHOTO_EDGE_MASK,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          <Image
            src={src}
            alt={t(uiCopy.cinematic.alt)}
            fill
            sizes="100vw"
            quality={92}
            priority={false}
            className="object-cover object-[center_35%] md:object-[center_0%] lg:object-[center_10%]"
          />
          {/* Dim the bright pink/gold so overlay copy stays readable */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-ink/45"
          />
        </div>
      </motion.div>

      {/* Equal paper fades — same length, same alpha curve, no `transparent` */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1]"
        style={{
          height: FADE_LENGTH,
          background: paperEdgeFade(PAPER_TOP_RGB, "180deg"),
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4]"
        style={{
          height: FADE_LENGTH,
          background: paperEdgeFade(PAPER_BOTTOM_RGB, "0deg"),
        }}
      />

      {/* Caption band — darkens mid/lower photo for quote readability */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[52%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(36,27,18,0) 0%, rgba(36,27,18,0.38) 34%, rgba(36,27,18,0.7) 64%, rgba(36,27,18,0.22) 86%, rgba(36,27,18,0) 100%)",
        }}
      />

      <div className="relative z-[5] flex h-full flex-col items-center justify-end px-6 pb-[clamp(5.5rem,15vh,8rem)] text-center">
        <motion.p
          style={{
            opacity: quoteOpacity,
            y: quoteY,
            textShadow:
              "0 1px 2px rgba(36,27,18,0.75), 0 10px 28px rgba(36,27,18,0.55)",
          }}
          className={`max-w-[18rem] text-ivory sm:max-w-sm ${
            isTamil
              ? ta.quote
              : "font-display italic text-[clamp(1.35rem,5.8vw,1.85rem)] leading-snug"
          }`}
        >
          {line}
        </motion.p>

        <motion.p
          style={{
            opacity: namesOpacity,
            y: namesY,
            textShadow:
              "0 1px 2px rgba(36,27,18,0.8), 0 6px 18px rgba(36,27,18,0.5)",
          }}
          className={`mt-4 text-[#f7e7b8] sm:mt-5 ${
            isTamil
              ? ta.caption
              : "font-label text-[9px] uppercase tracking-[0.28em] sm:text-[10px] sm:tracking-[0.32em]"
          }`}
        >
          {names}
        </motion.p>
      </div>

      <p className="sr-only">
        {line}. {names}.
      </p>
    </section>
  );
}
