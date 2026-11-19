"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import weddingConfig from "@/config/wedding.config";
import { useLocale } from "@/context/LocaleProvider";
import { ta } from "@/lib/tamil-type";
import { duration, ease, viewportOnce } from "@/lib/motion";

const FOOTER_PHOTO_FALLBACK = "/gallery/footer.jpeg";

export default function Footer() {
  const { couple, footerCredit, weddingDateDisplay, closingLine, footer } =
    weddingConfig;
  const { t, isTamil } = useLocale();
  const reduce = useReducedMotion();
  const photoSrc = footer?.src || FOOTER_PHOTO_FALLBACK;
  const width = footer?.width || 4160;
  const height = footer?.height || 2773;

  const dateLine = `${weddingDateDisplay.day} ${t(weddingDateDisplay.month)} ${weddingDateDisplay.year}`;

  return (
    <footer className="relative overflow-hidden bg-peacock-dark text-center">
      <div className="relative w-full">
        <Image
          src={photoSrc}
          alt=""
          width={width}
          height={height}
          sizes="100vw"
          className="h-auto w-full"
          priority={false}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-peacock-dark/30"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%]"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(8,39,40,0.35) 45%, var(--color-peacock-dark) 100%)",
          }}
        />
      </div>

      <div className="relative px-5 pb-16 pt-6 sm:pb-20 sm:pt-8">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: duration.reveal, ease: ease.out }}
          className={`mx-auto max-w-xs text-parchment/90 ${
            isTamil ? ta.lead : "font-display italic text-[1.15rem] leading-relaxed sm:text-xl"
          }`}
        >
          {t(closingLine)}
        </motion.p>

        <motion.p
          initial={reduce ? false : { opacity: 0, letterSpacing: isTamil ? "0.04em" : "0.4em" }}
          whileInView={
            reduce
              ? undefined
              : { opacity: 0.7, letterSpacing: isTamil ? "0.04em" : "0.28em" }
          }
          viewport={viewportOnce}
          transition={{ duration: duration.slow, ease: ease.out, delay: 0.08 }}
          className={`mt-8 text-marigold-light/80 ${
            isTamil ? ta.caption : "font-label text-[9px] uppercase tracking-[0.28em]"
          }`}
        >
          {t(footerCredit.label)}
        </motion.p>

        <div className="mt-3 overflow-hidden">
          <motion.p
            initial={reduce ? false : { y: "110%" }}
            whileInView={reduce ? undefined : { y: "0%" }}
            viewport={viewportOnce}
            transition={{
              duration: duration.reveal,
              ease: ease.out,
              delay: 0.12,
            }}
            className={`text-parchment ${
              isTamil ? ta.heading : "font-display italic text-[1.7rem] sm:text-2xl"
            }`}
          >
            {t(couple.partnerOne.name)}{" "}
            <span className="text-marigold not-italic">&amp;</span>{" "}
            {t(couple.partnerTwo.name)}
          </motion.p>
        </div>

        <motion.div
          aria-hidden="true"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={reduce ? undefined : { scaleX: 1 }}
          viewport={viewportOnce}
          transition={{ duration: duration.base, delay: 0.2, ease: ease.out }}
          className="mx-auto mb-5 mt-6 h-px w-14 origin-center bg-marigold/55"
        />

        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={viewportOnce}
          transition={{ duration: duration.base, delay: 0.26 }}
          className={`text-parchment/55 ${
            isTamil ? ta.meta : "font-label text-[10px] uppercase tracking-[0.3em]"
          }`}
        >
          {dateLine}
        </motion.p>
      </div>
    </footer>
  );
}
