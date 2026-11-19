import weddingConfig from "@/config/wedding.config";

const SRC = weddingConfig.music?.videoSrc || "/wedding/video-music.mp3";
const VOLUME = weddingConfig.music?.videoVolume ?? 1;

let audio = null;
let syncCleanup = null;
let audioCtx = null;
let desiredPlaying = false;
let readyListenerBound = false;

function unlockAudioContext() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  } catch {
    /* ignore */
  }
}

function prepareAudioElement(el) {
  if (!el) return el;
  el.preload = "auto";
  el.loop = false;
  el.playsInline = true;
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "true");
  el.muted = false;
  el.defaultMuted = false;
  el.volume = VOLUME;
  if (!el.getAttribute("src")) {
    el.src = SRC;
  }
  return el;
}

function ensureAudio() {
  if (audio) return prepareAudioElement(audio);

  audio = new Audio();
  prepareAudioElement(audio);
  audio.src = SRC;
  return audio;
}

function bindReadyRetry(instance) {
  if (!instance || readyListenerBound) return;
  readyListenerBound = true;
  const retry = () => {
    if (desiredPlaying && instance.paused) {
      void tryPlay();
    }
  };
  instance.addEventListener("canplay", retry);
  instance.addEventListener("canplaythrough", retry);
}

function tryPlay() {
  if (!desiredPlaying) return Promise.resolve();
  const instance = ensureAudio();
  if (!instance) return Promise.resolve();
  prepareAudioElement(instance);
  bindReadyRetry(instance);
  if (!instance.paused && !instance.ended) return Promise.resolve();
  return instance.play().catch(() => {});
}

/** Prefer a DOM <audio> node — iOS is more reliable than `new Audio()`. */
export function bindEnvelopeVideoMusic(element) {
  if (!element) return;
  audio = prepareAudioElement(element);
  bindReadyRetry(element);
}

/** Buffer the cue so tap can start it with the video, not after a fetch. */
export function preloadEnvelopeVideoMusic() {
  if (desiredPlaying) return;
  const instance = ensureAudio();
  if (!instance || instance.readyState >= 2) return;
  try {
    instance.load();
  } catch {
    /* ignore */
  }
}

/**
 * Start in the same user-gesture tick as video.play().
 * Do not pause or seek first — iOS drops the gesture token.
 */
export function startEnvelopeVideoMusic() {
  desiredPlaying = true;
  unlockAudioContext();
  return tryPlay();
}

/** Safe to call again from click / video `playing` if the first play was ignored. */
export function resumeEnvelopeVideoMusic() {
  if (!desiredPlaying) return Promise.resolve();
  unlockAudioContext();
  return tryPlay();
}

export function stopEnvelopeVideoMusic() {
  desiredPlaying = false;
  if (syncCleanup) {
    syncCleanup();
    syncCleanup = null;
  }
  if (!audio) return;
  try {
    audio.pause();
  } catch {
    /* ignore */
  }
  try {
    if (audio.currentTime > 0.01) audio.currentTime = 0;
  } catch {
    /* ignore */
  }
}

/** Light sync on desktop; on iOS seeking HTMLAudio often stops playback. */
export function syncEnvelopeVideoMusic(video) {
  if (syncCleanup) {
    syncCleanup();
    syncCleanup = null;
  }
  if (!video || !audio) return;

  const isiOS =
    typeof navigator !== "undefined" &&
    /iP(hone|od|ad)|iOS/.test(navigator.userAgent);

  if (isiOS) return;

  const correctDrift = () => {
    if (!audio || audio.paused || video.paused || video.ended) return;
    const drift = audio.currentTime - video.currentTime;
    if (Math.abs(drift) > 0.12) {
      try {
        audio.currentTime = video.currentTime;
      } catch {
        /* ignore */
      }
    }
  };

  video.addEventListener("timeupdate", correctDrift);
  syncCleanup = () => {
    video.removeEventListener("timeupdate", correctDrift);
  };
}
