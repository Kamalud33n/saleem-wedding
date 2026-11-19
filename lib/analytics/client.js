"use client";

import {
  SESSION_STORAGE_KEY,
  SESSION_TIMEOUT_MS,
  VISITOR_STORAGE_KEY,
  isAnalyticsEnabled,
} from "@/lib/analytics/constants";
import { getClientDeviceInfo } from "@/lib/analytics/device";

let queue = [];
let sessionMeta = null;
let currentSection = "";
let visibleSince = null;
let activeMs = 0;
let initialized = false;
let flushedForThisHide = false;

function safeGet(key, storage) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value, storage) {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getVisitorId() {
  const existing = safeGet(VISITOR_STORAGE_KEY, localStorage);
  if (existing) return existing;
  const id = createId();
  safeSet(VISITOR_STORAGE_KEY, id, localStorage);
  return id;
}

function getSessionId() {
  const now = Date.now();
  try {
    const raw = safeGet(SESSION_STORAGE_KEY, sessionStorage);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed?.sessionId &&
        parsed?.lastActive &&
        now - parsed.lastActive < SESSION_TIMEOUT_MS
      ) {
        parsed.lastActive = now;
        safeSet(SESSION_STORAGE_KEY, JSON.stringify(parsed), sessionStorage);
        return { sessionId: parsed.sessionId, isNew: false };
      }
    }
  } catch {
    /* malformed */
  }

  const sessionId = createId();
  safeSet(
    SESSION_STORAGE_KEY,
    JSON.stringify({ sessionId, lastActive: now, startedAt: now }),
    sessionStorage
  );
  return { sessionId, isNew: true };
}

function touchSession() {
  try {
    const raw = safeGet(SESSION_STORAGE_KEY, sessionStorage);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    parsed.lastActive = Date.now();
    safeSet(SESSION_STORAGE_KEY, JSON.stringify(parsed), sessionStorage);
  } catch {
    /* ignore */
  }
}

function parseUtm() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
  };
}

function parseSource() {
  if (typeof document === "undefined") {
    return { referrer: "", referrerDomain: "direct", landingPath: "/" };
  }
  const referrer = document.referrer || "";
  let referrerDomain = "direct";
  if (referrer) {
    try {
      referrerDomain = new URL(referrer).hostname || "unknown";
    } catch {
      referrerDomain = "unknown";
    }
  }
  return {
    referrer: referrer.slice(0, 200),
    referrerDomain,
    landingPath: window.location.pathname || "/",
    ...parseUtm(),
  };
}

function enqueue(event) {
  const meta = event.meta || {};
  queue.push({
    type: event.type,
    at: new Date().toISOString(),
    section: event.section ?? meta.section ?? currentSection ?? "",
    meta,
  });
  touchSession();
}

function buildPayload() {
  if (!sessionMeta) return null;

  let durationMs = activeMs;
  if (visibleSince) {
    durationMs += Date.now() - visibleSince;
  }

  const events = queue.splice(0, queue.length);
  if (events.length === 0 && durationMs <= 0) return null;

  activeMs = 0;
  if (visibleSince) {
    visibleSince = Date.now();
  }

  return {
    ...sessionMeta,
    activeDurationMs: Math.round(durationMs),
    lastSection: currentSection,
    events,
  };
}

async function flush(useBeacon = false) {
  if (!isAnalyticsEnabled()) return;
  const payload = buildPayload();
  if (!payload) return;

  if (sessionMeta) sessionMeta.isNewSession = false;

  const body = JSON.stringify(payload);

  if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics", blob);
    return;
  }

  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* non-blocking */
  }
}

function onLeaving() {
  if (flushedForThisHide) return;
  flushedForThisHide = true;
  if (visibleSince) {
    activeMs += Date.now() - visibleSince;
    visibleSince = null;
  }
  enqueue({ type: "session_leave" });
  flush(true);
}

function onVisibilityChange() {
  if (document.visibilityState === "hidden") {
    onLeaving();
    return;
  }
  flushedForThisHide = false;
  visibleSince = Date.now();
  enqueue({ type: "session_resume" });
}

export function initAnalytics() {
  if (!isAnalyticsEnabled() || initialized || typeof window === "undefined") return;
  initialized = true;

  try {
    const visitorId = getVisitorId();
    const { sessionId, isNew } = getSessionId();

    sessionMeta = {
      sessionId,
      visitorId,
      isNewSession: isNew,
      device: getClientDeviceInfo(),
      source: parseSource(),
      startedAt: new Date().toISOString(),
    };

    visibleSince = Date.now();

    enqueue({ type: isNew ? "visit_started" : "session_resumed" });

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onLeaving);
  } catch {
    /* analytics must never block the invitation */
  }
}

export function trackEvent(type, meta = {}) {
  try {
    if (!isAnalyticsEnabled()) return;
    if (!initialized) initAnalytics();
    enqueue({ type, meta });
  } catch {
    /* non-blocking */
  }
}

export function setCurrentSection(sectionId) {
  if (!isAnalyticsEnabled()) return;
  if (!sectionId || currentSection === sectionId) return;
  if (currentSection) {
    trackEvent("section_left", { section: currentSection });
  }
  currentSection = sectionId;
  trackEvent("section_viewed", { section: sectionId });
}

export function trackSectionTime(sectionId, durationMs) {
  if (!isAnalyticsEnabled()) return;
  if (!sectionId || durationMs < 500) return;
  trackEvent("section_time", {
    meta: {
      section: sectionId,
      durationMs: Math.round(durationMs),
    },
  });
}

export function getCurrentSection() {
  return currentSection;
}
