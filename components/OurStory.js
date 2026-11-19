"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import weddingConfig from "@/config/wedding.config";
import uiCopy, { formatCopy } from "@/config/ui.copy";
import SectionHeader from "@/components/motion/SectionHeader";
import { useLocale } from "@/context/LocaleProvider";
import { ta } from "@/lib/tamil-type";
import { duration, ease, viewportOnce } from "@/lib/motion";

const offsets = [
  { rotate: -1.4 },
  { rotate: 1.6 },
  { rotate: -1.1 },
  { rotate: 1.3 },
  { rotate: -1.2 },
];

function PhotoPlate({ photo, index, caption, altFallback }) {
  const reduce = useReducedMotion();
  const { isTamil } = useLocale();
  const offset = offsets[index % offsets.length];
  const width = photo.width || 1600;
  const height = photo.height || 1200;

  return (
    <motion.figure
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0, rotate: offset.rotate }}
      viewport={viewportOnce}
      whileHover={reduce ? undefined : { rotate: 0, scale: 1.01 }}
      transition={{ duration: duration.reveal, delay: index * 0.06, ease: ease.out }}
      className="relative origin-center bg-[#fffdf8] p-2.5 pb-4 shadow-[0_22px_44px_-28px_rgba(36,27,18,0.48)]"
    >
      <div className="relative w-full overflow-hidden bg-parchment-dark/40">
        <Image
          src={photo.src}
          alt={caption || altFallback}
          width={width}
          height={height}
          sizes="(max-width: 640px) 92vw, 26rem"
          className="h-auto w-full"
          priority={index === 0}
        />
      </div>

      {caption ? (
        <figcaption
          className={`mt-3 text-center text-ink-soft ${
            isTamil ? ta.meta : "font-display italic text-[13px]"
          }`}
        >
          {caption}
        </figcaption>
      ) : null}
    </motion.figure>
  );
}

export default function OurStory() {
  const gallery = weddingConfig.engagementGallery;
  const { t, isTamil } = useLocale();
  const photos = (gallery?.photos ?? [])
    .filter((photo) => Boolean(photo.src))
    .slice()
    .sort((a, b) => Number(a.id) - Number(b.id));

  return (
    <section
      className="relative overflow-hidden px-5 py-16 sm:px-6 sm:py-24 paper-grain bg-parchment"
      aria-label={t(uiCopy.engagement.aria)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 sm:h-32"
        style={{
          background:
            "linear-gradient(180deg, var(--color-parchment) 0%, color-mix(in srgb, var(--color-parchment) 40%, transparent) 55%, transparent 100%)",
        }}
      />

      <div className="relative z-[1] mx-auto max-w-[22rem] sm:max-w-md">
        <SectionHeader
          eyebrow={t(gallery.eyebrow)}
          title={t(gallery.title)}
          subtitle={t(gallery.subtitle)}
          titleClassName={isTamil ? ta.heading : ""}
          subtitleClassName={isTamil ? ta.subhead : ""}
          eyebrowClassName={isTamil ? ta.caption : ""}
        />

        <div className="mt-12 space-y-8 sm:space-y-10">
          {photos.map((photo, index) => (
            <PhotoPlate
              key={photo.id}
              photo={photo}
              index={index}
              caption={t(photo.caption)}
              altFallback={formatCopy(t(uiCopy.engagement.photoFallback), {
                id: photo.id,
              })}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
