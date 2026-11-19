"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

const SESSION_KEY = "guestbook-admin-password";

export default function ManageGuestbookPage() {
  const [password, setPassword] = useState("");
  const [sessionPassword, setSessionPassword] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) setSessionPassword(stored);
    } catch {
      /* private mode */
    }
    setReady(true);
  }, []);

  const callManage = useCallback(async (body) => {
    const response = await fetch("/api/guestbook/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  }, []);

  const loadEntries = useCallback(
    async (pwd) => {
      setLoading(true);
      setError("");
      const { response, data } = await callManage({
        password: pwd,
        action: "list",
      });
      setLoading(false);

      if (!response.ok) {
        if (response.status === 401) {
          setError("Wrong password. Please try again.");
          setSessionPassword("");
          try {
            sessionStorage.removeItem(SESSION_KEY);
          } catch {
            /* ignore */
          }
          return false;
        }
        setError("Could not load memories. Please try again.");
        return false;
      }

      setEntries(data.entries || []);
      return true;
    },
    [callManage]
  );

  useEffect(() => {
    if (!ready || !sessionPassword) return;
    loadEntries(sessionPassword);
  }, [ready, sessionPassword, loadEntries]);

  async function handleLogin(e) {
    e.preventDefault();
    const pwd = password.trim();
    if (!pwd) return;

    setLoading(true);
    const ok = await loadEntries(pwd);
    setLoading(false);
    if (!ok) return;

    setSessionPassword(pwd);
    setPassword("");
    try {
      sessionStorage.setItem(SESSION_KEY, pwd);
    } catch {
      /* ignore */
    }
  }

  async function handleDelete(id) {
    if (!sessionPassword || deletingId) return;
    const confirmed = window.confirm("Delete this memory?");
    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    const { response } = await callManage({
      password: sessionPassword,
      action: "delete",
      id,
    });

    setDeletingId("");

    if (!response.ok) {
      setError("Could not delete. Please try again.");
      return;
    }

    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  function handleLogout() {
    setSessionPassword("");
    setEntries([]);
    setPassword("");
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }

  if (!ready) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-parchment px-5">
        <Loader2 className="animate-spin text-peacock" size={22} />
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-parchment px-4 py-8 text-ink sm:px-6">
      <div className="mx-auto max-w-md">
        <header className="mb-6 text-center">
          <p className="font-label text-[10px] uppercase tracking-[0.28em] text-vermilion">
            Private
          </p>
          <h1 className="mt-2 font-display text-2xl italic text-peacock">
            Memory book
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            View or remove guest wishes and advice from your phone.
          </p>
        </header>

        {!sessionPassword ? (
          <form
            onSubmit={handleLogin}
            className="invite-surface space-y-4 border border-marigold-dark/20 p-5"
          >
            <label className="block">
              <span className="mb-2 block text-sm text-ink-soft">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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
              className="flex min-h-12 w-full items-center justify-center gap-2 bg-peacock text-parchment disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Open memory book
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-ink-soft">
                {entries.length} memor{entries.length === 1 ? "y" : "ies"}
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-peacock underline-offset-2 hover:underline"
              >
                Lock
              </button>
            </div>

            {error ? (
              <p className="text-sm text-vermilion" role="alert">
                {error}
              </p>
            ) : null}

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-peacock" size={22} />
              </div>
            ) : entries.length === 0 ? (
              <p className="rounded-sm border border-ink/10 bg-[#fffdf8] p-5 text-center text-sm text-ink-soft">
                No memories yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="border border-ink/10 bg-[#fffdf8] p-4 shadow-[0_10px_24px_-18px_rgba(36,27,18,0.35)]"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-lg italic text-peacock">
                          {entry.name}
                        </p>
                        <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-vermilion">
                          {entry.type}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        disabled={deletingId === entry.id}
                        aria-label={`Delete memory from ${entry.name}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-vermilion/25 text-vermilion transition-colors hover:bg-vermilion/5 disabled:opacity-50"
                      >
                        {deletingId === entry.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                    <p className="break-words text-sm leading-relaxed text-ink-soft">
                      {entry.message}
                    </p>
                    <p className="mt-2 text-[11px] text-ink-soft/70">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
