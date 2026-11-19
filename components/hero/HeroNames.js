"use client";

import { motion } from "framer-motion";
import weddingConfig from "@/config/wedding.config";
import uiCopy from "@/config/ui.copy";
import { heroEase, heroTiming } from "@/lib/hero-motion";
import useCoupleLayout from "@/hooks/useCoupleLayout";
import { useLocale } from "@/context/LocaleProvider";
import { ta } from "@/lib/tamil-type";

const nameClassBase =
  "font-hero font-medium italic leading-[1.08] tracking-[0.01em] text-peacock text-shadow-soft";

const nameClassMobile = `${nameClassBase} text-[clamp(2.15rem,9.5vw,3.35rem)]`;
const nameClassTablet = `${nameClassBase} text-[clamp(1.85rem,3.6vw,2.35rem)]`;
const nameClassDesktop = `${nameClassBase} text-[clamp(1.92rem,3.2vw,2.88rem)]`;

const parentClassMobile =
  "mt-1.5 block font-body text-[clamp(0.68rem,2.8vw,0.82rem)] font-normal leading-snug tracking-wide text-ink-soft/85";
const parentClassTablet =
  "mt-1 block max-w-[11rem] font-body text-[0.68rem] font-normal leading-snug tracking-wide text-ink-soft/85 lg:mt-1.5 lg:max-w-[15rem] lg:text-[clamp(0.68rem,2.8vw,0.82rem)] xl:max-w-[17rem]";

function NameBlock({
  name,
  fullLine,
  align = "center",
  nameClass,
  parentClass,
  isTamil,
}) {
  const alignClass =
    align === "left"
      ? "text-left items-start"
      : align === "right"
        ? "text-right items-end"
        : "text-center items-center";

  return (
    <div className={`flex w-fit flex-col ${alignClass}`}>
      <span
        className={`block text-peacock text-shadow-soft ${
          isTamil ? ta.heroName : nameClass
        }`}
      >
        {name}
      </span>
      {fullLine ? (
        <span
          className={`mt-1 block text-ink-soft/85 ${
            isTamil ? ta.heroParent : parentClass
          }`}
        >
          {fullLine}
        </span>
      ) : null}
    </div>
  );
}

/** In-flow names — height always hugs text. */
export default function HeroNames({ visible = false, reduce = false }) {
  const { couple } = weddingConfig;
  const { t, isTamil } = useLocale();
  const groom = couple.partnerOne;
  const bride = couple.partnerTwo;
  const { key: layoutKey } = useCoupleLayout();
  const isDesktop = layoutKey.startsWith("desktop");

  const nameClass = isDesktop ? nameClassDesktop : nameClassTablet;
  const presentingClass = isTamil
    ? `${ta.caption} text-marigold-dark/75`
    : "font-label uppercase tracking-[0.34em] text-[9px] md:text-[8px] lg:text-[10px] text-marigold-dark/75";

  return (
    <motion.div
      className="pointer-events-none relative z-[25] mx-auto h-fit w-fit shrink-0 px-4 sm:px-6 md:px-5 lg:px-8 xl:px-12"
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 10,
      }}
      transition={
        reduce
          ? { duration: 0.2 }
          : { duration: heroTiming.names, delay: 0.08, ease: heroEase.out }
      }
    >
      <div className="mx-auto h-fit w-fit max-w-[min(100%,42rem)] lg:max-w-6xl">
        <p className={`mb-1.5 text-center md:mb-1.5 lg:mb-2.5 ${presentingClass}`}>
          {t(uiCopy.hero.presenting)}
        </p>

        <h1
          className="h-fit text-center text-peacock text-shadow-soft md:hidden"
          aria-label={`${t(groom.name)} ${t(uiCopy.hero.and)} ${t(bride.name)}`}
        >
          <span
            className={`block ${isTamil ? ta.heroName : nameClassMobile}`}
            aria-hidden="true"
          >
            {t(groom.name)}
          </span>
          {groom.fullLine ? (
            <span
              className={`mt-1 block text-ink-soft/85 ${
                isTamil ? ta.heroParent : parentClassMobile
              }`}
              aria-hidden="true"
            >
              {t(groom.fullLine)}
            </span>
          ) : null}
          <span
            className={`block font-display text-marigold-dark ${
              isTamil ? "my-1 text-base" : "my-1.5 text-xl sm:text-2xl"
            }`}
            aria-hidden="true"
          >
            &amp;
          </span>
          <span
            className={`block ${isTamil ? ta.heroName : nameClassMobile}`}
            aria-hidden="true"
          >
            {t(bride.name)}
          </span>
          {bride.fullLine ? (
            <span
              className={`mt-1 block text-ink-soft/85 ${
                isTamil ? ta.heroParent : parentClassMobile
              }`}
              aria-hidden="true"
            >
              {t(bride.fullLine)}
            </span>
          ) : null}
        </h1>

        <h1
          className="mx-auto hidden h-fit w-fit grid-cols-[auto_auto_auto] items-start gap-x-3 md:grid lg:gap-x-6 xl:gap-x-10"
          aria-label={`${t(groom.name)} ${t(uiCopy.hero.and)} ${t(bride.name)}`}
        >
          <NameBlock
            name={t(groom.name)}
            fullLine={t(groom.fullLine)}
            align="right"
            nameClass={nameClass}
            parentClass={parentClassTablet}
            isTamil={isTamil}
          />
          <span
            className="pt-[0.4em] text-center font-display text-[clamp(1.25rem,2.2vw,2.35rem)] leading-none text-marigold-dark"
            aria-hidden="true"
          >
            &amp;
          </span>
          <NameBlock
            name={t(bride.name)}
            fullLine={t(bride.fullLine)}
            align="left"
            nameClass={nameClass}
            parentClass={parentClassTablet}
            isTamil={isTamil}
          />
        </h1>
      </div>
    </motion.div>
  );
}
