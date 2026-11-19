"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Music2 } from "lucide-react";
import weddingConfig from "@/config/wedding.config";
import uiCopy from "@/config/ui.copy";
import { useLocale } from "@/context/LocaleProvider";
import { trackEvent } from "@/lib/analytics/client";
import {
  getInvitationMusicState,
  handleInvitationMusicVisibility,
  subscribeInvitationMusic,
  toggleInvitationMusic,
} from "@/lib/invitation-music";

function MusicOffIcon({ size = 16 }) {
  return (
    <span className="relative inline-flex h-4 w-4 items-center justify-center">
      <Music2 size={size} strokeWidth={1.75} />
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[1.5px] w-[130%] -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] rounded-full bg-current"
      />
    </span>
  );
}

export default function MusicControl() {
  const reduce = useReducedMotion();
  const { t } = useLocale();
  const [state, setState] = useState(getInvitationMusicState);
  const { playing, ready, failed } = state;

  useEffect(() => {
    let wasPlaying = getInvitationMusicState().playing;
    return subscribeInvitationMusic((next) => {
      setState(next);
      if (next.playing !== wasPlaying) {
        trackEvent(next.playing ? "music_started" : "music_paused");
        wasPlaying = next.playing;
      }
    });
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      handleInvitationMusicVisibility(document.hidden);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const toggle = useCallback(async () => {
    await toggleInvitationMusic();
  }, []);

  if (!weddingConfig.music?.src || failed) return null;

  const label = playing ? t(uiCopy.music.on) : t(uiCopy.music.off);

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={playing}
      disabled={!ready}
      initial={false}
      animate={
        playing && !reduce
          ? { scale: [1, 1.03, 1] }
          : { scale: 1 }
      }
      transition={
        playing && !reduce
          ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.2 }
      }
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-peacock transition-colors hover:text-peacock-light disabled:opacity-50"
    >
      {playing ? (
        <Music2 size={16} strokeWidth={1.75} />
      ) : (
        <MusicOffIcon />
      )}
    </motion.button>
  );
}
