"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { SECTION_IDS, isAnalyticsEnabled } from "@/lib/analytics/constants";

function formatDuration(ms) {
  if (!ms || ms < 1000) return "< 1s";
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem ? `${min}m ${rem}s` : `${min}m`;
}

function topEntries(map, limit = 8) {
  return Object.entries(map || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function StatCard({ label, value, hint }) {
  return (
    <div className="border border-ink/10 bg-[#fffdf8] p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-2xl italic text-peacock">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-soft/80">{hint}</p> : null}
    </div>
  );
}

function BarList({ title, items, emptyLabel = "No data yet" }) {
  const max = items.length ? items[0][1] : 0;
  return (
    <div className="border border-ink/10 bg-[#fffdf8] p-4">
      <h3 className="font-display text-lg italic text-peacock">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map(([key, count]) => (
            <li key={key}>
              <div className="mb-1 flex justify-between gap-2 text-sm">
                <span className="truncate text-ink">{key}</span>
                <span className="shrink-0 text-ink-soft">{count}</span>
              </div>
              <div className="h-1.5 bg-ink/5">
                <div
                  className="h-full bg-peacock/70"
                  style={{ width: max ? `${(count / max) * 100}%` : "0%" }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ManageAnalyticsPanel({ password }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("all");

  const loadReport = useCallback(async () => {
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analytics/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          response.status === 401
            ? "Session expired. Please lock and sign in again."
            : "Could not load analytics."
        );
        setReport(null);
        return;
      }
      setReport(data.report);
    } catch {
      setError("Could not load analytics.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const filteredDaily = useMemo(() => {
    const daily = report?.daily || {};
    const keys = Object.keys(daily).sort();
    if (range === "7d") return keys.slice(-7);
    if (range === "30d") return keys.slice(-30);
    return keys;
  }, [report, range]);

  const overview = report?.overview;
  const sections = report?.sections || {};
  const totalSectionViews = Object.values(sections).reduce(
    (sum, s) => sum + (s.views || 0),
    0
  );

  const sectionRows = SECTION_IDS.map((id) => {
    const s = sections[id] || { views: 0, uniqueViewers: 0, timeMs: 0 };
    const viewRate =
      overview?.sessions > 0
        ? Math.round((s.uniqueViewers / overview.sessions) * 100)
        : 0;
    return { id, ...s, viewRate };
  }).sort((a, b) => b.views - a.views);

  if (loading && !report) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-peacock" size={22} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          Anonymous browser/device analytics. Not exact unique humans.
        </p>
        <button
          type="button"
          onClick={loadReport}
          disabled={loading}
          className="flex min-h-10 items-center gap-2 border border-ink/20 bg-[#fffdf8] px-3 text-sm text-peacock"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error ? (
        <p className="text-sm text-vermilion" role="alert">
          {error}
        </p>
      ) : null}

      {!isAnalyticsEnabled() ? (
        <p className="border border-ink/10 bg-[#fffdf8] p-4 text-sm text-ink-soft">
          Tracking is off in <code className="text-ink">wedding.config.js</code>{" "}
          (<code className="text-ink">analytics.enabled</code>). Guest memories are
          unaffected. Numbers below are what was stored before tracking paused.
        </p>
      ) : null}

      {overview ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total sessions" value={overview.sessions} />
            <StatCard
              label="Approx. visitors"
              value={overview.uniqueVisitors}
              hint="Anonymous browser IDs"
            />
            <StatCard label="Returning sessions" value={overview.returningSessions} />
            <StatCard
              label="Avg active time"
              value={formatDuration(overview.avgActiveMs)}
              hint="Visible tab time only"
            />
            <StatCard label="RSVP submissions" value={overview.rsvpSubmissions} />
            <StatCard
              label="Guestbook entries"
              value={overview.guestbookSubmissions}
            />
          </div>

          <div className="border border-amber-200/60 bg-amber-50/50 p-4 text-sm text-ink-soft">
            <strong className="text-ink">Screenshot detection:</strong>{" "}
            {overview.screenshotCapability ===
            "unavailable_web_no_reliable_os_screenshot_api"
              ? "Not reliably available in browsers. No confirmed screenshot events are recorded."
              : overview.screenshotCapability}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All time"],
              ["30d", "Last 30 days"],
              ["7d", "Last 7 days"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setRange(id)}
                className={`min-h-9 px-3 text-xs uppercase tracking-wider ${
                  range === id
                    ? "bg-peacock text-parchment"
                    : "border border-ink/20 bg-[#fffdf8]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <BarList
              title="Visits by day"
              items={filteredDaily.map((day) => [
                day,
                report.daily[day].sessions,
              ])}
            />
            <BarList
              title="Referrers"
              items={topEntries(report.referrers)}
            />
            <BarList title="UTM sources" items={topEntries(report.utmSources)} />
            <BarList title="Countries" items={topEntries(report.countries)} />
            <BarList title="Cities" items={topEntries(report.cities, 6)} />
            <BarList title="Browsers" items={topEntries(report.browsers)} />
            <BarList title="Operating systems" items={topEntries(report.os)} />
            <BarList
              title="Devices"
              items={topEntries(report.devices)}
            />
          </div>

          <div className="border border-ink/10 bg-[#fffdf8] p-4">
            <h3 className="font-display text-lg italic text-peacock">
              Section engagement
            </h3>
            <p className="mt-1 text-xs text-ink-soft">
              {totalSectionViews} total section views across all sessions
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-[11px] uppercase tracking-wider text-ink-soft">
                    <th className="py-2 pr-3">Section</th>
                    <th className="py-2 pr-3">Views</th>
                    <th className="py-2 pr-3">Unique viewers</th>
                    <th className="py-2 pr-3">Reach</th>
                    <th className="py-2">Time spent</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionRows.map((row) => (
                    <tr key={row.id} className="border-b border-ink/5">
                      <td className="py-2 pr-3 font-medium text-ink">{row.id}</td>
                      <td className="py-2 pr-3">{row.views}</td>
                      <td className="py-2 pr-3">{row.uniqueViewers}</td>
                      <td className="py-2 pr-3">{row.viewRate}%</td>
                      <td className="py-2">{formatDuration(row.timeMs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <BarList title="Events" items={topEntries(report.events, 20)} />

          <div className="border border-ink/10 bg-[#fffdf8] p-4">
            <h3 className="font-display text-lg italic text-peacock">
              Recent sessions
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-[11px] uppercase tracking-wider text-ink-soft">
                    <th className="py-2 pr-3">Last seen</th>
                    <th className="py-2 pr-3">Device</th>
                    <th className="py-2 pr-3">Country</th>
                    <th className="py-2 pr-3">Referrer</th>
                    <th className="py-2">Last section</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.recentSessions || []).map((s) => (
                    <tr key={s.id} className="border-b border-ink/5">
                      <td className="py-2 pr-3 text-ink-soft">
                        {new Date(s.lastSeenAt).toLocaleString()}
                      </td>
                      <td className="py-2 pr-3">{s.deviceType || "—"}</td>
                      <td className="py-2 pr-3">{s.country || "—"}</td>
                      <td className="py-2 pr-3 truncate max-w-[8rem]">
                        {s.referrerDomain || "direct"}
                      </td>
                      <td className="py-2">{s.lastSection || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {report.updatedAt ? (
            <p className="text-center text-xs text-ink-soft/70">
              Last updated {new Date(report.updatedAt).toLocaleString()}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
