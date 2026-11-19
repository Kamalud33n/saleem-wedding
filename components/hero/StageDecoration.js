"use client";

import useCoupleLayout from "@/hooks/useCoupleLayout";

/**
 * Single full stage-frame PNG per layout key (top + sides in one asset).
 * Files live in /public/wedding/hero/stage/
 *
 * Intrinsic sizes match the current exports (used for aspect-ratio).
 */
const STAGE_FRAME_SRC = {
  mobileSm: {
    src: "/wedding/hero/stage/stage-frame-mobile-sm.png",
    width: 720,
    height: 1456,
  },
  mobile: {
    src: "/wedding/hero/stage/stage-frame-mobile.png",
    width: 800,
    height: 1328,
  },
  mobileMd: {
    src: "/wedding/hero/stage/stage-frame-mobile.png",
    width: 800,
    height: 1328,
  },
  mobileLg: {
    src: "/wedding/hero/stage/stage-frame-mobile-lg.png",
    width: 848,
    height: 1264,
  },
  tabletSm: {
    src: "/wedding/hero/stage/stage-frame-tablet-sm.png",
    width: 1024,
    height: 1024,
  },
  tablet: {
    src: "/wedding/hero/stage/stage-frame-tablet.png",
    width: 1136,
    height: 944,
  },
  desktop: {
    src: "/wedding/hero/stage/stage-frame-desktop.png",
    width: 1232,
    height: 864,
  },
  desktopLg: {
    src: "/wedding/hero/stage/stage-frame-desktop-lg.png",
    width: 1456,
    height: 720,
  },
  desktopXl: {
    src: "/wedding/hero/stage/stage-frame-desktop-xl.png",
    width: 1504,
    height: 704,
  },
};

/**
 * Size & position per layout key — edit only this map to tune the frame.
 *
 *   top / left   Position of the frame box (% or px). Negative values pull
 *                past the hero edge (useful to hide PNG padding).
 *   width        Frame box width (% of hero). Start at "100%".
 *   height       Frame box height. Prefer "100%" with fit:"cover", or "auto"
 *                to keep the PNG aspect ratio.
 *   scale        Grow/shrink around top-center (1 = 100%). Prefer this for
 *                “make the florals bigger” tweaks.
 *   x / y        Extra translate after scale (%, px, or rem). Positive x →
 *                right, positive y → down.
 *   fit          "cover" = fill the box (may crop); "contain" = show full art
 *                (may leave gaps). Cover is usually right for edge-flush frames.
 *   anchor       object-position — "top", "center", "top left", etc.
 */
const STAGE_FRAME_LAYOUT = {
  mobileSm: {
    top: "-15%",
    left: "0%",
    right: "0%",
    width: "100%",
    height: "100%",
    scale: 1.3,
    x: "0%",
    y: "0%",
    fit: "cover",
    anchor: "top",
  },
  mobile: {
    top: "-13.5%",
    left: "0%",
    right: "0%",
    width: "100%",
    height: "100%",
    scale: 1.2,
    x: "0%",
    y: "0%",
    fit: "cover",
    anchor: "top",
  },
  mobileMd: {
    top: "-15%",
    left: "0%",
    right: "0%",
    width: "100%",
    height: "100%",
    scale: 1.4,
    x: "0%",
    y: "0%",
    fit: "cover",
    anchor: "top",
  },
  mobileLg: {
    top: "-15%",
    left: "0%",
    width: "100%",
    height: "100%",
    scale: 1.4,
    x: "0%",
    y: "0%",
    fit: "cover",
    anchor: "top",
  },
  tabletSm: {
    top: "0%",
    left: "0%",
    width: "100%",
    height: "100%",
    scale: 1,
    x: "0%",
    y: "0%",
    fit: "cover",
    anchor: "top",
  },
  tablet: {
    top: "-22%",
    left: "0%",
    width: "100%",
    height: "100%",
    scale: 1.4,
    x: "0%",
    y: "0%",
    fit: "cover",
    anchor: "top",
  },
  desktop: {
    top: "-22%",
    left: "0%",
    width: "100%",
    height: "100%",
    scale: 1.4,
    x: "0%",
    y: "0%",
    fit: "cover",
    anchor: "top",
  },
  desktopLg: {
    top: "-22%",
    left: "0%",
    width: "100%",
    height: "100%",
    scale: 1.4,
    x: "0%",
    y: "0%",
    fit: "cover",
    anchor: "top",
  },
  desktopXl: {
    top: "-22%",
    left: "0%",
    width: "100%",
    height: "100%",
    scale: 1.2,
    x: "0%",
    y: "0%",
    fit: "cover",
    anchor: "top",
  },
};

/** Static single-frame floral stage — no top/left/right split. */
export default function StageDecoration({ visible = false }) {
  const { key: layoutKey } = useCoupleLayout();
  const key = STAGE_FRAME_SRC[layoutKey] ? layoutKey : "mobile";
  const frame = STAGE_FRAME_SRC[key];
  const layout = STAGE_FRAME_LAYOUT[key] || STAGE_FRAME_LAYOUT.mobile;

  if (!visible) return null;

  const fit = layout.fit === "contain" ? "contain" : "cover";
  const height = layout.height ?? "100%";
  const useAspect =
    height === "auto" && frame.width && frame.height
      ? `${frame.width} / ${frame.height}`
      : undefined;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-20 overflow-hidden"
      style={{
        top: layout.top ?? "0%",
        left: layout.left ?? "0%",
        width: layout.width ?? "100%",
        height,
        aspectRatio: useAspect,
        transformOrigin: "top center",
        transform: `translate(${layout.x ?? "0%"}, ${layout.y ?? "0%"}) scale(${layout.scale ?? 1})`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={frame.src}
        src={frame.src}
        alt=""
        width={frame.width}
        height={frame.height}
        draggable={false}
        className="h-full w-full"
        style={{
          objectFit: fit,
          objectPosition: layout.anchor ?? "top",
        }}
      />
    </div>
  );
}
