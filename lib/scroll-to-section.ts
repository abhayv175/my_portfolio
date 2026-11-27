import type Lenis from "lenis";

const easeInOutSine = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;

let activeCancel: (() => void) | null = null;

function cancelFallbackScroll() {
  if (activeCancel) {
    activeCancel();
    activeCancel = null;
  }
}

/**
 * Smoothly scrolls to a section hash (e.g. `#skills`) using distance-scaled
 * duration and soft sinusoidal easing so long jumps do not race past sections.
 * Returns the animation duration in milliseconds for scroll-spy cooldown syncing.
 */
export function scrollToSection(hash: string, lenis?: Lenis | null): number {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return 0;
  }

  const targetId = hash.replace(/^#/, "");
  const element = document.getElementById(targetId);
  if (!element) {
    return 0;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const rect = element.getBoundingClientRect();
  const scrollMarginTop =
    Number.parseFloat(window.getComputedStyle(element).scrollMarginTop) || 0;
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const targetY = Math.min(
    maxScroll,
    Math.max(0, rect.top + window.scrollY - scrollMarginTop)
  );
  const startY = window.scrollY;
  const distance = Math.abs(targetY - startY);

  if (prefersReducedMotion || distance < 2) {
    cancelFallbackScroll();
    if (lenis) {
      lenis.scrollTo(targetY, { immediate: true, force: true });
    } else {
      window.scrollTo({ top: targetY, behavior: "instant" });
    }
    return 0;
  }

  const durationSec = Math.min(2.5, Math.max(0.85, 0.7 + distance / 3700));
  const durationMs = Math.round(durationSec * 1000);

  if (lenis) {
    cancelFallbackScroll();
    lenis.scrollTo(targetY, {
      duration: durationSec,
      easing: easeInOutSine,
      force: true,
    });
    return durationMs;
  }

  cancelFallbackScroll();
  const startTime = performance.now();
  let rafId = 0;

  const cleanup = () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    window.removeEventListener("wheel", cleanup);
    window.removeEventListener("touchstart", cleanup);
    if (activeCancel === cleanup) {
      activeCancel = null;
    }
  };

  activeCancel = cleanup;
  window.addEventListener("wheel", cleanup, { passive: true });
  window.addEventListener("touchstart", cleanup, { passive: true });

  const step = (now: number) => {
    const progress = Math.min(1, Math.max(0, (now - startTime) / durationMs));
    const eased = easeInOutSine(progress);
    window.scrollTo({
      top: startY + (targetY - startY) * eased,
      behavior: "instant",
    });
    if (progress < 1) {
      rafId = window.requestAnimationFrame(step);
    } else {
      cleanup();
    }
  };

  rafId = window.requestAnimationFrame(step);
  return durationMs;
}
