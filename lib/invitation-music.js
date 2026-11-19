import weddingConfig from "@/config/wedding.config";

let audio = null;
let failed = false;
let userPaused = false;
let siteMusicEnabled = false;
const listeners = new Set();

function getSrc() {
  return weddingConfig.music?.src || "";
}

function notify() {
  const state = getInvitationMusicState();
  listeners.forEach((listener) => listener(state));
}

export function getInvitationMusicState() {
  return {
    // UI treats music as on by default; only a manual pause shows the off icon.
    playing: !userPaused,
    ready: Boolean(audio && audio.readyState >= 2),
    failed: failed || !getSrc(),
  };
}

export function subscribeInvitationMusic(listener) {
  listeners.add(listener);
  listener(getInvitationMusicState());
  return () => listeners.delete(listener);
}

function ensureAudio() {
  const src = getSrc();
  if (!src) {
    failed = true;
    return null;
  }
  if (audio) return audio;

  audio = new Audio();
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = weddingConfig.music?.volume ?? 0.45;
  audio.src = src;

  audio.addEventListener("canplay", notify);
  audio.addEventListener("play", notify);
  audio.addEventListener("pause", notify);
  audio.addEventListener("error", () => {
    failed = true;
    notify();
  });

  return audio;
}

function resetPlaybackPosition(instance) {
  if (!instance) return;
  try {
    instance.pause();
    instance.currentTime = 0;
  } catch {
    /* ignore seek errors on some mobile browsers */
  }
}

/**
 * Wax-seal tap: keep dedicated music silent and rewound until the envelope
 * video has finished. Unlocks nothing audible.
 */
export function prepareInvitationMusicForOpening() {
  userPaused = false;
  failed = false;
  siteMusicEnabled = false;
  const instance = ensureAudio();
  resetPlaybackPosition(instance);
  if (instance) instance.muted = true;
  notify();
}

/**
 * Unlock the dedicated Audio element during the wax-seal user gesture (iOS).
 * Must stay muted and paused — envelope video-music is the only sound during the clip.
 */
export async function primeInvitationMusic() {
  const instance = ensureAudio();
  if (!instance || failed) return;
  try {
    instance.muted = true;
    resetPlaybackPosition(instance);
    await instance.play();
    instance.pause();
    resetPlaybackPosition(instance);
    instance.muted = true;
  } catch {
    /* audible play is attempted after the envelope video ends */
  }
  notify();
}

/**
 * Start dedicated site music from 0:00. Call only after the envelope video
 * (or reduced-motion fallback) has finished — never while the video plays.
 */
export async function startInvitationMusic() {
  if (userPaused) return false;

  siteMusicEnabled = true;
  const instance = ensureAudio();
  if (!instance || failed) return false;

  resetPlaybackPosition(instance);

  try {
    instance.muted = false;
    await instance.play();
    notify();
    return true;
  } catch {
    notify();
    return false;
  }
}

export function pauseInvitationMusic({ manual = false } = {}) {
  if (manual) userPaused = true;
  audio?.pause();
  notify();
}

export async function toggleInvitationMusic() {
  const instance = ensureAudio();
  if (!instance || failed) return getInvitationMusicState();

  if (!instance.paused && siteMusicEnabled && !instance.muted) {
    pauseInvitationMusic({ manual: true });
    return getInvitationMusicState();
  }

  if (!siteMusicEnabled) {
    return getInvitationMusicState();
  }

  userPaused = false;
  try {
    instance.muted = false;
    await instance.play();
  } catch {
    /* ignore */
  }
  notify();
  return getInvitationMusicState();
}

/** Pause when tab is hidden; resume when visible unless guest turned music off. */
export function handleInvitationMusicVisibility(hidden) {
  if (!audio || failed || !siteMusicEnabled) return;
  if (hidden) {
    if (!audio.paused) audio.pause();
    notify();
    return;
  }
  if (!userPaused) {
    audio.muted = false;
    audio.play().catch(() => {});
  }
}
