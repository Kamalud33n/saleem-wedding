export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  soft: [0.33, 1, 0.68, 1],
};

export const duration = {
  fast: 0.35,
  base: 0.7,
  slow: 1.05,
  reveal: 0.9,
};

export const viewportOnce = { once: true, amount: 0.32, margin: "0px 0px -6% 0px" };

/** Soft once-trigger for journey seams / secondary ornaments */
export const viewportSeam = { once: true, amount: 0.55, margin: "0px" };

export const fadeRise = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: duration.reveal, ease: ease.out },
  },
};

export const fadeSoft = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: duration.base, ease: ease.soft },
  },
};

export const maskUp = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: duration.reveal, ease: ease.out },
  },
};

export const stagger = (staggerChildren = 0.1, delayChildren = 0.05) => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.base, ease: ease.out },
  },
};
