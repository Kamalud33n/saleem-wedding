"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import uiCopy from "@/config/ui.copy";
import { useLocale } from "@/context/LocaleProvider";
import { trackEvent } from "@/lib/analytics/client";
import {
  pauseInvitationMusic,
  prepareInvitationMusicForOpening,
  primeInvitationMusic,
  startInvitationMusic,
} from "@/lib/invitation-music";
import {
  bindEnvelopeVideoMusic,
  preloadEnvelopeVideoMusic,
  resumeEnvelopeVideoMusic,
  startEnvelopeVideoMusic,
  stopEnvelopeVideoMusic,
  syncEnvelopeVideoMusic,
} from "@/lib/envelope-video-music";
import weddingConfig from "@/config/wedding.config";
import { resetInvitationScrollAfterPaint } from "@/lib/invitation-scroll";

const REVEAL_THRESHOLD_SECONDS = 0.7;
const NORMAL_FADE_MS = 760;
const REDUCED_FADE_MS = 260;
const CROSSFADE_MS = 180;
const MOBILE_VIDEO_SRC = "/gallery/premium-wedding-envelope-reveal.mp4";
const MOBILE_THUMBNAIL_SRC = "/gallery/thumbnail.png";
const DESKTOP_VIDEO_SRC = "/gallery/premium-wedding-envelope-reveal-desktop.mp4";
const DESKTOP_THUMBNAIL_SRC = "/gallery/thumbnail-desktop.png";
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
const PLAY_TIMEOUT_MS = 2500;

function prepareVideoForInline(video) {
  if (!video) return;
  video.playsInline = true;
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "true");
  video.setAttribute("x-webkit-airplay", "deny");
}

function muteEnvelopeVideo(video) {
  if (!video) return;
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.setAttribute("muted", "");
}

/**
 * Envelope → video → main invitation.
 *
 * Flicker rules:
 * - Thumbnail stays until playback starts (same art as video poster).
 * - Video stays mounted; never remount mid-tap.
 * - Cream bridge only covers the *first paint* before the thumbnail loads —
 *   it must never return during reveal.
 * - Media layer stays fully opaque through the whole clip; only the outer
 *   cover fades out once, after onRevealStart mounts the main site underneath.
 */
