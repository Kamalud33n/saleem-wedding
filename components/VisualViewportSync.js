"use client";

import { useEffect } from "react";
import { installVisualViewportSync } from "@/lib/visual-viewport";

/** Keeps visual-viewport pin active — iOS Chrome only (no-op elsewhere). */
export default function VisualViewportSync() {
  useEffect(() => installVisualViewportSync(), []);
  return null;
}
