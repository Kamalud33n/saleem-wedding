"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ManageGuestbookPanel from "@/app/manage/ManageGuestbookPanel";
import ManageAnalyticsPanel from "@/app/manage/ManageAnalyticsPanel";

const SESSION_KEY = "guestbook-admin-password";

export default function ManageDashboard() {
  const [password, setPassword] = useState("");
  const [sessionPassword, setSessionPassword] = useState("");
  const [tab, setTab] = useState("memories");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) setSessionPassword(stored);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const verifyLogin = useCallback(async (pwd) => {
    setLoading(true);
    setError("");
    const response = await fetch("/api/guestbook/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwd, action: "list" }),
    });
    setLoading(false);
    if (!response.ok) {
      setError("Wrong password. Please try again.");
      return false;
    }
    return true;
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    const pwd = password.trim();
    if (!pwd) return;
    const ok = await verifyLogin(pwd);
    if (!ok) return;
    setSessionPassword(pwd);
    setPassword("");
    try {
      sessionStorage.setItem(SESSION_KEY, pwd);
    } catch {
      /* ignore */
    }
  }

  function handleLogout() {
    setSessionPassword("");
    setPassword("");
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }

  if (!ready) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-parchment">
        <Loader2 className="animate-spin text-peacock" size={22} />
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-parchment px-4 py-8 text-ink sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 text-center">
          <p className="font-label text-[10px] uppercase tracking-[0.28em] text-vermilion">
            Private
          </p>
          <h1 className="mt-2 font-display text-2xl italic text-peacock">
            Wedding manage
          </h1>
        </header>

        {!sessionPassword ? (
          <form
            onSubmit={handleLogin}
            className="invite-surface mx-auto max-w-md space-y-4 border border-marigold-dark/20 p-5"
          >
            <label className="block">
              <span className="mb-2 block text-sm text-ink-soft">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-ink/20 bg-transparent px-3 py-3 text-[16px] outline-none focus:border-marigold-dark"
                placeholder="Enter admin password"
              />
            </label>
            {error ? (
              <p className="text-sm text-vermilion" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="flex min-h-12 w-full items-center justify-center bg-peacock text-parchment disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign in"}
            </button>
          </form>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTab("memories")}
                  className={`min-h-10 px-4 text-sm ${
                    tab === "memories"
                      ? "bg-peacock text-parchment"
                      : "border border-ink/20 bg-[#fffdf8]"
                  }`}
                >
                  Memories
                </button>
                <button
                  type="button"
                  onClick={() => setTab("analytics")}
                  className={`min-h-10 px-4 text-sm ${
                    tab === "analytics"
                      ? "bg-peacock text-parchment"
                      : "border border-ink/20 bg-[#fffdf8]"
                  }`}
                >
                  Analytics
                </button>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-peacock underline-offset-2 hover:underline"
              >
                Lock
              </button>
            </div>

            {tab === "memories" ? (
              <ManageGuestbookPanel password={sessionPassword} />
            ) : (
              <ManageAnalyticsPanel password={sessionPassword} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
