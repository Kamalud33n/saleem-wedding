"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, Loader2, Send } from "lucide-react";
import weddingConfig from "@/config/wedding.config";
import uiCopy, { formatCopy } from "@/config/ui.copy";
import SectionHeader from "@/components/motion/SectionHeader";
import SendLoveCelebration from "@/components/rsvp/SendLoveCelebration";
import { useLocale } from "@/context/LocaleProvider";
import { trackEvent } from "@/lib/analytics/client";
import { ta } from "@/lib/tamil-type";
import { readStoredRsvp, writeStoredRsvp } from "@/lib/rsvp-storage";
import { validateRsvpPayload } from "@/lib/rsvp";
import { duration, ease } from "@/lib/motion";

const CELEBRATION_MS = 1200;

export default function RSVP() {
  const { question, options, moods } = weddingConfig.rsvp;
  const { t, locale, isTamil } = useLocale();
  const reduce = useReducedMotion();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guess, setGuess] = useState(null);
  const [mood, setMood] = useState(null);
  const [website, setWebsite] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [phase, setPhase] = useState("form");
  const [savedName, setSavedName] = useState("");

  const submittingRef = useRef(false);
  const rsvpStartedRef = useRef(false);

  const isSubmitting = phase === "submitting";
  const isCelebrating = phase === "celebrating";
  const submitted = phase === "thanks";

  useEffect(() => {
    const stored = readStoredRsvp();
    if (stored?.submitted) {
      setSavedName(stored.name);
      setPhase("thanks");
    }
  }, []);

  const markRsvpStarted = useCallback(() => {
    if (rsvpStartedRef.current) return;
    rsvpStartedRef.current = true;
    trackEvent("rsvp_started");
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
      if (code === "rate_limited") return t(uiCopy.rsvp.errors.rateLimited);
      if (code === "send_failed" || code === "server_misconfigured") {
        return t(uiCopy.rsvp.errors.sendFailed);
      }
      return t(uiCopy.rsvp.errors.server);
    },
    [t]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (submittingRef.current || submitted) return;

      setFormError("");
      const validation = validateRsvpPayload(
        { name, phone, guess, mood, website },
        locale
      );

      if (!validation.ok) {
        setFieldErrors(validation.errors);
        setFormError(validation.errors._form || "");
        return;
      }

      setFieldErrors({});
      submittingRef.current = true;
      setPhase("submitting");

      try {
        const response = await fetch("/api/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: validation.data.name,
            phone: validation.data.phone,
            guess: validation.data.guess,
            mood: validation.data.mood,
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
          trackEvent("rsvp_submission_failed", { error: body?.error || "unknown" });
          setPhase("form");
          submittingRef.current = false;
          return;
        }

        setSavedName(validation.data.name);
        writeStoredRsvp({ name: validation.data.name });
        trackEvent("rsvp_submitted");
        setPhase("celebrating");

        window.setTimeout(() => {
          setPhase("thanks");
          submittingRef.current = false;
        }, reduce ? 400 : CELEBRATION_MS);
      } catch {
        setFormError(t(uiCopy.rsvp.errors.network));
        trackEvent("rsvp_submission_failed", { error: "network" });
        setPhase("form");
        submittingRef.current = false;
      }
    },
    [guess, locale, mood, name, phone, reduce, resolveApiError, submitted, t, website]
  );

  return (
    <section className="relative overflow-hidden px-5 py-16 paper-grain sm:px-6 sm:py-24">
      <div className="mx-auto max-w-[22rem] sm:max-w-md">
        <SectionHeader
          eyebrow={t(uiCopy.rsvp.eyebrow)}
          title={t(uiCopy.rsvp.title)}
          subtitle={t(uiCopy.rsvp.subtitle)}
          titleClassName={isTamil ? ta.heading : ""}
          subtitleClassName={isTamil ? ta.subhead : ""}
          eyebrowClassName={isTamil ? ta.caption : ""}
        />

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: duration.reveal, ease: ease.out }}
          className="relative mt-10 overflow-hidden invite-surface border border-marigold-dark/20 p-5 sm:p-7"
        >
          <div className="pointer-events-none absolute inset-x-4 top-3 h-px bg-marigold-dark/25" />
          <div className="pointer-events-none absolute inset-x-4 bottom-3 h-px bg-marigold-dark/20" />

          <SendLoveCelebration active={isCelebrating} />

          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {isSubmitting
              ? t(uiCopy.rsvp.submitting)
              : submitted
                ? t(uiCopy.rsvp.thanksTitle)
                : formError}
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={reduce ? false : { scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.45, ease: ease.out }}
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-betel/15"
                >
                  <Check size={20} className="text-betel" aria-hidden="true" />
                </motion.div>
                <h3
                  className={`mb-2 text-peacock ${
                    isTamil ? ta.cardTitle : "font-display italic text-2xl"
                  }`}
                >
                  {t(uiCopy.rsvp.thanksTitle)}
                </h3>
                <p
                  className={`mx-auto max-w-[16rem] text-ink-soft ${
                    isTamil ? ta.body : "text-sm leading-relaxed"
                  }`}
                >
                  {formatCopy(t(uiCopy.rsvp.thanksBody), {
                    name: savedName.split(" ")[0],
                  })}
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: isCelebrating ? 0.35 : 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="relative space-y-7"
                noValidate
                onFocus={markRsvpStarted}
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

                <fieldset className="space-y-4" disabled={isSubmitting || isCelebrating}>
                  <legend
                    className={`mb-1 text-betel ${
                      isTamil
                        ? ta.caption
                        : "font-label text-[10px] uppercase tracking-[0.25em]"
                    }`}
                  >
                    {t(uiCopy.rsvp.guestDetails)}
                  </legend>
                  <FieldInput
                    label={t(uiCopy.rsvp.yourName)}
                    value={name}
                    onChange={(v) => {
                      setName(v);
                      clearFieldError("name");
                      setFormError("");
                    }}
                    autoComplete="name"
                    isTamil={isTamil}
                    error={fieldErrors.name}
                    disabled={isSubmitting || isCelebrating}
                  />
                  <FieldInput
                    label={t(uiCopy.rsvp.phone)}
                    value={phone}
                    onChange={(v) => {
                      setPhone(v);
                      clearFieldError("phone");
                      setFormError("");
                    }}
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    isTamil={isTamil}
                    error={fieldErrors.phone}
                    disabled={isSubmitting || isCelebrating}
                  />
                </fieldset>

                <fieldset disabled={isSubmitting || isCelebrating}>
                  <legend
                    className={`mb-3 text-betel ${
                      isTamil
                        ? ta.caption
                        : "font-label text-[10px] uppercase tracking-[0.25em]"
                    }`}
                  >
                    {t(question)}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt) => (
                      <ChoicePill
                        key={opt.id}
                        label={t(opt.label)}
                        active={guess === opt.id}
                        onClick={() => {
                          setGuess(opt.id);
                          clearFieldError("guess");
                        }}
                        isTamil={isTamil}
                        disabled={isSubmitting || isCelebrating}
                      />
                    ))}
                  </div>
                  {fieldErrors.guess ? (
                    <p className={`mt-2 text-vermilion ${isTamil ? ta.caption : "text-[11px]"}`}>
                      {fieldErrors.guess}
                    </p>
                  ) : null}
                </fieldset>

                <fieldset disabled={isSubmitting || isCelebrating}>
                  <legend
                    className={`mb-3 text-betel ${
                      isTamil
                        ? ta.caption
                        : "font-label text-[10px] uppercase tracking-[0.25em]"
                    }`}
                  >
                    {t(uiCopy.rsvp.comingFor)}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((m) => (
                      <ChoicePill
                        key={m.id}
                        label={t(m.label)}
                        active={mood === m.id}
                        onClick={() => {
                          setMood(m.id);
                          clearFieldError("mood");
                        }}
                        isTamil={isTamil}
                        disabled={isSubmitting || isCelebrating}
                      />
                    ))}
                  </div>
                  {fieldErrors.mood ? (
                    <p className={`mt-2 text-vermilion ${isTamil ? ta.caption : "text-[11px]"}`}>
                      {fieldErrors.mood}
                    </p>
                  ) : null}
                </fieldset>

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

                <motion.button
                  type="submit"
                  disabled={isSubmitting || isCelebrating}
                  aria-busy={isSubmitting}
                  aria-label={t(uiCopy.rsvp.submitAria)}
                  whileTap={!isSubmitting && !isCelebrating && !reduce ? { scale: 0.98 } : {}}
                  className={`relative flex min-h-12 w-full items-center justify-center gap-2 bg-peacock py-3.5 text-parchment transition-opacity disabled:cursor-not-allowed disabled:opacity-60 ${
                    isTamil
                      ? ta.button
                      : "font-label text-[11px] uppercase tracking-[0.2em]"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Send size={14} aria-hidden="true" />
                  )}
                  {isSubmitting ? t(uiCopy.rsvp.submitting) : t(uiCopy.rsvp.submit)}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  isTamil,
  error,
  disabled,
}) {
  const errorId = error ? `${label}-error` : undefined;

  return (
    <label className="block">
      <span
        className={`mb-1.5 block text-ink-soft ${
          isTamil ? ta.meta : "text-[12px]"
        }`}
      >
        {label}
      </span>
      <input
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={value}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border-0 border-b bg-transparent text-ink outline-none transition-colors focus:border-marigold-dark disabled:opacity-60 ${
          error ? "border-vermilion/60" : "border-ink/25"
        } ${isTamil ? `${ta.body} py-2.5` : "py-2.5 text-[15px]"}`}
      />
      {error ? (
        <p
          id={errorId}
          role="alert"
          className={`mt-1.5 text-vermilion ${isTamil ? ta.caption : "text-[11px] leading-snug"}`}
        >
          {error}
        </p>
      ) : null}
    </label>
  );
}

function ChoicePill({ label, active, onClick, isTamil, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-10 px-3.5 py-2 border transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        isTamil ? ta.chip : "text-[12px] sm:text-[13px]"
      } ${
        active
          ? "border-marigold bg-marigold font-medium text-peacock-dark"
          : "border-ink/20 text-ink-soft hover:border-marigold-dark/60"
      }`}
    >
      {label}
    </button>
  );
}