export default function Envelope({ onRevealStart, onOpened }) {
  const { t } = useLocale();
  const videoRef = useRef(null);
  const videoMusicRef = useRef(null);
  const revealTimerRef = useRef(null);
  const revealStartedRef = useRef(false);
  const startedRef = useRef(false);
  const hasPrimedFirstFrameRef = useRef(false);

  const setVideoMusicNode = useCallback((node) => {
    videoMusicRef.current = node;
    if (node) bindEnvelopeVideoMusic(node);
  }, []);

  const [showIntro, setShowIntro] = useState(true);
  const [thumbReady, setThumbReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [useDesktopAssets, setUseDesktopAssets] = useState(false);
  const [assetsResolved, setAssetsResolved] = useState(false);

  const videoSrc = useDesktopAssets ? DESKTOP_VIDEO_SRC : MOBILE_VIDEO_SRC;
  const thumbnailSrc = useDesktopAssets
    ? DESKTOP_THUMBNAIL_SRC
    : MOBILE_THUMBNAIL_SRC;

  const handleFrameReady = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    prepareVideoForInline(video);
    muteEnvelopeVideo(video);

    if (hasPrimedFirstFrameRef.current) return;
    hasPrimedFirstFrameRef.current = true;

    try {
      if (video.readyState >= 1 && video.currentTime > 0.05) {
        video.currentTime = 0;
      }
    } catch {
      /* Ignore InvalidStateError on early Safari seeks. */
    }
  }, []);

  const completeReveal = useCallback(() => {
    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }

    stopEnvelopeVideoMusic();

    const video = videoRef.current;
    if (video) {
      try {
        video.pause();
      } catch {
        /* ignore */
      }
      video.muted = true;
      video.volume = 0;
    }

    resetInvitationScrollAfterPaint();
    setShowIntro(false);
    trackEvent("envelope_opened");
    onOpened?.();
    prepareInvitationMusicForOpening();
    startInvitationMusic();
  }, [onOpened]);

  const beginReveal = useCallback(() => {
    if (revealStartedRef.current) return;
    revealStartedRef.current = true;
    setIsRevealing(true);

    // Mount main invitation while cover is still fully opaque, then fade once.
    onRevealStart?.();
    pauseInvitationMusic();

    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
    }

    const bridgeMs = prefersReducedMotion ? 40 : 120;
    const fadeMs = prefersReducedMotion ? REDUCED_FADE_MS : NORMAL_FADE_MS;

    revealTimerRef.current = window.setTimeout(() => {
      setIsFadingOut(true);
      revealTimerRef.current = window.setTimeout(completeReveal, fadeMs);
    }, bridgeMs);
  }, [completeReveal, onRevealStart, prefersReducedMotion]);

  const handleOpen = useCallback(async () => {
    if (revealStartedRef.current) return;

    if (startedRef.current) {
      // Second gesture (click after pointerdown) — resume if needed.
      void resumeEnvelopeVideoMusic();
      const video = videoRef.current;
      if (video && video.paused && !video.ended) {
        try {
          await video.play();
        } catch {
          /* ignore */
        }
      }
      return;
    }

    startedRef.current = true;
    setHasStarted(true);

    if (prefersReducedMotion || hasError) {
      prepareInvitationMusicForOpening();
      primeInvitationMusic();
      beginReveal();
      return;
    }

    const video = videoRef.current;
    if (!video) {
      prepareInvitationMusicForOpening();
      primeInvitationMusic();
      beginReveal();
      return;
    }

    prepareVideoForInline(video);
    muteEnvelopeVideo(video);

    try {
      // Video-music must be the first audible play() in this gesture (iOS).
      const musicPlay = startEnvelopeVideoMusic();
      const videoPlay = video.play();
      syncEnvelopeVideoMusic(video);
      void Promise.resolve(musicPlay).catch(() => {});
      void resumeEnvelopeVideoMusic();

      await Promise.race([
        Promise.resolve(videoPlay),
        new Promise((_, reject) => {
          window.setTimeout(() => reject(new Error("Video play timed out")), PLAY_TIMEOUT_MS);
        }),
      ]);

      setIsPlaying(true);
      void resumeEnvelopeVideoMusic();
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Envelope reveal video play failed:", error);
      }
      stopEnvelopeVideoMusic();
      prepareInvitationMusicForOpening();
      primeInvitationMusic();
      beginReveal();
    }
  }, [beginReveal, hasError, prefersReducedMotion]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(query.matches);
    updatePreference();
    if (query.addEventListener) {
      query.addEventListener("change", updatePreference);
    } else {
      query.addListener(updatePreference);
    }
    return () => {
      if (query.removeEventListener) {
        query.removeEventListener("change", updatePreference);
      } else {
        query.removeListener(updatePreference);
      }
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const syncAssets = () => {
      if (startedRef.current) return;
      const next = query.matches;
      setUseDesktopAssets((prev) => {
        if (prev === next) return prev;
        hasPrimedFirstFrameRef.current = false;
        setThumbReady(false);
        return next;
      });
    };
    syncAssets();
    setAssetsResolved(true);
    if (query.addEventListener) {
      query.addEventListener("change", syncAssets);
    } else {
      query.addListener(syncAssets);
    }
    return () => {
      if (query.removeEventListener) {
        query.removeEventListener("change", syncAssets);
      } else {
        query.removeListener(syncAssets);
      }
    };
  }, []);

  useEffect(() => {
    if (!showIntro) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [showIntro]);

  useEffect(() => {
    if (!showIntro || prefersReducedMotion || hasError || !assetsResolved) {
      return undefined;
    }
    const video = videoRef.current;
    if (!video) return undefined;

    prepareVideoForInline(video);
    muteEnvelopeVideo(video);
    if (!startedRef.current) {
      preloadEnvelopeVideoMusic();
      // Warm the buffer before the tap — never reload after playback has started.
      try {
        video.load();
      } catch {
        /* ignore */
      }
    }

    const handleVideoError = () => {
      if (process.env.NODE_ENV !== "production") {
        console.error("Envelope reveal video failed to load.");
      }
      setHasError(true);
    };

    const handlePlaying = () => {
      setIsPlaying(true);
      void resumeEnvelopeVideoMusic();
    };

    const handleTimeUpdate = () => {
      if (revealStartedRef.current) return;
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      // Don't bail on paused/ended here — near EOF some browsers pause before `ended`.
      const remaining = video.duration - video.currentTime;
      if (remaining <= REVEAL_THRESHOLD_SECONDS) {
        beginReveal();
      }
    };

    const handleEnded = () => {
      stopEnvelopeVideoMusic();
      beginReveal();
    };

    video.addEventListener("loadedmetadata", handleFrameReady);
    video.addEventListener("loadeddata", handleFrameReady);
    video.addEventListener("canplay", handleFrameReady);
    video.addEventListener("error", handleVideoError);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    if (video.readyState >= 2) {
      handleFrameReady();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleFrameReady);
      video.removeEventListener("loadeddata", handleFrameReady);
      video.removeEventListener("canplay", handleFrameReady);
      video.removeEventListener("error", handleVideoError);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [
    assetsResolved,
    beginReveal,
    handleFrameReady,
    hasError,
    prefersReducedMotion,
    showIntro,
    videoSrc,
  ]);

  useEffect(() => {
    bindEnvelopeVideoMusic(videoMusicRef.current);
    if (!startedRef.current) {
      preloadEnvelopeVideoMusic();
    }
  }, []);

  // Cached images on iOS sometimes skip onLoad.
  useEffect(() => {
    if (thumbReady || !showIntro) return undefined;
    const id = window.setTimeout(() => setThumbReady(true), 900);
    return () => window.clearTimeout(id);
  }, [thumbReady, showIntro, thumbnailSrc]);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current);
      }
      stopEnvelopeVideoMusic();
    };
  }, []);

  if (!showIntro) return null;

  const isInteractive = !hasStarted && !isRevealing;
  const surfaceReady = prefersReducedMotion || hasError || thumbReady;
  const canOpen = isInteractive && surfaceReady;
  // Cream only for first paint — never return it during playback/reveal.
  const showCreamBridge = (!assetsResolved || !thumbReady) && !hasError && !prefersReducedMotion;
  const showVideo = assetsResolved && hasStarted && !prefersReducedMotion && !hasError;
  // Keep thumbnail until frames are actually painting (poster matches thumbnail).
  const showThumbnail = assetsResolved && !isPlaying && !isRevealing;

  const fadeMs = prefersReducedMotion ? REDUCED_FADE_MS : NORMAL_FADE_MS;

  return (
    <div
      className="invite-cover"
      style={{
        opacity: isFadingOut ? 0 : 1,
        transition: `opacity ${fadeMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        pointerEvents: isRevealing || isFadingOut ? "none" : "auto",
      }}
      aria-hidden={false}
    >
      <div className="invite-cover-layer">
        {assetsResolved ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailSrc}
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              decoding="async"
              draggable={false}
              className="invite-cover-media"
              style={{
                opacity: showThumbnail ? 1 : 0,
                transition: `opacity ${CROSSFADE_MS}ms linear`,
                pointerEvents: "none",
                zIndex: 2,
              }}
              onLoad={(event) => {
                if (event.currentTarget.naturalWidth > 0) setThumbReady(true);
              }}
              onError={() => setThumbReady(true)}
              ref={(node) => {
                if (node && node.complete && node.naturalWidth > 0) {
                  setThumbReady(true);
                }
              }}
            />

            {!prefersReducedMotion && !hasError && (
              <video
                ref={videoRef}
                src={videoSrc}
                playsInline
                preload="auto"
                muted
                controls={false}
                autoPlay={false}
                loop={false}
                disablePictureInPicture
                poster={thumbnailSrc}
                className="invite-cover-media"
                style={{
                  opacity: showVideo ? 1 : 0,
                  transition: `opacity ${CROSSFADE_MS}ms linear`,
                  zIndex: 1,
                }}
                onLoadedMetadata={handleFrameReady}
                onLoadedData={handleFrameReady}
                onCanPlay={handleFrameReady}
              />
            )}
          </>
        ) : null}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[3] bg-[#CEBF9D]"
        style={{
          opacity: showCreamBridge ? 1 : 0,
          transition: "opacity 200ms ease-out",
        }}
      />

      <audio
        ref={setVideoMusicNode}
        src={weddingConfig.music?.videoSrc || "/wedding/video-music.mp3"}
        preload="auto"
        playsInline
        loop={false}
        className="sr-only"
        aria-hidden="true"
      />

      <button
        type="button"
        onPointerDown={(event) => {
          if (event.button && event.button !== 0) return;
          handleOpen();
        }}
        onClick={handleOpen}
        disabled={!canOpen}
        aria-label={t(uiCopy.envelope.ariaTap)}
        className="absolute inset-0 z-30 border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-marigold-dark"
        style={{
          cursor: canOpen ? "pointer" : "default",
          WebkitTapHighlightColor: "transparent",
          pointerEvents: canOpen ? "auto" : "none",
          touchAction: "manipulation",
        }}
      />
    </div>
  );
}
