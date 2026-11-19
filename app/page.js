"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Envelope from "@/components/Envelope";
import FloatingPetals from "@/components/FloatingPetals";
import Hero from "@/components/Hero";
import DiscoverDate from "@/components/DiscoverDate";
import Countdown from "@/components/Countdown";
import CinematicMoment from "@/components/CinematicMoment";
import OurStory from "@/components/OurStory";
import Ceremonies from "@/components/Ceremonies";
import RSVP from "@/components/RSVP";
import Guestbook from "@/components/Guestbook";
import Footer from "@/components/Footer";
import LanguageToggle from "@/components/LanguageToggle";
import MusicControl from "@/components/MusicControl";
import InviteErrorBoundary from "@/components/InviteErrorBoundary";
import SiteAnalytics, { SectionTracker } from "@/components/analytics/SiteAnalytics";
import { LocaleProvider } from "@/context/LocaleProvider";
import {
  installInvitationScrollGuards,
  resetInvitationScrollAfterPaint,
} from "@/lib/invitation-scroll";
import { isIOSChromeViewportMode } from "@/lib/ios-chrome-viewport";

function FloatingControls() {
  return (
    <div className="invite-floating-controls pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-[60]">
      <div className="pointer-events-auto inline-flex items-center gap-0.5 rounded-full border border-marigold-dark/30 bg-ivory/90 p-0.5 shadow-paper backdrop-blur-sm">
        <LanguageToggle />
        <MusicControl />
      </div>
    </div>
  );
}

export default function Home() {
  const [hasOpened, setHasOpened] = useState(false);
  const [stageSettled, setStageSettled] = useState(false);
  const [frameEl, setFrameEl] = useState(null);
  const [iosChrome, setIosChrome] = useState(false);

  const handleRevealStart = useCallback(() => {
    setHasOpened(true);
  }, []);

  const handleOpened = useCallback(() => {
    resetInvitationScrollAfterPaint();
  }, []);

  const handleStageComplete = useCallback(() => {
    resetInvitationScrollAfterPaint();
    setStageSettled(true);
  }, []);

  useEffect(() => {
    return installInvitationScrollGuards();
  }, []);

  useEffect(() => {
    setFrameEl(document.getElementById("app-visual-frame"));
    setIosChrome(isIOSChromeViewportMode());
  }, []);

  // Scroll locked through envelope + auto Hero reveal.
  useEffect(() => {
    const canScroll = hasOpened && stageSettled;

    if (iosChrome) {
      const region = document.getElementById("app-scroll-region");
      region?.classList.toggle("is-scrollable", canScroll);
    } else {
      document.body.style.overflow = canScroll ? "" : "hidden";
    }

    if (canScroll) {
      resetInvitationScrollAfterPaint();
    }

    return () => {
      document.getElementById("app-scroll-region")?.classList.remove("is-scrollable");
      document.getElementById("app-visual-frame")?.classList.remove("is-scrollable");
      document.body.style.overflow = "";
    };
  }, [hasOpened, stageSettled, iosChrome]);

  const floatingControls =
    hasOpened && iosChrome && frameEl
      ? createPortal(<FloatingControls />, frameEl)
      : hasOpened
        ? <FloatingControls />
        : null;

  return (
    <InviteErrorBoundary>
      <LocaleProvider>
        {hasOpened ? <SiteAnalytics /> : null}
        <Envelope onRevealStart={handleRevealStart} onOpened={handleOpened} />
        <FloatingPetals active={false} />

        <main
          aria-hidden={!hasOpened}
          className={`relative z-10 bg-ivory ${
            hasOpened ? "" : "pointer-events-none invisible"
          }`}
        >
          <div className="journey-canvas">
            <SectionTracker id="hero" className="contents" active={hasOpened}>
              <Hero hasOpened={hasOpened} onStageComplete={handleStageComplete} />
            </SectionTracker>
            {hasOpened ? (
              <>
                <SectionTracker id="discover-date" className="contents" active>
                  <DiscoverDate />
                </SectionTracker>
                <SectionTracker id="countdown" className="contents" active>
                  <Countdown />
                </SectionTracker>
              </>
            ) : null}
          </div>

          {hasOpened ? (
            <>
              <SectionTracker id="cinematic" active>
                <CinematicMoment />
              </SectionTracker>
              <SectionTracker id="story" active>
                <OurStory />
              </SectionTracker>
              <SectionTracker id="ceremonies" active>
                <Ceremonies />
              </SectionTracker>
              <SectionTracker id="rsvp" active>
                <RSVP />
              </SectionTracker>
              <SectionTracker id="guestbook" active>
                <Guestbook />
              </SectionTracker>
              <SectionTracker id="footer" active>
                <Footer />
              </SectionTracker>
            </>
          ) : null}
        </main>

        {floatingControls}
      </LocaleProvider>
    </InviteErrorBoundary>
  );
}
