import { SECTION_IDS } from "@/lib/analytics/constants";

const RETENTION_DAYS = 90;
const MAX_SESSION_FILES = 250;

export function createEmptySummary() {
  const sections = {};
  for (const id of SECTION_IDS) {
    sections[id] = { views: 0, uniqueViewers: 0, timeMs: 0 };
  }

  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    screenshotCapability: "unavailable_web_no_reliable_os_screenshot_api",
    totals: {
      sessions: 0,
      uniqueVisitors: 0,
      returningSessions: 0,
      totalActiveMs: 0,
      rsvpSubmissions: 0,
      guestbookSubmissions: 0,
    },
    sections,
    events: {},
    devices: { mobile: 0, tablet: 0, desktop: 0, unknown: 0 },
    browsers: {},
    os: {},
    countries: { unavailable: 0 },
    cities: {},
    referrers: { direct: 0 },
    utmSources: {},
    daily: {},
    visitorIndex: {},
    sessionIndex: [],
    sessionState: {},
  };
}

function inc(map, key, amount = 1) {
  if (!key) return;
  map[key] = (map[key] || 0) + amount;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function pruneOldSessions(summary) {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  summary.sessionIndex = (summary.sessionIndex || []).filter(
    (item) => new Date(item.lastSeenAt).getTime() >= cutoff
  );
  if (summary.sessionIndex.length > MAX_SESSION_FILES) {
    summary.sessionIndex = summary.sessionIndex
      .sort((a, b) => new Date(b.lastSeenAt) - new Date(a.lastSeenAt))
      .slice(0, MAX_SESSION_FILES);
  }

  const keep = new Set(summary.sessionIndex.map((item) => item.id));
  const state = summary.sessionState || {};
  for (const id of Object.keys(state)) {
    if (!keep.has(id)) delete state[id];
  }
  summary.sessionState = state;
}

/** Merge one client batch into summary + session record. */
export function mergeAnalyticsBatch(summary, sessionRecord, batch, location) {
  const next = summary || createEmptySummary();
  const now = batch.lastSeenAt || new Date().toISOString();
  next.updatedAt = now;

  const visitorId = batch.visitorId;
  const sessionId = batch.sessionId;
  const visitor = next.visitorIndex[visitorId] || {
    firstSeenAt: now,
    lastSeenAt: now,
    visitCount: 0,
  };

  const isFirstVisitor = !next.visitorIndex[visitorId];
  const existingSession = (next.sessionIndex || []).find((item) => item.id === sessionId);
  const isNewForSummary = !existingSession;

  visitor.lastSeenAt = now;
  if (isNewForSummary) {
    visitor.visitCount = (visitor.visitCount || 0) + 1;
  }
  next.visitorIndex[visitorId] = visitor;

  if (isNewForSummary) {
    next.totals.sessions += 1;
    if (isFirstVisitor) {
      next.totals.uniqueVisitors += 1;
    } else {
      next.totals.returningSessions += 1;
    }
  }

  next.totals.totalActiveMs += batch.activeDurationMs || 0;

  const day = todayKey();
  if (!next.daily[day]) {
    next.daily[day] = { sessions: 0, uniqueVisitors: 0 };
  }
  if (isNewForSummary) {
    next.daily[day].sessions += 1;
    if (isFirstVisitor) next.daily[day].uniqueVisitors += 1;
  }

  const device = batch.device || {};
  const source = batch.source || {};

  if (isNewForSummary) {
    inc(next.devices, device.type || "unknown");
    inc(next.browsers, device.browser || "unknown");
    inc(next.os, device.os || "unknown");
    inc(next.referrers, source.referrerDomain || "direct");
    if (source.utmSource) inc(next.utmSources, source.utmSource);

    const locKey = location?.country || "unavailable";
    inc(next.countries, locKey);
    if (location?.city && location.city !== "unavailable") {
      const cityKey = `${location.city}, ${location.country || ""}`.trim();
      inc(next.cities, cityKey);
    }
  }

  const session =
    sessionRecord ||
    next.sessionState?.[sessionId] ||
    createSessionRecord(batch, location);

  session.lastSeenAt = now;
  session.activeDurationMs =
    (session.activeDurationMs || 0) + (batch.activeDurationMs || 0);
  session.lastSection = batch.lastSection || session.lastSection;

  for (const event of batch.events || []) {
    inc(next.events, event.type);

    if (event.type === "rsvp_submitted") next.totals.rsvpSubmissions += 1;
    if (event.type === "guestbook_submitted") {
      next.totals.guestbookSubmissions += 1;
    }

    if (event.type === "section_viewed" && event.section) {
      const sec = next.sections[event.section];
      if (sec) {
        sec.views += 1;
        if (!session.sectionsViewed?.[event.section]) {
          sec.uniqueViewers += 1;
        }
      }
      session.sectionsViewed = session.sectionsViewed || {};
      session.sectionsViewed[event.section] = true;
    }

    if (event.type === "section_time" && event.meta?.section) {
      const sec = next.sections[event.meta.section];
      if (sec) sec.timeMs += event.meta.durationMs || 0;
      session.sectionTime = session.sectionTime || {};
      session.sectionTime[event.meta.section] =
        (session.sectionTime[event.meta.section] || 0) +
        (event.meta.durationMs || 0);
    }
  }

  const existingIdx = next.sessionIndex.findIndex((s) => s.id === sessionId);
  const sessionSummary = {
    id: sessionId,
    visitorId,
    startedAt: session.startedAt,
    lastSeenAt: now,
    deviceType: device.type,
    country: location?.country || "unavailable",
    referrerDomain: source.referrerDomain || "direct",
    lastSection: session.lastSection,
  };
  if (existingIdx >= 0) next.sessionIndex[existingIdx] = sessionSummary;
  else next.sessionIndex.push(sessionSummary);

  next.sessionState = next.sessionState || {};
  next.sessionState[sessionId] = {
    sessionId: session.sessionId,
    visitorId: session.visitorId,
    startedAt: session.startedAt,
    lastSeenAt: session.lastSeenAt,
    activeDurationMs: session.activeDurationMs,
    sectionsViewed: session.sectionsViewed || {},
    sectionTime: session.sectionTime || {},
    lastSection: session.lastSection || "",
    device: session.device,
    source: session.source,
    location: session.location,
  };

  pruneOldSessions(next);

  return { summary: next, session };
}

export function createSessionRecord(batch, location) {
  return {
    sessionId: batch.sessionId,
    visitorId: batch.visitorId,
    startedAt: batch.startedAt || new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    activeDurationMs: 0,
    isNewSession: batch.isNewSession,
    device: batch.device,
    source: batch.source,
    location: location || {
      country: "unavailable",
      region: "unavailable",
      city: "unavailable",
      isp: "unavailable",
    },
    sectionsViewed: {},
    sectionTime: {},
    lastSection: "",
  };
}

export function buildAdminReport(summary) {
  const s = summary || createEmptySummary();
  const avgActiveMs =
    s.totals.sessions > 0
      ? Math.round(s.totals.totalActiveMs / s.totals.sessions)
      : 0;

  return {
    overview: {
      ...s.totals,
      avgActiveMs,
      screenshotCapability: s.screenshotCapability,
    },
    sections: s.sections,
    events: s.events,
    devices: s.devices,
    browsers: s.browsers,
    os: s.os,
    countries: s.countries,
    cities: s.cities,
    referrers: s.referrers,
    utmSources: s.utmSources,
    daily: s.daily,
    recentSessions: [...(s.sessionIndex || [])]
      .sort((a, b) => new Date(b.lastSeenAt) - new Date(a.lastSeenAt))
      .slice(0, 50),
    updatedAt: s.updatedAt,
  };
}
