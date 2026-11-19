import {
  IOS_CHROME_VIEWPORT_CLASS,
  isIOSChromeViewportMode,
} from "@/lib/ios-chrome-viewport";

const FRAME_ID = "app-visual-frame";
const SCROLL_REGION_ID = "app-scroll-region";

/**
 * iOS Chrome: size from visualViewport only — never innerHeight (layout viewport).
 */
function readFrame() {
  const visual = window.visualViewport;
  if (!visual) {
    return { top: 0, left: 0, width: 1, height: 1 };
  }

  return {
    top: Math.round(visual.offsetTop || 0),
    left: Math.round(visual.offsetLeft || 0),
    width: Math.max(1, Math.round(visual.width || 0)),
    height: Math.max(1, Math.round(visual.height || 0)),
  };
}

function pinFrameElement(frame) {
  const el =
    document.getElementById(FRAME_ID) ||
    document.querySelector(`.${FRAME_ID}`);
  if (!el) return;
  el.style.top = `${frame.top}px`;
  el.style.left = `${frame.left}px`;
  el.style.width = `${frame.width}px`;
  el.style.height = `${frame.height}px`;
}

export function applyVisualViewportVars() {
  if (typeof window === "undefined") return;
  if (!isIOSChromeViewportMode()) return;

  try {
    const frame = readFrame();
    const root = document.documentElement.style;
    root.setProperty("--vv-top", `${frame.top}px`);
    root.setProperty("--vv-left", `${frame.left}px`);
    root.setProperty("--vv-width", `${frame.width}px`);
    root.setProperty("--vv-height", `${frame.height}px`);

    if (frame.top > 16) {
      root.setProperty("--safe-top", "0px");
    } else {
      root.removeProperty("--safe-top");
    }

    pinFrameElement(frame);
  } catch {
    /* ignore */
  }
}

export function installVisualViewportSync() {
  if (typeof window === "undefined") return () => {};
  if (!document.documentElement.classList.contains(IOS_CHROME_VIEWPORT_CLASS)) {
    return () => {};
  }

  const sync = () => applyVisualViewportVars();
  const onResume = () => {
    sync();
    window.requestAnimationFrame(sync);
  };

  onResume();

  let ticks = 0;
  const poll = window.setInterval(() => {
    sync();
    ticks += 1;
    if (ticks >= 60) window.clearInterval(poll);
  }, 50);

  const onVisibility = () => {
    if (!document.hidden) onResume();
  };

  const onTouch = () => onResume();

  window.addEventListener("resize", onResume);
  window.addEventListener("orientationchange", onResume);
  window.addEventListener("pageshow", onResume);
  window.addEventListener("focus", onResume);
  document.addEventListener("visibilitychange", onVisibility);
  document.addEventListener("touchstart", onTouch, { passive: true });
  window.visualViewport?.addEventListener("resize", onResume);
  window.visualViewport?.addEventListener("scroll", onResume);

  return () => {
    window.removeEventListener("resize", onResume);
    window.removeEventListener("orientationchange", onResume);
    window.removeEventListener("pageshow", onResume);
    window.removeEventListener("focus", onResume);
    document.removeEventListener("visibilitychange", onVisibility);
    document.removeEventListener("touchstart", onTouch);
    window.visualViewport?.removeEventListener("resize", onResume);
    window.visualViewport?.removeEventListener("scroll", onResume);
    window.clearInterval(poll);
  };
}

/** Scroll root for Framer — iOS Chrome scroll region only; otherwise window. */
export function getInvitationScroller() {
  if (!isIOSChromeViewportMode()) return null;
  return (
    document.getElementById(SCROLL_REGION_ID) ||
    document.getElementById(FRAME_ID) ||
    document.querySelector(`.${FRAME_ID}`)
  );
}

/** Inline boot script — runs in <head> before first paint. */
export const IOS_CHROME_BOOT_SCRIPT = `(function(){try{if('scrollRestoration'in history)history.scrollRestoration='manual';window.scrollTo(0,0);}catch(e){}try{var ua=navigator.userAgent;var ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);if(!ios||!(/CriOS|EdgiOS/i.test(ua)))return;document.documentElement.classList.add('${IOS_CHROME_VIEWPORT_CLASS}');function sync(){var vv=window.visualViewport;if(!vv)return;var t=Math.round(vv.offsetTop||0),l=Math.round(vv.offsetLeft||0),w=Math.max(1,Math.round(vv.width||0)),h=Math.max(1,Math.round(vv.height||0)),r=document.documentElement.style;r.setProperty('--vv-top',t+'px');r.setProperty('--vv-left',l+'px');r.setProperty('--vv-width',w+'px');r.setProperty('--vv-height',h+'px');if(t>16)r.setProperty('--safe-top','0px');else r.removeProperty('--safe-top');var el=document.getElementById('${FRAME_ID}');if(el){el.style.top=t+'px';el.style.left=l+'px';el.style.width=w+'px';el.style.height=h+'px';}}sync();document.addEventListener('DOMContentLoaded',sync);var n=0,iv=setInterval(function(){sync();if(++n>=60)clearInterval(iv);},50);}catch(e){}})();`;
