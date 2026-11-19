"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import uiCopy from "@/config/ui.copy";
import SectionHeader from "@/components/motion/SectionHeader";
import MemoryAddedCelebration from "@/components/guestbook/MemoryAddedCelebration";
import { useLocale } from "@/context/LocaleProvider";
import { trackEvent } from "@/lib/analytics/client";
import { validateGuestbookPayload } from "@/lib/guestbook";
import { ta } from "@/lib/tamil-type";
import { duration, ease } from "@/lib/motion";

const rotations = [-2, 1.5, -1, 2.5, -3, 1];
const SUCCESS_MS = 2200;

export default function Guestbook() {
  const { t, locale, isTamil } = useLocale();
  const reduce = useReducedMotion();

  const tagOptions = useMemo(
    () => [
      { id: "wish", label: t(uiCopy.guestbook.tagWish) },
      { id: "advice", label: t(uiCopy.guestbook.tagAdvice) },
    ],
    [t]
  );

  const [entries, setEntries] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [name, setName] = useState("");
  const [type, setType] = useState("wish");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [highlightId, setHighlightId] = useState(null);

  const submittingRef = useRef(false);
  const guestbookStartedRef = useRef(false);
  const successTimerRef = useRef(null);

  const fetchEntries = useCallback(async () => {
    setLoadState("loading");
    try {
      const response = await fetch("/api/guestbook", { cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body?.ok) {
        setLoadState("error");
        return;
      }
      setEntries(body.entries || []);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
    };
  }, []);

  const clearFieldError = useCallback((field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const resolveApiError = useCallback(
    (code) => {
      if (code === "rate_limited") return t(uiCopy.guestbook.errors.rateLimited);
      if (code === "storage_unavailable") {
        return t(uiCopy.guestbook.errors.storageUnavailable);
      }
      if (code === "write_failed") return t(uiCopy.guestbook.errors.saveFailed);
      return t(uiCopy.guestbook.errors.server);
    },
    [t]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (submittingRef.current) return;

      setFormError("");
      const validation = validateGuestbookPayload(
        { name, message, type, website },
        locale
      );

      if (!validation.ok) {
        setFieldErrors(validation.errors);
        setFormError(validation.errors._form || "");
        return;
      }

      setFieldErrors({});
      submittingRef.current = true;
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/guestbook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: validation.data.name,
            message: validation.data.message,
            type: validation.data.type,
            locale: validation.data.locale,
            website,
          }),
        });

        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (body?.errors) {
            setFieldErrors(body.errors);
            setFormError(body.errors._form || "");
          } else {
            setFormError(resolveApiError(body?.error));
          }
          return;
        }

        const entry = body.entry;
        setEntries((prev) => {
          if (prev.some((item) => item.id === entry.id)) return prev;
          return [entry, ...prev];
        });
        setMessage("");
        setCelebrate(true);
        setShowSuccess(true);
        setHighlightId(entry.id);
        trackEvent("guestbook_submitted", { type: validation.data.type });

        if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
        successTimerRef.current = window.setTimeout(() => {
          setShowSuccess(false);
          setCelebrate(false);
          setHighlightId(null);
        }, SUCCESS_MS);
      } catch {
        setFormError(t(uiCopy.guestbook.errors.network));
      } finally {
        setIsSubmitting(false);
        submittingRef.current = false;
      }
    },
    [locale, message, name, resolveApiError, t, type, website]
  );

  function tagLabel(typeId) {
    return tagOptions.find((item) => item.id === typeId)?.label || typeId;
  }

  const emptyMessage = t(uiCopy.guestbook.empty);

  return (
    <section className="relative overflow-hidden bg-[color-mix(in_srgb,var(--color-parchment-dark)_48%,var(--color-parchment))] px-5 py-16 paper-grain sm:px-6 sm:py-24">
      <div className="mx-auto max-w-[22rem] sm:max-w-md">
        <SectionHeader
          eyebrow={t(uiCopy.guestbook.eyebrow)}
          title={t(uiCopy.guestbook.title)}
          subtitle={t(uiCopy.guestbook.subtitle)}
          titleClassName={isTamil ? ta.heading : ""}
          subtitleClassName={isTamil ? ta.subhead : ""}
          eyebrowClassName={isTamil ? ta.caption : ""}
        />

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: duration.base, ease: ease.out }}
          className="relative mt-10 invite-surface border border-marigold-dark/20 p-5"
        >
          <MemoryAddedCelebration active={celebrate} />

          <form
            onSubmit={handleSubmit}
            className="relative space-y-4"
            noValidate
            onFocus={() => {
              if (guestbookStartedRef.current) return;
              guestbookStartedRef.current = true;
              trackEvent("guestbook_started");
            }}
          >
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0"
            />

            <div className="flex gap-2" role="group" aria-label={t(uiCopy.guestbook.submitAria)}>
              {tagOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setType(item.id);
                    clearFieldError("type");
                  }}
                  disabled={isSubmitting}
                  aria-pressed={type === item.id}
                  className={`min-h-9 px-3.5 py-1.5 border transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    isTamil ? ta.chip : "text-xs"
                  } ${
                    type === item.id
                      ? "border-marigold bg-marigold font-medium text-peacock-dark"
                      : "border-ink/20 text-ink-soft"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {fieldErrors.type ? (
              <p className={`text-vermilion ${isTamil ? ta.caption : "text-[11px]"}`} role="alert">
                {fieldErrors.type}
              </p>
            ) : null}

            <label className="block">
              <span className="sr-only">{t(uiCopy.guestbook.placeholderName)}</span>
              <input
                placeholder={t(uiCopy.guestbook.placeholderName)}
                value={name}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.name)}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError("name");
                  setFormError("");
                }}
                className={`w-full border-0 border-b bg-transparent py-2.5 text-ink outline-none transition-colors focus:border-marigold-dark disabled:opacity-60 ${
                  fieldErrors.name ? "border-vermilion/60" : "border-ink/25"
                } ${isTamil ? ta.body : "text-[15px]"}`}
              />
              {fieldErrors.name ? (
                <p className={`mt-1.5 text-vermilion ${isTamil ? ta.caption : "text-[11px]"}`} role="alert">
                  {fieldErrors.name}
                </p>
              ) : null}
            </label>

            <label className="block">
              <span className="sr-only">{t(uiCopy.guestbook.placeholderMessage)}</span>
              <textarea
                placeholder={t(uiCopy.guestbook.placeholderMessage)}
                value={message}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.message)}
                onChange={(e) => {
                  setMessage(e.target.value);
                  clearFieldError("message");
                  setFormError("");
                }}
                rows={3}
                className={`w-full resize-none border bg-transparent p-3 text-ink outline-none transition-colors focus:border-marigold-dark disabled:opacity-60 ${
                  fieldErrors.message ? "border-vermilion/60" : "border-ink/20"
                } ${isTamil ? ta.body : "text-[15px]"}`}
              />
              {fieldErrors.message ? (
                <p className={`mt-1.5 text-vermilion ${isTamil ? ta.caption : "text-[11px]"}`} role="alert">
                  {fieldErrors.message}
                </p>
              ) : null}
            </label>

            {formError ? (
              <p
                role="alert"
                className={`rounded-sm border border-vermilion/25 bg-vermilion/5 px-3 py-2.5 text-vermilion ${
                  isTamil ? ta.body : "text-[13px] leading-relaxed"
                }`}
              >
                {formError}
              </p>
            ) : null}

            <AnimatePresence>
              {showSuccess ? (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`text-center text-peacock ${
                    isTamil ? ta.body : "text-[13px] leading-relaxed"
                  }`}
                  role="status"
                >
                  {t(uiCopy.guestbook.success)}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              aria-label={t(uiCopy.guestbook.submitAria)}
              className={`flex min-h-12 w-full items-center justify-center gap-2 bg-betel py-3 text-parchment transition-opacity disabled:cursor-not-allowed disabled:opacity-60 ${
                isTamil ? ta.button : "font-label text-[11px] uppercase tracking-[0.2em]"
              }`}
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : null}
              {isSubmitting ? t(uiCopy.guestbook.submitting) : t(uiCopy.guestbook.submit)}
            </button>
          </form>
        </motion.div>

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {loadState === "loading"
            ? ""
            : loadState === "error"
              ? t(uiCopy.guestbook.loadError)
              : `${entries.length} memories`}
        </div>

        {loadState === "error" ? (
          <p
            className={`mt-6 text-center text-ink-soft ${
              isTamil ? ta.body : "text-[13px] leading-relaxed"
            }`}
          >
            {t(uiCopy.guestbook.loadError)}
          </p>
        ) : null}

        {loadState === "ready" && entries.length === 0 ? (
          <p
            className={`mt-8 text-center text-ink-soft/80 ${
              isTamil ? ta.subhead : "font-body text-[13px] leading-relaxed"
            }`}
          >
            {emptyMessage}
          </p>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {loadState === "ready"
              ? entries.map((note, i) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 14, rotate: 0 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      rotate: reduce ? 0 : rotations[i % rotations.length],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: ease.out }}
                    className={`border bg-[#fffdf8] p-4 shadow-[0_14px_28px_-20px_rgba(36,27,18,0.4)] ${
                      highlightId === note.id
                        ? "border-marigold-dark/50 ring-1 ring-marigold/40"
                        : "border-ink/5"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span
                        className={`min-w-0 break-words text-peacock ${
                          isTamil ? ta.meta + " font-medium" : "font-display italic text-base"
                        }`}
                      >
                        {note.name}
                      </span>
                      <span
                        className={`flex shrink-0 items-center gap-1 text-vermilion ${
                          isTamil
                            ? ta.caption
                            : "font-label text-[9px] uppercase tracking-[0.15em]"
                        }`}
                      >
                        <Heart size={10} fill="currentColor" aria-hidden="true" />
                        {tagLabel(note.type)}
                      </span>
                    </div>
                    <p
                      className={`break-words text-ink-soft ${
                        isTamil ? ta.body : "text-[13px] leading-relaxed"
                      }`}
                    >
                      {note.message}
                    </p>
                  </motion.div>
                ))
              : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
