// Unified WebGPU black/white-hole renderer with real-time 60 FPS swirling flight transitions.

import type { Frame, Gpu, Surface } from "vgpu";

type VgpuApi = typeof import("vgpu");

import {
  bakeSlotPass,
  bindShadeSlot,
  createEffects,
  createTargets,
  destroyTargets,
  prewarmInitial,
  prewarmTransition,
  renderChain,
  setBakeSlotUniforms,
  setBindings,
  setMorphUniforms,
  setPostUniforms,
  setShadeUniforms,
  updateCompositeUniforms,
  type BakeSlot,
  type Effects,
  type MorphFrameParams,
  type Targets,
} from "./pipeline";
import { defaultHeroSettings } from "./settings";

const SCENE_YAW_TAU_S = 0.325;
const MAX_FRAME_DT_S = 0.1;
const TARGET_FPS = 60;
const FRAME_PACING_EPSILON_MS = 2;
const MIN_FRAME_INTERVAL_MS = 1000 / TARGET_FPS - FRAME_PACING_EPSILON_MS;
const MOBILE_QUERY = "(max-width: 767px)";
const TRANSITION_DURATION_MS = 1000;

export type HoleVariant = "dark" | "light";

interface RendererOptions {
  canvas: HTMLCanvasElement;
  active?: boolean;
  variant?: HoleVariant;
}

