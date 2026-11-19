"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import weddingConfig from "@/config/wedding.config";
import SectionHeader from "@/components/motion/SectionHeader";
import { useLocale } from "@/context/LocaleProvider";
import { trackEvent } from "@/lib/analytics/client";
import { ta } from "@/lib/tamil-type";
import { duration, ease, viewportOnce } from "@/lib/motion";

export default function Ceremonies() {
  const reduce = useReducedMotion();
  const { t, isTamil } = useLocale();
  const section = weddingConfig.ceremoniesSection || {};

  return (
    <section className="relative overflow-hidden bg-[color-mix(in_srgb,var(--color-parchment-dark)_48%,var(--color-parchment))] px-5 py-16 paper-grain sm:px-6 sm:py-24">
      <div className="mx-auto max-w-[22rem] sm:max-w-md">
        <SectionHeader
          eyebrow={t(section.eyebrow)}
          title={t(section.title)}
          subtitle={t(section.subtitle)}
          titleClassName={isTamil ? ta.heading : ""}
          subtitleClassName={isTamil ? ta.subhead : ""}
          eyebrowClassName={isTamil ? ta.caption : ""}
        />

        <ol className="relative mt-12">
          <motion.div
            aria-hidden="true"
            initial={reduce ? false : { scaleY: 0 }}
            whileInView={reduce ? undefined : { scaleY: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 1.15, ease: ease.out }}
            className="absolute bottom-3 left-[11px] top-3 w-px origin-top bg-gradient-to-b from-marigold-dark via-peacock/35 to-transparent"
          />

          {weddingConfig.ceremonies.map((event, i) => (
            <motion.li
              key={event.id}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: duration.reveal,
                delay: reduce ? 0 : 0.1 + i * 0.12,
                ease: ease.out,
              }}
              className="relative pb-11 pl-10 last:pb-0"
            >
              <motion.span
                initial={reduce ? false : { scale: 0.55, opacity: 0 }}
                whileInView={reduce ? undefined : { scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: i * 0.1 }}
                className="absolute left-0 top-2 flex h-[23px] w-[23px] items-center justify-center rounded-full border-[3px] border-parchment bg-marigold shadow-[0_0_0_3px_rgba(234,223,196,0.85)]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-peacock-dark" />
              </motion.span>

              <article className="invite-surface border border-marigold-dark/20 px-4 py-4 sm:px-5 sm:py-5">
                <motion.p
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={reduce ? undefined : { opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.08, duration: duration.base }}
                  className={`mb-1.5 text-vermilion ${
                    isTamil
                      ? ta.caption
                      : "font-label text-[9px] uppercase tracking-[0.24em]"
                  }`}
                >
                  {t(event.date)}
                </motion.p>

                <h3
                  className={`mb-2 text-peacock ${
                    isTamil
                      ? ta.cardTitle
                      : "font-display italic text-[1.35rem] leading-snug sm:text-2xl"
                  }`}
                >
                  {t(event.title)}
                </h3>

                {event.note ? (
                  <p
                    className={`mb-3.5 text-ink ${
                      isTamil ? ta.body : "text-[13px] leading-relaxed"
                    }`}
                  >
                    {t(event.note)}
                  </p>
                ) : null}

                <div
                  className={`space-y-2 text-ink-soft ${
                    isTamil ? "" : "text-[12px]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Clock
                      size={13}
                      strokeWidth={1.7}
                      className="mt-0.5 shrink-0 text-peacock"
                      aria-hidden="true"
                    />
                    <span className={isTamil ? ta.meta : "leading-relaxed"}>
                      {t(event.time)}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={13}
                      strokeWidth={1.7}
                      className="mt-0.5 shrink-0 text-peacock"
                      aria-hidden="true"
                    />
                    <span
                      className={`min-w-0 break-words ${
                        isTamil ? ta.meta : "leading-relaxed"
                      }`}
                    >
                      {t(event.venue)}
                      {event.city ? `, ${t(event.city)}` : ""}
                    </span>
                  </div>
                </div>

                <a
                  href={
                    event.mapsUrl ||
                    `https://maps.google.com/?q=${encodeURIComponent(event.mapsQuery)}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent("directions_clicked", { eventId: event.id })}
                  className={`mt-4 inline-flex min-h-11 items-center border-b border-marigold pb-0.5 text-peacock transition-colors hover:text-peacock-light ${
                    isTamil
                      ? ta.caption
                      : "font-label text-[9px] uppercase tracking-[0.2em]"
                  }`}
                >
                  {t(section.directions)}
                </a>
              </article>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
