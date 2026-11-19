"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import uiCopy, { formatCopy } from "@/config/ui.copy";
import ScratchHintGesture from "@/components/discover-date/ScratchHintGesture";
import { useLocale } from "@/context/LocaleProvider";
import { ta } from "@/lib/tamil-type";
import { ease } from "@/lib/motion";

/**
 * Architecture (production scratch pattern):
 *
 * 1. Shape authority = one CSS mask (SVG heart, stretched to the box).
 *    Reveal + foil + shimmer all live INSIDE that masked wrapper — they
 *    cannot misalign.
 * 2. Canvas paints a full-bleed foil rect, then destination-in with the
 *    same heart path (scaled to box) so the bitmap matches the mask and
 *    progress sampling is accurate.
 * 3. Scratch = destination-out brushes (industry standard).
 * 4. Pointer coords are normalized against getBoundingClientRect so Framer
 *    scale transforms do not skew the brush. Canvas size uses clientWidth/
 *    clientHeight so scale transforms do not trigger foil resets.
 */

const HEART_PATH =
  "M50 91.5C50 91.5 7.5 63.5 7.5 37.5C7.5 23.5 19.5 11.5 33.5 11.5C41 11.5 46.5 15.5 50 22C53.5 15.5 59 11.5 66.5 11.5C80.5 11.5 92.5 23.5 92.5 37.5C92.5 63.5 50 91.5 50 91.5Z";

const HEART_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path fill="#fff" d="${HEART_PATH}"/></svg>`
)}")`;

const MASK_STYLE = {
  WebkitMaskImage: HEART_MASK,
  maskImage: HEART_MASK,
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
};

const REVEAL_THRESHOLD = 0.4;
const BRUSH_RADIUS = 16;

