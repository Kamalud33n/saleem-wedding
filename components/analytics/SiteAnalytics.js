"use client";

import { useEffect, useRef } from "react";
import { initAnalytics, setCurrentSection, trackSectionTime } from "@/lib/analytics/client";
import { isAnalyticsEnabled } from "@/lib/analytics/constants";

export default function SiteAnalytics() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAnalyticsEnabled() || initialized.current) return;
    initialized.current = true;
    initAnalytics();
  }, []);

  return null;
}

export function SectionTracker({ id, children, className = "", active = true }) {
  const ref = useRef(null);
  const enteredAt = useRef(0);
  const seen = useRef(false);

  useEffect(() => {
    if (!active || !isAnalyticsEnabled()) return undefined;

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          if (!seen.current) {
            seen.current = true;
            setCurrentSection(id);
          }
          enteredAt.current = Date.now();
        } else if (enteredAt.current > 0) {
          trackSectionTime(id, Date.now() - enteredAt.current);
          enteredAt.current = 0;
        }
      },
      { threshold: [0, 0.35, 0.6] }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [active, id]);

  return (
    <div ref={ref} data-section={id} className={className}>
      {children}
    </div>
  );
}
