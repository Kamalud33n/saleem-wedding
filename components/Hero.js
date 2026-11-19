"use client";

import HeroStage from "@/components/hero/HeroStage";

/** Hero after envelope — automatic bright couple reveal. */
export default function Hero({ hasOpened = false, onStageComplete }) {
  return <HeroStage hasOpened={hasOpened} onStageComplete={onStageComplete} />;
}
