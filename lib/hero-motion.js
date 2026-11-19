import { ease } from "@/lib/motion";

/** Hero phases after envelope opens */
export const HERO_PHASE = {
  IDLE: "idle",
  REVEALING: "revealing",
  SETTLED: "settled",
};

/** Auto-reveal timeline (seconds from hasOpened) */
export const heroTiming = {
  decor: 0.75,
  names: 0.55,
  coupleStart: 0.2,
  coupleEnter: 1.4,
  settledAt: 2.6,
};

export const heroEase = {
  ...ease,
  couple: [0.22, 1, 0.36, 1],
};

/**
 * Breakpoints (min-width, px) — largest match wins.
 *
 * Ranges (edit the matching key in coupleLayout):
 *   mobileSm   0–374
 *   mobile     375–389
 *   mobileMd   390–429
 *   mobileLg   430–639
 *   tabletSm   640–767
 *   tablet     768–1023
 *   desktop    1024–1279
 *   desktopLg  1280–1535
 *   desktopXl  1536+
 */
export const COUPLE_LAYOUT_BREAKPOINTS = [
  { min: 1536, key: "desktopXl" },
  { min: 1280, key: "desktopLg" },
  { min: 1024, key: "desktop" },
  { min: 768, key: "tablet" },
  { min: 640, key: "tabletSm" },
  { min: 430, key: "mobileLg" },
  { min: 390, key: "mobileMd" },
  { min: 375, key: "mobile" },
  { min: 0, key: "mobileSm" },
];

/** Resolve layout key from viewport width. */
export function resolveCoupleLayoutKey(width = 0) {
  for (const bp of COUPLE_LAYOUT_BREAKPOINTS) {
    if (width >= bp.min) return bp.key;
  }
  return "mobileSm";
}

/**
 * Couple composition — bride left, groom right.
 * Positive bride `x` / negative groom `x` pull them together for a tight gap.
 * Tuned per screen size so heads clear name copy and florals.
 */
export const coupleLayout = {
  /** 0–374px — small phones (SE 320, compact Androids, narrow responsive) */
  mobileSm: {
    stageTop: "52%",
    stageBottom: "5%",
    maxWidth: "100%",
    bride: {
      side: "right",
      width: "calc(50% - 6px)",
      inset: "0%",
      x: "0%",
      y: "0%",
      scale: 0.97,
    },
    groom: {
      side: "left",
      width: "calc(50% - 6px)",
      inset: "0%",
      x: "-5%",
      y: "0%",
      scale: 1.2,
    },
  },

  /** 375–389px — standard phones */
  mobile: {
    stageTop: "50%",
    stageBottom: "5%",
    maxWidth: "100%",
    bride: {
      side: "right",
      width: "calc(50% - 6px)",
      inset: "0%",
      x: "0%",
      y: "0%",
      scale: 0.9,
    },
    groom: {
      side: "left",
      width: "calc(50% - 6px)",
      inset: "0%",
      x: "0%",
      y: "0%",
      scale: 1.2,
    },
  },

  /** ~390–429px — iPhone 12–14 class */
  mobileMd: {
    stageTop: "49%",
    stageBottom: "4.5%",
    maxWidth: "100%",
    bride: {
      side: "right",
      width: "calc(50% - 5px)",
      inset: "0%",
      x: "0%",
      y: "0%",
      scale: 0.9,
    },
    groom: {
      side: "left",
      width: "calc(50% - 5px)",
      inset: "0%",
      x: "-2%",
      y: "0%",
      scale: 1.2,
    },
  },

  /** ~430–639px — large phones / small phablets */
  mobileLg: {
    stageTop: "47%",
    stageBottom: "4%",
    maxWidth: "100%",
    bride: {
      side: "right",
      width: "45%",
      inset: "1%",
      x: "0%",
      y: "0%",
      scale: 0.95,
    },
    groom: {
      side: "left",
      width: "45%",
      inset: "1%",
      x: "-2%",
      y: "0%",
      scale: 1.3,
    },
  },

  /** ~640–767px — small tablets / large landscape phones */
  tabletSm: {
    stageTop: "30%",
    stageBottom: "3%",
    maxWidth: "36rem",
    bride: {
      side: "right",
      width: "46%",
      inset: "2%",
      x: "-20%",
      y: "0%",
      scale: 1.02,
    },
    groom: {
      side: "left",
      width: "48%",
      inset: "2%",
      x: "20%",
      y: "0%",
      scale: 0.96,
    },
  },

  /** ~768–1023px — tablets */
  tablet: {
    stageTop: "26%",
    stageBottom: "2.5%",
    maxWidth: "42rem",
    bride: {
      side: "right",
      width: "46%",
      inset: "2%",
      x: "-20%",
      y: "0%",
      scale: 0.95,
    },
    groom: {
      side: "left",
      width: "45%",
      inset: "2%",
      x: "25%",
      y: "0%",
      scale: 0.87,
    },
  },

  /** ~1024–1279px — laptop / small desktop */
  desktop: {
    stageTop: "30%",
    stageBottom: "3%",
    maxWidth: "48rem",
    bride: {
      side: "right",
      width: "36%",
      inset: "4%",
      x: "-40%",
      y: "0%",
      scale: 1,
    },
    groom: {
      side: "left",
      width: "42%",
      inset: "4%",
      x: "35%",
      y: "0%",
      scale: 0.87,
    },
  },

  /** ~1280–1535px — large desktop */
  desktopLg: {
    stageTop: "22%",
    stageBottom: "3%",
    maxWidth: "52rem",
    bride: {
      side: "right",
      width: "35%",
      inset: "5%",
      x: "-55%",
      y: "0%",
      scale: 1,
    },
    groom: {
      side: "left",
      width: "40%",
      inset: "5%",
      x: "37%",
      y: "0%",
      scale: 0.8,
    },
  },

  /** ≥1536px — wide / ultrawide (match desktopLg font + couple config) */
  desktopXl: {
    stageTop: "22%",
    stageBottom: "3%",
    maxWidth: "52rem",
    bride: {
      side: "right",
      width: "35%",
      inset: "5%",
      x: "-63%",
      y: "0%",
      scale: 1,
    },
    groom: {
      side: "left",
      width: "40%",
      inset: "5%",
      x: "45%",
      y: "0  %",
      scale: 0.8,
    },
  },
};

/** @deprecated Use mobileLg — kept so older imports keep working */
coupleLayout.largeMobile = coupleLayout.mobileLg;

export const petalCounts = {
  idle: 0,
  revealing: 14,
  settled: 12,
};