type RenderSize = { width: number; height: number };

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function createRenderer({
  canvas,
  active: initialActive = true,
  variant: initialVariant = "dark",
}: RendererOptions) {
  let active = initialActive;
  const settings = defaultHeroSettings();
  let isMobile = window.matchMedia(MOBILE_QUERY).matches;
  const mobileQuery = window.matchMedia(MOBILE_QUERY);

  const applyResponsiveLayout = () => {
    isMobile = mobileQuery.matches;
    const base = defaultHeroSettings();
    const isLight = targetProgress > 0.5;
    if (isMobile) {
      settings.centerX = 0;
      settings.centerY = 0;
      settings.cameraRoll = 0;
      settings.mouseYaw = 0;
      settings.centerFade = 1;
    } else {
      settings.centerX = isLight ? -base.centerX : base.centerX;
      settings.centerY = base.centerY;
      settings.cameraRoll = isLight ? -base.cameraRoll : base.cameraRoll;
      settings.mouseYaw = base.mouseYaw;
      settings.centerFade = 0;
    }
    settings.invert = currentProgress;
  };

  let currentProgress = initialVariant === "light" ? 1 : 0;
  let targetProgress = currentProgress;
  let animStartProgress = currentProgress;
  let animTargetProgress = currentProgress;
  let animStartAtMs: number | undefined;
  let animDurationMs = TRANSITION_DURATION_MS;
  let animDirection = 1;

  applyResponsiveLayout();

  const renderDpr =
    typeof window === "undefined"
      ? 1
      : Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.5);
  const bloomScale = Math.min(Math.max(window.devicePixelRatio, 1), 2) / 2;
  settings.bloom.radius *= bloomScale;
  settings.bloom.strength *= bloomScale;

  let disposed = false;
  let api: VgpuApi | undefined;
  let gpu: Gpu | undefined;
  let surface: Surface | undefined;
  let effects: Effects | undefined;
  let targets: Targets | undefined;
  let loop: { stop(): void } | undefined;
  let observer: ResizeObserver | undefined;
  let intersection: IntersectionObserver | undefined;
  let idleBakeTimer = 0;
  let transitionCompilePromise: Promise<void> | undefined;
  let documentVisible =
    typeof document === "undefined" ? true : !document.hidden;
  let canvasIntersecting = true;

  let started = false;
  let animationTime = 0;
  let lastFrameAt: number | undefined;
  let resizeFrame = 0;
  let pendingSize: RenderSize | undefined;
  let pointerXNormalized = 0;
  let currentSceneYaw = 0;
  let lastYawAt: number | undefined;
  let lastBoundSlotA: BakeSlot | undefined;
  let lastBoundSlotB: BakeSlot | undefined;
  let targetsIsMobile = isMobile;
  let lastCssWidth = 0;
  let lastCssHeight = 0;

  const scheduleIdleStep = (cb: () => void, delayMs: number): number => {
    const win = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        opts?: { timeout: number }
      ) => number;
    };
    return window.setTimeout(() => {
      if (typeof win.requestIdleCallback === "function") {
        win.requestIdleCallback(cb, { timeout: 600 });
      } else {
        cb();
      }
    }, delayMs);
  };

  const ensureSlotBaked = (slot: BakeSlot | undefined) => {
    if (!slot || slot.baked || !effects || !api || !gpu) return;
    setBakeSlotUniforms(effects, slot, settings);
    api.frame(gpu, (frame) => {
      bakeSlotPass(frame, effects!, slot);
    });
    slot.baked = true;
  };

  const primarySlotForProgress = (p: number): BakeSlot | undefined => {
    if (!targets) return undefined;
    if (isMobile) return targets.dark;
    return p > 0.5 && targets.light ? targets.light : targets.dark;
  };

  const ensureTransitionPrewarmed = () => {
    if (!effects || !targets) return;
    if (!transitionCompilePromise) {
      transitionCompilePromise = prewarmTransition(effects, targets).catch(
        () => {}
      );
    }
  };

  const scheduleSecondaryBakes = () => {
    if (idleBakeTimer) window.clearTimeout(idleBakeTimer);
    if (disposed || !targets) return;

    const bakeNext = () => {
      if (disposed || !targets) return;
      ensureTransitionPrewarmed();
      if (isMobile) return;
      const candidate = !targets.mid?.baked
        ? targets.mid
        : !targets.light?.baked
          ? targets.light
          : !targets.dark.baked
            ? targets.dark
            : undefined;
      if (!candidate) return;
      ensureSlotBaked(candidate);
      if (
        (targets.mid && !targets.mid.baked) ||
        (targets.light && !targets.light.baked) ||
        !targets.dark.baked
      ) {
        idleBakeTimer = scheduleIdleStep(bakeNext, 260);
      }
    };

    // Defer secondary shader compiles & bakes until after Hero reveal (~1.4s)
    idleBakeTimer = scheduleIdleStep(bakeNext, 1400);
  };

  const onLayoutChange = () => {
    applyResponsiveLayout();
    if (targets) {
      measure();
    }
  };
  mobileQuery.addEventListener("change", onLayoutChange);

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const width = Math.max(window.innerWidth, 1);
    pointerXNormalized = Math.min(
      1,
      Math.max(-1, (event.clientX / width) * 2 - 1)
    );
  };

  const recenterPointer = () => {
    pointerXNormalized = 0;
  };
  const onPointerOut = (event: PointerEvent) => {
    if (event.relatedTarget === null) recenterPointer();
  };
  const onVisibilityChange = () => {
    if (document.hidden) recenterPointer();
    documentVisible = !document.hidden;
    reconcileLoop();
  };

  function reconcileLoop(): void {
    if (!started || !gpu || !api) return;
    const shouldRun =
      !disposed && active && documentVisible && canvasIntersecting;
    if (shouldRun === Boolean(loop)) return;
    if (shouldRun) {
      lastFrameAt = undefined;
      lastYawAt = undefined;
      loop = startPacedLoop(api, gpu);
    } else {
      loop?.stop();
      loop = undefined;
    }
  }

  function startPacedLoop(vgpu: VgpuApi, activeGpu: Gpu): { stop(): void } {
    let stopped = false;

    let lastPresentedAt: number | undefined;
    const tick = (timestamp: number): void => {
      if (stopped) return;
      if (
        lastPresentedAt === undefined ||
        timestamp - lastPresentedAt >= MIN_FRAME_INTERVAL_MS
      ) {
        lastPresentedAt = timestamp;
        try {
          vgpu.frame(activeGpu, renderFrame);
        } catch (error) {
          handleFailure(error);
        }
      }
      if (!stopped) frameHandle = requestAnimationFrame(tick);
    };
    let frameHandle = requestAnimationFrame(tick);
    return {
      stop(): void {
        stopped = true;
        cancelAnimationFrame(frameHandle);
      },
    };
  }

  const updateTransitionProgress = (now: number): boolean => {
    if (Math.abs(currentProgress - targetProgress) < 1e-4) {
      currentProgress = targetProgress;
      animStartAtMs = undefined;
      settings.invert = currentProgress;
      return false;
    }

    if (animStartAtMs === undefined) {
      animStartAtMs = now;
    }

    const elapsed = Math.max(0, now - animStartAtMs);
    const u = Math.min(1, elapsed / Math.max(1, animDurationMs));
    const eased = easeInOutCubic(u);
    currentProgress =
      animStartProgress + (animTargetProgress - animStartProgress) * eased;

    if (u >= 1) {
      currentProgress = animTargetProgress;
      animStartAtMs = undefined;
      applyResponsiveLayout();
      return false;
    }

    settings.invert = currentProgress;
    return true;
  };

  const advanceAnimationTime = (now: number, p: number, transitioning: boolean): number => {
    const dt =
      lastFrameAt === undefined
        ? 0
        : Math.min(Math.max((now - lastFrameAt) / 1000, 0), MAX_FRAME_DT_S);
    lastFrameAt = now;
    const surge = transitioning ? Math.sin(Math.PI * p) : 0;
    // Smooth speed surge (1x -> 4.2x -> 1x) peaks as the hole crosses center
    const speedFactor = 1.0 + 3.2 * surge * surge;
    animationTime += dt * speedFactor;
    return animationTime;
  };

  const advanceSceneYaw = (now: number): number => {
    if (settings.mouseYaw <= 0) {
      currentSceneYaw = 0;
      lastYawAt = now;
      return 0;
    }
    const dt =
      lastYawAt === undefined
        ? 0
        : Math.min(Math.max((now - lastYawAt) / 1000, 0), MAX_FRAME_DT_S);
    lastYawAt = now;
    const target = pointerXNormalized * Math.max(0, settings.mouseYaw);
    currentSceneYaw +=
      (target - currentSceneYaw) * (1 - Math.exp(-dt / SCENE_YAW_TAU_S));
    return currentSceneYaw;
  };

  const computeMorphParams = (
    p: number,
    transitioning: boolean,
    time: number,
    sceneYaw: number
  ): MorphFrameParams | undefined => {
    if (!targets) return undefined;
    if (!transitioning) {
      const slot = primarySlotForProgress(p) ?? targets.dark;
      return {
        progress: p,
        blend: 0,
        swirlRad: 0,
        waveCenterX: p > 0.5 ? -1.55 : 1.55,
        direction: animDirection,
        currentCenterX: slot.pose.centerX,
        currentCenterY: slot.pose.centerY,
        currentRoll: slot.pose.cameraRoll,
        sceneYaw,
        time,
        singleSource: isMobile,
        transitioning: false,
        slotA: slot,
        slotB: slot,
      };
    }

    const waveCenterX = 1.55 * (1.0 - 2.0 * p);
    const surge = Math.sin(Math.PI * p);

    if (isMobile || !targets.mid || !targets.light) {
      return {
        progress: p,
        blend: 0,
        swirlRad: animDirection * 0.24 * surge,
        waveCenterX,
        direction: animDirection,
        currentCenterX: 0,
        currentCenterY: 0,
        currentRoll: 0,
        sceneYaw,
        time,
        singleSource: true,
        transitioning: true,
        slotA: targets.dark,
        slotB: targets.dark,
      };
    }

    const base = defaultHeroSettings();
    const curX = base.centerX * (1.0 - 2.0 * p);
    const curY = base.centerY - 0.14 * surge;
    const curRoll = base.cameraRoll * (1.0 - 2.0 * p);
    const swirlRad = animDirection * 0.28 * surge;

    const firstHalf = p <= 0.5;
    const slotA = firstHalf ? targets.dark : targets.mid;
    const slotB = firstHalf ? targets.mid : targets.light;
    const blend = firstHalf ? p * 2.0 : (p - 0.5) * 2.0;

    return {
      progress: p,
      blend,
      swirlRad,
      waveCenterX,
      direction: animDirection,
      currentCenterX: curX,
      currentCenterY: curY,
      currentRoll: curRoll,
      sceneYaw,
      time,
      singleSource: false,
      transitioning: true,
      slotA,
      slotB,
    };
  };

  const renderFrame = (frame: Frame): void => {
    if (disposed || !effects || !targets || !surface) return;
    const now = clockMs();
    const transitioning = updateTransitionProgress(now);
    const p = currentProgress;
    const time = advanceAnimationTime(now, p, transitioning);
    const sceneYaw = advanceSceneYaw(now);

    const morph = computeMorphParams(p, transitioning, time, sceneYaw);
    if (!morph) return;

    // Ensure required slots are baked before shading
    if (!morph.slotA.baked) ensureSlotBaked(morph.slotA);
    if (transitioning && !morph.singleSource && !morph.slotB.baked) {
      ensureSlotBaked(morph.slotB);
    }

    if (lastBoundSlotA !== morph.slotA) {
      bindShadeSlot(effects.shadeA, effects, targets, morph.slotA);
      lastBoundSlotA = morph.slotA;
    }
    if (transitioning && !morph.singleSource && lastBoundSlotB !== morph.slotB) {
      bindShadeSlot(effects.shadeB, effects, targets, morph.slotB);
      lastBoundSlotB = morph.slotB;
    }

    setShadeUniforms(effects, targets, settings, time, sceneYaw);
    if (transitioning) {
      setMorphUniforms(effects, targets, settings, morph);
    }
    updateCompositeUniforms(effects, targets, settings, morph);

    renderChain(
      frame,
      effects,
      targets,
      surface,
      transitioning,
      morph.singleSource
    );
  };

  const applyResize = () => {
    resizeFrame = 0;
    const size = pendingSize;
    pendingSize = undefined;
    if (disposed || !size || !gpu || !api || !effects || !targets || !surface)
      return;
    try {
      applyResponsiveLayout();
      const previousTargets = targets;
      const nextTargets = createTargets(
        api,
        gpu,
        [Math.max(1, Math.round(size.width)), Math.max(1, Math.round(size.height))],
        defaultHeroSettings(),
        isMobile
      );
      try {
        setBakeSlotUniforms(effects, nextTargets.dark, settings);
        setShadeUniforms(effects, nextTargets, settings, animationTime, currentSceneYaw);
        setBindings(effects, nextTargets);
        setPostUniforms(effects, nextTargets, settings);
      } catch (error) {
        destroyTargets(nextTargets);
        throw error;
      }
      targets = nextTargets;
      targetsIsMobile = isMobile;
      lastBoundSlotA = undefined;
      lastBoundSlotB = undefined;
      destroyTargets(previousTargets);

      const primary = primarySlotForProgress(currentProgress);
      ensureSlotBaked(primary);
      scheduleSecondaryBakes();

      if (!active && started) {
        api.frame(gpu, renderFrame);
      }
    } catch (error) {
      handleFailure(error);
    }
  };

  const resize = (size: RenderSize) => {
    if (disposed || size.width <= 0 || size.height <= 0) return;
    const cssW = Math.round(size.width);
    const cssH = Math.round(size.height);
    // Skip no-op initial ResizeObserver fire even under fractional DPR / browser zoom
    if (
      targets &&
      cssW === lastCssWidth &&
      cssH === lastCssHeight &&
      targetsIsMobile === isMobile
    ) {
      return;
    }
    lastCssWidth = cssW;
    lastCssHeight = cssH;
    pendingSize = {
      width: Math.max(1, Math.round(cssW * renderDpr)),
      height: Math.max(1, Math.round(cssH * renderDpr)),
    };
    if (!resizeFrame) resizeFrame = requestAnimationFrame(applyResize);
  };

  const measure = () => {
    resize({
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });
  };

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    loop?.stop();
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    if (idleBakeTimer) window.clearTimeout(idleBakeTimer);
    observer?.disconnect();
    intersection?.disconnect();
    if (typeof window !== "undefined") {
      mobileQuery.removeEventListener("change", onLayoutChange);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", recenterPointer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }
    gpu?.dispose();
  };

  const initialize = async () => {
    const vgpu = await import("vgpu");
    const { init } = vgpu;
    if (disposed) return;
    const nextGpu = await init();
    if (disposed) {
      nextGpu.dispose();
      return;
    }
    gpu = nextGpu;
    api = vgpu;
    lastCssWidth = Math.round(canvas.clientWidth);
    lastCssHeight = Math.round(canvas.clientHeight);
    surface = vgpu.surface(gpu, canvas, { dpr: renderDpr });
    effects = createEffects(vgpu, gpu);
    targets = createTargets(
      vgpu,
      gpu,
      surface.size,
      defaultHeroSettings(),
      isMobile
    );
    const primary = primarySlotForProgress(currentProgress);
    setBakeSlotUniforms(effects, primary ?? targets.dark, settings);
    setShadeUniforms(effects, targets, settings, animationTime, currentSceneYaw);
    setBindings(effects, targets);
    setPostUniforms(effects, targets, settings);
    await prewarmInitial(effects, targets, surface);
    if (disposed) return;

    ensureSlotBaked(primary);
    // Present first frame before signaling ready so opacity reveal never flashes blank
    vgpu.frame(gpu, renderFrame);

    observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    observer?.observe(canvas);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });
    window.addEventListener("blur", recenterPointer);
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (typeof IntersectionObserver !== "undefined") {
      intersection = new IntersectionObserver(
        (entries) => {
          canvasIntersecting =
            entries[entries.length - 1]?.isIntersecting ?? canvasIntersecting;
          reconcileLoop();
        },
        { threshold: 0 }
      );
      intersection.observe(canvas);
    }
    started = true;
    documentVisible = !document.hidden;
    scheduleSecondaryBakes();
    reconcileLoop();
  };

  const setActive = (nextActive: boolean) => {
    if (active === nextActive) return;
    active = nextActive;
    reconcileLoop();
  };

  const setVariant = (nextVariant: HoleVariant, animate = true) => {
    const nextTarget = nextVariant === "light" ? 1 : 0;
    if (nextTarget === targetProgress) return;
    targetProgress = nextTarget;

    if (!animate) {
      currentProgress = nextTarget;
      animStartProgress = nextTarget;
      animTargetProgress = nextTarget;
      animStartAtMs = undefined;
      applyResponsiveLayout();
      if (started && !active && gpu && api) {
        api.frame(gpu, renderFrame);
      }
      return;
    }

    // Ensure transition shaders & bakes are ready before flying
    ensureTransitionPrewarmed();
    if (!isMobile && targets) {
      ensureSlotBaked(targets.dark);
      ensureSlotBaked(targets.mid);
      ensureSlotBaked(targets.light);
    }

    animStartProgress = currentProgress;
    animTargetProgress = nextTarget;
    animDirection = nextTarget > currentProgress ? 1 : -1;
    animStartAtMs = clockMs();
    animDurationMs = Math.max(
      240,
      TRANSITION_DURATION_MS * Math.abs(nextTarget - currentProgress)
    );
    applyResponsiveLayout();
  };

  function handleFailure(error: unknown): never {
    dispose();
    throw error;
  }

  const ready = initialize().catch((error: unknown) => {
    if (disposed) return;
    handleFailure(error);
  });

  return { ready, setActive, setVariant, dispose };
}

function clockMs(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}