export default function ScratchHeart({
  value,
  label,
  index = 0,
  onComplete,
  forceReveal = false,
  showScratchHint = false,
  onInteract,
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const drawingRef = useRef(false);
  const completedRef = useRef(false);
  const lastPointRef = useRef(null);
  const opaqueRef = useRef(0);
  const [completed, setCompleted] = useState(false);
  const [pressed, setPressed] = useState(false);
  const reduce = useReducedMotion();
  const { t, isTamil } = useLocale();

  const paintFoil = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const { w, h, dpr } = sizeRef.current;
    if (!w || !h) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);

    // Full-bleed foil — shape comes from destination-in + CSS mask.
    const base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, "#f6d798");
    base.addColorStop(0.35, "#e8a93c");
    base.addColorStop(0.7, "#c9923a");
    base.addColorStop(1, "#a86b1c");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    const sheen = ctx.createLinearGradient(0, 0, w * 0.55, h);
    sheen.addColorStop(0, "rgba(255,253,248,0.5)");
    sheen.addColorStop(0.45, "rgba(255,255,255,0.08)");
    sheen.addColorStop(1, "rgba(168,107,28,0.12)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255,255,255,0.22)";
    for (let i = 0; i < 56; i += 1) {
      const x = ((i * 17 + index * 9) % 97) * (w / 100);
      const y = ((i * 23 + index * 5) % 93) * (h / 100);
      ctx.fillRect(x, y, 1.1, 0.7);
    }

    // Bitmap = exact heart (same path / stretch as CSS mask).
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = "#000";
    ctx.save();
    ctx.scale(w / 100, h / 100);
    ctx.fill(new Path2D(HEART_PATH));
    ctx.restore();
    ctx.globalCompositeOperation = "source-over";

    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let opaque = 0;
      const step = 16;
      for (let i = 3; i < data.length; i += 4 * step) {
        if (data[i] > 32) opaque += 1;
      }
      opaqueRef.current = Math.max(1, opaque);
    } catch {
      opaqueRef.current = 1;
    }
  }, [index]);

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root || completedRef.current) return;

    // Layout size only — ignores Framer scale transforms.
    const cssW = Math.max(1, Math.round(root.clientWidth));
    const cssH = Math.max(1, Math.round(root.clientHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const prev = sizeRef.current;

    if (prev.w === cssW && prev.h === cssH && prev.dpr === dpr) return;

    sizeRef.current = { w: cssW, h: cssH, dpr };
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    paintFoil();
  }, [paintFoil]);

  useEffect(() => {
    syncCanvasSize();
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", syncCanvasSize);
      return () => window.removeEventListener("resize", syncCanvasSize);
    }
    const ro = new ResizeObserver(() => syncCanvasSize());
    ro.observe(root);
    return () => ro.disconnect();
  }, [syncCanvasSize]);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setCompleted(true);
    setPressed(false);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    if (forceReveal) finish();
  }, [forceReveal, finish]);

  const pointerToCanvas = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const { w, h } = sizeRef.current;
    if (!canvas || !w || !h) return null;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    // Normalize through visual rect so CSS transforms stay accurate.
    return {
      x: ((clientX - rect.left) / rect.width) * w,
      y: ((clientY - rect.top) / rect.height) * h,
    };
  };

  const scratchAt = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas || completedRef.current) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const pt = pointerToCanvas(clientX, clientY);
    if (!pt) return;

    const { dpr } = sizeRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH_RADIUS * 2;
    ctx.fillStyle = "#000";
    ctx.strokeStyle = "#000";

    const last = lastPointRef.current;
    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    lastPointRef.current = pt;
  };

  const measure = () => {
    const canvas = canvasRef.current;
    if (!canvas || completedRef.current) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    let sample;
    try {
      sample = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    } catch {
      return;
    }
    let remaining = 0;
    const step = 16;
    for (let i = 3; i < sample.length; i += 4 * step) {
      if (sample[i] > 32) remaining += 1;
    }
    if (1 - remaining / opaqueRef.current >= REVEAL_THRESHOLD) finish();
  };

  const onPointerDown = (e) => {
    if (completed) return;
    e.preventDefault();
    onInteract?.();
    if (reduce) {
      finish();
      return;
    }
    drawingRef.current = true;
    setPressed(true);
    lastPointRef.current = null;
    canvasRef.current?.setPointerCapture?.(e.pointerId);
    scratchAt(e.clientX, e.clientY);
  };

  const onPointerMove = (e) => {
    if (!drawingRef.current || completed) return;
    e.preventDefault();
    scratchAt(e.clientX, e.clientY);
  };

  const onPointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    setPressed(false);
    lastPointRef.current = null;
    measure();
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.75, delay: 0.06 + index * 0.1, ease: ease.out }}
    >
      <motion.div
        ref={rootRef}
        className="relative"
        animate={
          completed
            ? { scale: [1, 1.06, 1] }
            : pressed
              ? { scale: 0.98 }
              : { scale: 1 }
        }
        transition={
          completed ? { duration: 0.45, ease: ease.out } : { duration: 0.15 }
        }
        style={{
          width: "clamp(5.25rem, 26vw, 7rem)",
          aspectRatio: "1 / 1",
          overflow: "visible",
        }}
      >
        {/* Soft ground shadow — outside the mask */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[16%] bottom-[2%] h-[12%] rounded-full bg-ink/15 blur-md"
        />

        {/* One mask wraps reveal + foil — impossible to desync shapes */}
        <div className="absolute inset-0" style={MASK_STYLE}>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background:
                "color-mix(in srgb, white 92%, var(--color-parchment))",
            }}
          >
            <motion.p
              className="font-display italic leading-none text-peacock"
              style={{ fontSize: "clamp(1.35rem, 6.5vw, 1.85rem)" }}
              animate={
                completed
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0.96, scale: 0.98 }
              }
              transition={{ duration: 0.4, ease: ease.out }}
            >
              {value}
            </motion.p>
          </div>

          {!completed && (
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 h-full w-full touch-none ${
                pressed ? "cursor-grabbing" : "cursor-grab"
              }`}
              role="img"
              aria-label={formatCopy(t(uiCopy.discover.scratchAria), {
                label,
                value,
              })}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onInteract?.();
                  finish();
                }
              }}
              tabIndex={0}
            />
          )}

          {!completed && !reduce && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(115deg, transparent 40%, rgba(255,253,248,0.35) 50%, transparent 60%)",
                backgroundSize: "220% 100%",
              }}
              animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "linear",
                delay: index * 0.45,
              }}
            />
          )}

          {showScratchHint && !completed && !reduce ? (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute h-[38%] w-[38%] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,253,248,0.55) 0%, rgba(232,169,60,0.28) 42%, transparent 70%)",
                mixBlendMode: "soft-light",
              }}
              initial={{ opacity: 0 }}
              animate={{
                left: ["10%", "46%", "14%", "50%", "12%"],
                top: ["22%", "36%", "52%", "40%", "24%"],
                opacity: [0.2, 0.85, 0.35, 0.8, 0.2],
              }}
              transition={{
                duration: 2.35,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.85,
                delay: 1.1,
              }}
            />
          ) : null}
        </div>

        {showScratchHint && !completed ? <ScratchHintGesture /> : null}
      </motion.div>

      <p
        className={`text-ink-soft/70 ${
          isTamil
            ? ta.caption
            : "font-label text-[8px] uppercase tracking-[0.28em] sm:text-[9px]"
        }`}
      >
        {label}
      </p>
    </motion.div>
  );
}
