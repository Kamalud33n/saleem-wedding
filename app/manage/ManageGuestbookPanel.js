"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

export default function ManageGuestbookPanel({ password }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

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
          setError("Session expired. Please lock and sign in again.");
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
    if (!password) return;
    loadEntries(password);
  }, [password, loadEntries]);

  async function handleDelete(id) {
    if (!password || deletingId) return;
    const confirmed = window.confirm("Delete this memory?");
    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    const { response } = await callManage({
      password,
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

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">
        View or remove guest wishes and advice.
      </p>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          {entries.length} memor{entries.length === 1 ? "y" : "ies"}
        </p>
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
  );
}
