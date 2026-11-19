"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import weddingConfig from "@/config/wedding.config";
import uiCopy from "@/config/ui.copy";
import { HERO_PHASE, heroTiming } from "@/lib/hero-motion";
import StageAtmosphere from "@/components/hero/StageAtmosphere";
import StageDecoration from "@/components/hero/StageDecoration";
import CoupleReveal from "@/components/hero/CoupleReveal";
import HeroNames from "@/components/hero/HeroNames";
import PetalField from "@/components/hero/PetalField";
import { useLocale } from "@/context/LocaleProvider";

const FALLBACK_ASSETS = {
  bride: "/wedding/hero/bride.png",
  groom: "/wedding/hero/groom.png",
  petals: [
    "/wedding/hero/petal-01.png",
    "/wedding/hero/petal-02.png",
    "/wedding/hero/petal-03.png",
    "/wedding/hero/petal-04.png",
  ],
};

/**
 * Bright auto-reveal Hero — starts when envelope finishes (hasOpened).
 * No switch, no dark stage, no second guest interaction.
 */
export default function HeroStage({ hasOpened = false, onStageComplete }) {
  const assets = weddingConfig.hero?.stage?.assets || FALLBACK_ASSETS;
  const reduce = useReducedMotion();
  const { t } = useLocale();
  const [phase, setPhase] = useState(HERO_PHASE.IDLE);
  const startedRef = useRef(false);
  const notifiedRef = useRef(false);
  const timersRef = useRef([]);
  const onCompleteRef = useRef(onStageComplete);

  useEffect(() => {
    onCompleteRef.current = onStageComplete;
  }, [onStageComplete]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const schedule = useCallback((fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // Auto-start reveal as soon as envelope hands off.
  useEffect(() => {
    if (!hasOpened || startedRef.current) return;
    startedRef.current = true;
    setPhase(HERO_PHASE.REVEALING);

    const settleMs = reduce ? 320 : Math.round(heroTiming.settledAt * 1000);
    schedule(() => setPhase(HERO_PHASE.SETTLED), settleMs);
  }, [hasOpened, reduce, schedule]);

  useEffect(() => {
    if (phase !== HERO_PHASE.SETTLED || notifiedRef.current) return;
    notifiedRef.current = true;
    const id = window.setTimeout(() => onCompleteRef.current?.(), 0);
    return () => window.clearTimeout(id);
  }, [phase]);

  const sceneLive =
    hasOpened &&
    (phase === HERO_PHASE.REVEALING || phase === HERO_PHASE.SETTLED);

  return (
    <section
      className="journey-scene journey-hero relative w-full overflow-hidden select-none"
      aria-label={t(uiCopy.hero.ariaStage)}
    >
      {/* Soft local wash — canvas supplies the continuous base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(255,253,248,0.55), transparent 70%)",
        }}
      />
      <StageAtmosphere active={sceneLive} reduce={reduce} />
      <StageDecoration visible={sceneLive} />

      {/* Names hug content; couple flex-1 fills every pixel below — no dead gap. */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col pt-[max(5.25rem,calc(env(safe-area-inset-top)+11vh))] md:pt-[max(6.75rem,calc(env(safe-area-inset-top)+15vh))] lg:pt-[max(8.75rem,calc(env(safe-area-inset-top)+22vh))]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <HeroNames visible={sceneLive} reduce={reduce} />
        <CoupleReveal assets={assets} active={sceneLive} reduce={reduce} />
      </div>

      <PetalField sources={assets.petals || []} phase={phase} />

      {/* Soft dissolve into the shared canvas — no color cut */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[45] h-28 sm:h-32"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--color-ivory) 25%, transparent) 55%, transparent 100%)",
        }}
      />

      {phase === HERO_PHASE.SETTLED && (
        <motion.div
          className="absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex justify-center pb-1"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.55, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={18} className="text-peacock/40" aria-hidden="true" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
