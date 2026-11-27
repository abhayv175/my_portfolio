// WebGL 2 black/white-hole fallback renderer with real-time 60 FPS swirling flight transitions.

import { defaultHeroSettings, type HeroSettings } from "./settings";
import {
  BAKE_FRAGMENT_GLSL,
  BLOOM_FRAGMENT_GLSL,
  COMPOSITE_FRAGMENT_GLSL,
  FULLSCREEN_VERTEX_GLSL,
  MORPH_FRAGMENT_GLSL,
  REFINE_FRAGMENT_GLSL,
  SHADE_FRAGMENT_GLSL,
} from "./webgl2-shaders";

export type HoleVariant = "dark" | "light";

interface RendererOptions {
  canvas: HTMLCanvasElement;
  active?: boolean;
  variant?: HoleVariant;
  onMotionChange?: (intensity: number, pan: number) => void;
}

type RenderSize = { width: number; height: number };

interface BakePose {
  centerX: number;
  centerY: number;
  cameraRoll: number;
}

interface ColorAttachmentSpec {
  internalFormat: number;
  filter: number;
}

interface FrameTarget {
  width: number;
  height: number;
  fbo: WebGLFramebuffer;
  colors: WebGLTexture[];
}

interface BakeSlot {
  gbuffer: FrameTarget;
  aa: FrameTarget;
  pose: BakePose;
  baked: boolean;
}

interface Targets {
  dark: BakeSlot;
  mid?: BakeSlot;
  light?: BakeSlot;
  scene: FrameTarget;
  sceneA: FrameTarget;
  sceneB: FrameTarget;
  bloom0: FrameTarget;
  bloomPing0: FrameTarget;
  bloom1: FrameTarget;
  bloomPing1: FrameTarget;
  bloom2: FrameTarget;
  bloomPing2: FrameTarget;
}

interface CompiledProgram {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
}

interface Programs {
  bake: CompiledProgram;
  refine: CompiledProgram;
  shade: CompiledProgram;
  morph: CompiledProgram;
  bloom: CompiledProgram;
  composite: CompiledProgram;
}

interface FormatProfile {
  coordInternalFormat: number;
  hdrInternalFormat: number;
  coverageInternalFormat: number;
}

const SCENE_YAW_TAU_S = 0.325;
const MAX_FRAME_DT_S = 0.1;
const TARGET_FPS = 60;
const FRAME_PACING_EPSILON_MS = 2;
const MIN_FRAME_INTERVAL_MS = 1000 / TARGET_FPS - FRAME_PACING_EPSILON_MS;
const TARGET_FRAME_INTERVAL_MS = 1000 / TARGET_FPS;
const MOBILE_QUERY = "(max-width: 767px)";
const TRANSITION_DURATION_MS = 1000;
const NOISE_VOLUME_SIZE = 64;

const MOBILE_POSE: BakePose = {
  centerX: 0,
  centerY: 0,
  cameraRoll: 0,
};

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function desktopPoses(settings: HeroSettings): {
  dark: BakePose;
  mid: BakePose;
  light: BakePose;
} {
  return {
    dark: {
      centerX: settings.centerX,
      centerY: settings.centerY,
      cameraRoll: settings.cameraRoll,
    },
    mid: {
      centerX: 0,
      centerY: 0.16,
      cameraRoll: 0,
    },
    light: {
      centerX: -settings.centerX,
      centerY: settings.centerY,
      cameraRoll: -settings.cameraRoll,
    },
  };
}

function buildNoiseVolume(size: number, seed: number): Uint8Array {
  const fr = Math.fround;
  const fract = (value: number) => fr(value - Math.floor(value));
  const K0 = fr(0.1031);
  const K1 = fr(0.103);
  const K2 = fr(0.0973);
  const K3 = fr(33.33);
  const latticeCoord = (index: number) =>
    index < size / 2 ? index : index - size;
  const hash31 = (x: number, y: number, z: number) => {
    let qx = fract(fr(x * K0));
    let qy = fract(fr(y * K1));
    let qz = fract(fr(z * K2));
    const d = fr(
      fr(fr(qx * fr(qy + K3)) + fr(qy * fr(qz + K3))) + fr(qz * fr(qx + K3))
    );
    qx = fr(qx + d);
    qy = fr(qy + d);
    qz = fr(qz + d);
    return fract(fr(fr(qx + qy) * qz));
  };

  const data = new Uint8Array(size * size * size);
  const offset = seed * 1024;
  let cursor = 0;
  for (let z = 0; z < size; z++) {
    const pz = latticeCoord(z) + offset;
    for (let y = 0; y < size; y++) {
      const py = latticeCoord(y);
      for (let x = 0; x < size; x++) {
        data[cursor++] = Math.min(
          255,
          Math.round(hash31(latticeCoord(x), py, pz) * 255)
        );
      }
    }
  }
  return data;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("WebGL2: failed to allocate shader.");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || "Unknown shader error";
    gl.deleteShader(shader);
    throw new Error(`WebGL2 shader compile failed: ${log}`);
  }
  return shader;
}

function compileProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentSource: string,
  uniformNames: readonly string[]
): CompiledProgram {
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(fragShader);
    throw new Error("WebGL2: failed to allocate program.");
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  gl.deleteShader(fragShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || "Unknown link error";
    gl.deleteProgram(program);
    throw new Error(`WebGL2 program link failed: ${log}`);
  }
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  for (const name of uniformNames) {
    uniforms[name] = gl.getUniformLocation(program, name);
  }
  return { program, uniforms };
}

function createTarget(
  gl: WebGL2RenderingContext,
  size: readonly [number, number],
  specs: readonly ColorAttachmentSpec[]
): FrameTarget {
  const width = Math.max(1, Math.floor(size[0]));
  const height = Math.max(1, Math.floor(size[1]));
  const fbo = gl.createFramebuffer();
  if (!fbo) {
    throw new Error("WebGL2: failed to create framebuffer.");
  }
  const colors: WebGLTexture[] = [];
  const drawBuffers: number[] = [];

  try {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    specs.forEach((spec, index) => {
      const tex = gl.createTexture();
      if (!tex) {
        throw new Error("WebGL2: failed to create target texture.");
      }
      colors.push(tex);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texStorage2D(gl.TEXTURE_2D, 1, spec.internalFormat, width, height);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, spec.filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, spec.filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const attachment = gl.COLOR_ATTACHMENT0 + index;
      gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, tex, 0);
      drawBuffers.push(attachment);
    });
    gl.drawBuffers(drawBuffers);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`WebGL2 incomplete framebuffer: 0x${status.toString(16)}`);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { width, height, fbo, colors };
  } catch (error) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fbo);
    for (const tex of colors) gl.deleteTexture(tex);
    throw error;
  }
}

function destroyTarget(gl: WebGL2RenderingContext, target: FrameTarget | undefined): void {
  if (!target) return;
  gl.deleteFramebuffer(target.fbo);
  for (const tex of target.colors) gl.deleteTexture(tex);
}

function testTargetProfile(
  gl: WebGL2RenderingContext,
  profile: FormatProfile
): boolean {
  let gbuf: FrameTarget | undefined;
  let aa: FrameTarget | undefined;
  try {
    gbuf = createTarget(
      gl,
      [8, 8],
      [
        { internalFormat: profile.coordInternalFormat, filter: gl.NEAREST },
        { internalFormat: profile.coordInternalFormat, filter: gl.NEAREST },
        { internalFormat: profile.hdrInternalFormat, filter: gl.NEAREST },
        { internalFormat: profile.hdrInternalFormat, filter: gl.NEAREST },
      ]
    );
    aa = createTarget(
      gl,
      [8, 8],
      [
        { internalFormat: profile.coverageInternalFormat, filter: gl.NEAREST },
        { internalFormat: profile.hdrInternalFormat, filter: gl.NEAREST },
      ]
    );
    return true;
  } catch {
    return false;
  } finally {
    destroyTarget(gl, gbuf);
    destroyTarget(gl, aa);
  }
}

function selectFormatProfile(gl: WebGL2RenderingContext): FormatProfile {
  gl.getExtension("EXT_color_buffer_float");
  gl.getExtension("EXT_color_buffer_half_float");

  const candidates: FormatProfile[] = [
    {
      coordInternalFormat: gl.RG32F,
      hdrInternalFormat: gl.RGBA16F,
      coverageInternalFormat: gl.RG8,
    },
    {
      coordInternalFormat: gl.RG16F,
      hdrInternalFormat: gl.RGBA16F,
      coverageInternalFormat: gl.RG8,
    },
    {
      coordInternalFormat: gl.RGBA16F,
      hdrInternalFormat: gl.RGBA16F,
      coverageInternalFormat: gl.RGBA16F,
    },
  ];

  for (const candidate of candidates) {
    if (testTargetProfile(gl, candidate)) {
      return candidate;
    }
  }
  throw new Error("WebGL2: no float color-attachment profile supported.");
}

function scaleSize(
  size: readonly [number, number],
  divisor: number
): [number, number] {
  return [
    Math.max(1, Math.floor(size[0] / divisor)),
    Math.max(1, Math.floor(size[1] / divisor)),
  ];
}

function createTargets(
  gl: WebGL2RenderingContext,
  size: readonly [number, number],
  settings: HeroSettings,
  isMobile: boolean,
  profile: FormatProfile
): Targets {
  const full: [number, number] = [
    Math.max(1, Math.floor(size[0])),
    Math.max(1, Math.floor(size[1])),
  ];
  const half = scaleSize(full, 2);
  const quarter = scaleSize(full, 4);
  const eighth = scaleSize(full, 8);

  const created: FrameTarget[] = [];
  const own = (value: FrameTarget) => {
    created.push(value);
    return value;
  };
  const postTarget = (targetSize: readonly [number, number]) =>
    own(
      createTarget(gl, targetSize, [
        { internalFormat: profile.hdrInternalFormat, filter: gl.LINEAR },
      ])
    );

  const createSlot = (pose: BakePose): BakeSlot => ({
    gbuffer: own(
      createTarget(gl, full, [
        { internalFormat: profile.coordInternalFormat, filter: gl.NEAREST },
        { internalFormat: profile.coordInternalFormat, filter: gl.NEAREST },
        { internalFormat: profile.hdrInternalFormat, filter: gl.NEAREST },
        { internalFormat: profile.hdrInternalFormat, filter: gl.NEAREST },
      ])
    ),
    aa: own(
      createTarget(gl, full, [
        { internalFormat: profile.coverageInternalFormat, filter: gl.NEAREST },
        { internalFormat: profile.hdrInternalFormat, filter: gl.NEAREST },
      ])
    ),
    pose,
    baked: false,
  });

  try {
    const poses = desktopPoses(settings);
    return {
      dark: createSlot(isMobile ? { ...MOBILE_POSE } : poses.dark),
      mid: isMobile ? undefined : createSlot(poses.mid),
      light: isMobile ? undefined : createSlot(poses.light),
      scene: postTarget(full),
      sceneA: postTarget(full),
      sceneB: postTarget(full),
      bloom0: postTarget(half),
      bloomPing0: postTarget(half),
      bloom1: postTarget(quarter),
      bloomPing1: postTarget(quarter),
      bloom2: postTarget(eighth),
      bloomPing2: postTarget(eighth),
    };
  } catch (error) {
    for (const value of created.reverse()) {
      destroyTarget(gl, value);
    }
    throw error;
  }
}

function destroyTargets(gl: WebGL2RenderingContext, targets: Targets): void {
  const list: (FrameTarget | undefined)[] = [
    targets.dark.gbuffer,
    targets.dark.aa,
    targets.mid?.gbuffer,
    targets.mid?.aa,
    targets.light?.gbuffer,
    targets.light?.aa,
    targets.scene,
    targets.sceneA,
    targets.sceneB,
    targets.bloom0,
    targets.bloomPing0,
    targets.bloom1,
    targets.bloomPing1,
    targets.bloom2,
    targets.bloomPing2,
  ];
  for (const t of list) destroyTarget(gl, t);
}

function clockMs(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

/** Creates a WebGL 2 black/white-hole renderer matching the WebGPU renderer contract. */
export function createWebGl2Renderer({
  canvas,
  active: initialActive = true,
  variant: initialVariant = "dark",
  onMotionChange,
}: RendererOptions) {
  let active = initialActive;
  const settings = defaultHeroSettings();
  const mobileQuery = window.matchMedia(MOBILE_QUERY);
  let isMobile = mobileQuery.matches;

  let currentProgress = initialVariant === "light" ? 1 : 0;
  let targetProgress = currentProgress;
  let animStartProgress = currentProgress;
  let animTargetProgress = currentProgress;
  let animStartAtMs: number | undefined;
  let animDurationMs = TRANSITION_DURATION_MS;
  let animDirection = 1;

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

  applyResponsiveLayout();

  const dprCap = isMobile ? 1.25 : 1.5;
  const rawDpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const renderDpr = Math.min(Math.max(rawDpr, 1), dprCap);
  const bloomScale = Math.min(Math.max(rawDpr, 1), 2) / 2;
  settings.bloom.radius *= bloomScale;
  settings.bloom.strength *= bloomScale;

  let disposed = false;
  let gl: WebGL2RenderingContext | undefined;
  let profile: FormatProfile | undefined;
  let programs: Programs | undefined;
  let vao: WebGLVertexArrayObject | null = null;
  let noiseTex: WebGLTexture | null = null;
  let targets: Targets | undefined;
  let loop: { stop(): void } | undefined;
  let observer: ResizeObserver | undefined;
  let intersection: IntersectionObserver | undefined;
  let idleBakeTimer = 0;
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
  let lastYawSpeed = 0;
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

  const bindTexture = (
    activeGl: WebGL2RenderingContext,
    unit: number,
    targetType: number,
    texture: WebGLTexture | null | undefined,
    uniformLoc: WebGLUniformLocation | null | undefined
  ) => {
    activeGl.activeTexture(activeGl.TEXTURE0 + unit);
    activeGl.bindTexture(targetType, texture ?? null);
    if (uniformLoc !== null && uniformLoc !== undefined) {
      activeGl.uniform1i(uniformLoc, unit);
    }
  };

  const drawPass = (
    activeGl: WebGL2RenderingContext,
    target: FrameTarget | null,
    width: number,
    height: number
  ) => {
    activeGl.bindFramebuffer(activeGl.FRAMEBUFFER, target ? target.fbo : null);
    activeGl.viewport(0, 0, width, height);
    activeGl.drawArrays(activeGl.TRIANGLES, 0, 3);
  };

  const bakeSlot = (slot: BakeSlot | undefined) => {
    if (!slot || slot.baked || !gl || !programs) return;
    const w = slot.gbuffer.width;
    const h = slot.gbuffer.height;

    const bake = programs.bake;
    gl.useProgram(bake.program);
    gl.uniform2f(bake.uniforms.uResolution, w, h);
    gl.uniform4f(
      bake.uniforms.uCamera0,
      0,
      settings.cameraY,
      settings.distance,
      settings.diskRadius
    );
    gl.uniform4f(
      bake.uniforms.uCamera1,
      settings.fov,
      slot.pose.centerX,
      slot.pose.centerY,
      slot.pose.cameraRoll
    );
    drawPass(gl, slot.gbuffer, w, h);

    const refine = programs.refine;
    gl.useProgram(refine.program);
    gl.uniform2f(refine.uniforms.uResolution, w, h);
    gl.uniform4f(
      refine.uniforms.uCamera0,
      0,
      settings.cameraY,
      settings.distance,
      settings.diskRadius
    );
    gl.uniform4f(
      refine.uniforms.uCamera1,
      settings.fov,
      slot.pose.centerX,
      slot.pose.centerY,
      slot.pose.cameraRoll
    );
    bindTexture(gl, 0, gl.TEXTURE_2D, slot.gbuffer.colors[0], refine.uniforms.uGHit1);
    bindTexture(gl, 1, gl.TEXTURE_2D, slot.gbuffer.colors[2], refine.uniforms.uGSky);
    drawPass(gl, slot.aa, w, h);

    slot.baked = true;
  };

  const primarySlotForProgress = (p: number): BakeSlot | undefined => {
    if (!targets) return undefined;
    if (isMobile) return targets.dark;
    return p > 0.5 && targets.light ? targets.light : targets.dark;
  };

  const scheduleSecondaryBakes = () => {
    if (idleBakeTimer) window.clearTimeout(idleBakeTimer);
    if (disposed || !targets || isMobile) return;

    const bakeNext = () => {
      if (disposed || !targets || isMobile) return;
      const candidate = !targets.mid?.baked
        ? targets.mid
        : !targets.light?.baked
          ? targets.light
          : !targets.dark.baked
            ? targets.dark
            : undefined;
      if (!candidate) return;
      bakeSlot(candidate);
      if (
        (targets.mid && !targets.mid.baked) ||
        (targets.light && !targets.light.baked) ||
        !targets.dark.baked
      ) {
        idleBakeTimer = scheduleIdleStep(bakeNext, 260);
      }
    };

    idleBakeTimer = scheduleIdleStep(bakeNext, 1400);
  };

  const onLayoutChange = () => {
    applyResponsiveLayout();
    if (targets) measure();
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
    if (!started || !gl) return;
    const shouldRun =
      !disposed && active && documentVisible && canvasIntersecting;
    if (shouldRun === Boolean(loop)) return;
    if (shouldRun) {
      lastFrameAt = undefined;
      lastYawAt = undefined;
      loop = startPacedLoop();
    } else {
      loop?.stop();
      loop = undefined;
    }
  }

  function startPacedLoop(): { stop(): void } {
    let stopped = false;
    let lastPresentedAt: number | undefined;
    const tick = (timestamp: number): void => {
      if (stopped) return;
      const elapsed =
        lastPresentedAt === undefined
          ? TARGET_FRAME_INTERVAL_MS
          : timestamp - lastPresentedAt;
      if (lastPresentedAt === undefined || elapsed >= MIN_FRAME_INTERVAL_MS) {
        lastPresentedAt =
          lastPresentedAt === undefined ||
          elapsed > TARGET_FRAME_INTERVAL_MS * 2
            ? timestamp
            : lastPresentedAt + TARGET_FRAME_INTERVAL_MS;
        try {
          submitFrame(timestamp);
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

  const advanceAnimationTime = (
    now: number,
    p: number,
    transitioning: boolean
  ): number => {
    const dt =
      lastFrameAt === undefined
        ? 0
        : Math.min(Math.max((now - lastFrameAt) / 1000, 0), MAX_FRAME_DT_S);
    lastFrameAt = now;
    const surge = transitioning ? Math.sin(Math.PI * p) : 0;
    const speedFactor = 1.0 + 3.2 * surge * surge;
    animationTime += dt * speedFactor;
    return animationTime;
  };

  const advanceSceneYaw = (now: number): number => {
    if (settings.mouseYaw <= 0) {
      currentSceneYaw = 0;
      lastYawSpeed = 0;
      lastYawAt = now;
      return 0;
    }
    const dt =
      lastYawAt === undefined
        ? 0
        : Math.min(Math.max((now - lastYawAt) / 1000, 0), MAX_FRAME_DT_S);
    lastYawAt = now;
    const target = pointerXNormalized * Math.max(0, settings.mouseYaw);
    const prevYaw = currentSceneYaw;
    currentSceneYaw +=
      (target - currentSceneYaw) * (1 - Math.exp(-dt / SCENE_YAW_TAU_S));
    lastYawSpeed = dt > 0 ? Math.abs(currentSceneYaw - prevYaw) / dt : 0;
    return currentSceneYaw;
  };

  const drawShadePass = (
    slot: BakeSlot,
    dest: FrameTarget,
    time: number,
    sceneYaw: number
  ) => {
    if (!gl || !programs || !noiseTex) return;
    const shade = programs.shade;
    const disk = settings.disk;
    const stars = settings.stars;

    gl.useProgram(shade.program);
    gl.uniform4f(
      shade.uniforms.uShade0,
      slot.gbuffer.width,
      slot.gbuffer.height,
      time,
      settings.diskRadius
    );
    gl.uniform2f(shade.uniforms.uShade1, sceneYaw, settings.centerFade);
    gl.uniform4f(
      shade.uniforms.uDisk0,
      disk.brightness,
      disk.speed,
      disk.stretch,
      disk.detail
    );
    gl.uniform4f(
      shade.uniforms.uDisk1,
      disk.turbulence,
      disk.density,
      disk.doppler,
      disk.cloudScale
    );
    gl.uniform4f(
      shade.uniforms.uDisk2,
      disk.cloudSpeed,
      disk.cloudStrength,
      disk.spare0,
      disk.spare1
    );
    gl.uniform2f(shade.uniforms.uDisk3, disk.spare2, disk.spare3);
    gl.uniform4f(
      shade.uniforms.uStars0,
      stars.brightness,
      stars.density,
      stars.contrast,
      stars.warmth
    );
    gl.uniform1f(shade.uniforms.uStarsTwinkle, stars.twinkle);

    bindTexture(gl, 0, gl.TEXTURE_2D, slot.gbuffer.colors[0], shade.uniforms.uGHit1);
    bindTexture(gl, 1, gl.TEXTURE_2D, slot.gbuffer.colors[1], shade.uniforms.uGHit2);
    bindTexture(gl, 2, gl.TEXTURE_2D, slot.gbuffer.colors[2], shade.uniforms.uGSky);
    bindTexture(gl, 3, gl.TEXTURE_2D, slot.gbuffer.colors[3], shade.uniforms.uGView);
    bindTexture(gl, 4, gl.TEXTURE_2D, slot.aa.colors[0], shade.uniforms.uGAa);
    bindTexture(gl, 5, gl.TEXTURE_2D, slot.aa.colors[1], shade.uniforms.uGAaGeom);
    bindTexture(gl, 6, gl.TEXTURE_3D, noiseTex, shade.uniforms.uNoiseVolume);

    drawPass(gl, dest, dest.width, dest.height);
  };

  const drawBloomStep = (
    src: FrameTarget,
    dest: FrameTarget,
    sourceSize: readonly [number, number],
    dirX: number,
    dirY: number,
    mode: number,
    threshold: number,
    knee: number,
    radius: number
  ) => {
    if (!gl || !programs) return;
    const bloom = programs.bloom;
    gl.useProgram(bloom.program);
    gl.uniform2f(bloom.uniforms.uSourceSize, sourceSize[0], sourceSize[1]);
    gl.uniform2f(bloom.uniforms.uDirection, dirX, dirY);
    gl.uniform4f(bloom.uniforms.uParams, threshold, knee, radius, mode);
    bindTexture(gl, 0, gl.TEXTURE_2D, src.colors[0], bloom.uniforms.uSource);
    drawPass(gl, dest, dest.width, dest.height);
  };

  function submitFrame(frameNow = clockMs()): void {
    if (disposed || !gl || !programs || !targets) return;

    const now = frameNow;
    const transitioning = updateTransitionProgress(now);
    const p = currentProgress;
    const time = advanceAnimationTime(now, p, transitioning);
    const sceneYaw = advanceSceneYaw(now);
    const surge = transitioning ? Math.sin(Math.PI * p) : 0;
    const panIntensity = Math.min(1, lastYawSpeed / 0.45);
    onMotionChange?.(Math.min(1, Math.max(panIntensity, surge)), pointerXNormalized);

    let waveCenterX = p > 0.5 ? -1.55 : 1.55;
    let curX = settings.centerX;
    let curY = settings.centerY;

    gl.bindVertexArray(vao);

    if (!transitioning) {
      const slot = primarySlotForProgress(p) ?? targets.dark;
      if (!slot.baked) bakeSlot(slot);
      curX = slot.pose.centerX;
      curY = slot.pose.centerY;
      drawShadePass(slot, targets.scene, time, sceneYaw);
    } else {
      waveCenterX = 1.55 * (1.0 - 2.0 * p);
      const singleSource = isMobile || !targets.mid || !targets.light;
      let slotA: BakeSlot = targets.dark;
      let slotB: BakeSlot = targets.dark;
      let blend = 0;
      let curRoll = 0;
      let swirlRad = animDirection * 0.24 * surge;

      if (singleSource) {
        curX = 0;
        curY = 0;
        if (!slotA.baked) bakeSlot(slotA);
        drawShadePass(slotA, targets.sceneA, time, sceneYaw);
      } else {
        const base = defaultHeroSettings();
        curX = base.centerX * (1.0 - 2.0 * p);
        curY = base.centerY - 0.14 * surge;
        curRoll = base.cameraRoll * (1.0 - 2.0 * p);
        swirlRad = animDirection * 0.28 * surge;
        const firstHalf = p <= 0.5;
        slotA = firstHalf ? targets.dark : targets.mid!;
        slotB = firstHalf ? targets.mid! : targets.light!;
        blend = firstHalf ? p * 2.0 : (p - 0.5) * 2.0;
        if (!slotA.baked) bakeSlot(slotA);
        if (!slotB.baked) bakeSlot(slotB);
        drawShadePass(slotA, targets.sceneA, time, sceneYaw);
        drawShadePass(slotB, targets.sceneB, time, sceneYaw);
      }

      const morph = programs.morph;
      const stars = settings.stars;
      gl.useProgram(morph.program);
      gl.uniform4f(
        morph.uniforms.uFrameInfo,
        targets.scene.width,
        targets.scene.height,
        blend,
        swirlRad
      );
      gl.uniform4f(morph.uniforms.uCurrentPose, curX, curY, curRoll, sceneYaw);
      gl.uniform4f(
        morph.uniforms.uSourceA,
        slotA.pose.centerX,
        slotA.pose.centerY,
        slotA.pose.cameraRoll,
        time
      );
      gl.uniform4f(
        morph.uniforms.uSourceB,
        slotB.pose.centerX,
        slotB.pose.centerY,
        slotB.pose.cameraRoll,
        settings.cameraY
      );
      gl.uniform4f(
        morph.uniforms.uCamera,
        settings.distance,
        settings.fov,
        1.0,
        singleSource ? 1 : 0
      );
      gl.uniform4f(
        morph.uniforms.uStars0,
        stars.brightness,
        stars.density,
        stars.contrast,
        stars.warmth
      );
      gl.uniform1f(morph.uniforms.uStarsTwinkle, stars.twinkle);
      bindTexture(gl, 0, gl.TEXTURE_2D, targets.sceneA.colors[0], morph.uniforms.uSceneA);
      bindTexture(gl, 1, gl.TEXTURE_2D, targets.sceneB.colors[0], morph.uniforms.uSceneB);
      drawPass(gl, targets.scene, targets.scene.width, targets.scene.height);
    }

    const threshold = Math.max(0, settings.bloom.threshold);
    const knee = Math.max(0.0001, settings.bloom.knee);
    const radius = Math.max(0.1, settings.bloom.radius);

    drawBloomStep(
      targets.scene,
      targets.bloom0,
      [targets.scene.width, targets.scene.height],
      0,
      0,
      0,
      threshold,
      knee,
      radius
    );
    drawBloomStep(
      targets.bloom0,
      targets.bloomPing0,
      [targets.bloom0.width, targets.bloom0.height],
      1,
      0,
      1,
      -1,
      knee,
      radius
    );
    drawBloomStep(
      targets.bloomPing0,
      targets.bloom0,
      [targets.bloomPing0.width, targets.bloomPing0.height],
      0,
      1,
      1,
      -1,
      knee,
      radius
    );
    drawBloomStep(
      targets.bloom0,
      targets.bloom1,
      [targets.bloom0.width, targets.bloom0.height],
      0,
      0,
      0,
      -1,
      knee,
      radius
    );
    drawBloomStep(
      targets.bloom1,
      targets.bloomPing1,
      [targets.bloom1.width, targets.bloom1.height],
      1,
      0,
      1,
      -1,
      knee,
      radius
    );
    drawBloomStep(
      targets.bloomPing1,
      targets.bloom1,
      [targets.bloomPing1.width, targets.bloomPing1.height],
      0,
      1,
      1,
      -1,
      knee,
      radius
    );
    drawBloomStep(
      targets.bloom1,
      targets.bloom2,
      [targets.bloom1.width, targets.bloom1.height],
      0,
      0,
      0,
      -1,
      knee,
      radius
    );
    drawBloomStep(
      targets.bloom2,
      targets.bloomPing2,
      [targets.bloom2.width, targets.bloom2.height],
      1,
      0,
      1,
      -1,
      knee,
      radius
    );
    drawBloomStep(
      targets.bloomPing2,
      targets.bloom2,
      [targets.bloomPing2.width, targets.bloomPing2.height],
      0,
      1,
      1,
      -1,
      knee,
      radius
    );

    const composite = programs.composite;
    const aspect = targets.scene.width / Math.max(targets.scene.height, 1);
    gl.useProgram(composite.program);
    gl.uniform4f(
      composite.uniforms.uParams,
      Math.max(0, settings.bloom.strength),
      p,
      waveCenterX,
      transitioning ? 1 : 0
    );
    gl.uniform4f(composite.uniforms.uHole, curX, curY, aspect, animDirection);
    bindTexture(gl, 0, gl.TEXTURE_2D, targets.scene.colors[0], composite.uniforms.uScene);
    bindTexture(gl, 1, gl.TEXTURE_2D, targets.bloom0.colors[0], composite.uniforms.uBloomNear);
    bindTexture(gl, 2, gl.TEXTURE_2D, targets.bloom1.colors[0], composite.uniforms.uBloomMedium);
    bindTexture(gl, 3, gl.TEXTURE_2D, targets.bloom2.colors[0], composite.uniforms.uBloomFar);
    drawPass(gl, null, canvas.width, canvas.height);

    gl.bindVertexArray(null);
  }

  const applyResize = () => {
    resizeFrame = 0;
    const size = pendingSize;
    pendingSize = undefined;
    if (disposed || !size || !gl || !profile || !targets) return;
    try {
      applyResponsiveLayout();
      const nextWidth = Math.max(1, Math.round(size.width));
      const nextHeight = Math.max(1, Math.round(size.height));
      canvas.width = nextWidth;
      canvas.height = nextHeight;

      const previousTargets = targets;
      const nextTargets = createTargets(
        gl,
        [nextWidth, nextHeight],
        defaultHeroSettings(),
        isMobile,
        profile
      );
      targets = nextTargets;
      targetsIsMobile = isMobile;
      destroyTargets(gl, previousTargets);

      const primary = primarySlotForProgress(currentProgress);
      bakeSlot(primary);
      scheduleSecondaryBakes();

      if (!active && started) {
        submitFrame();
      }
    } catch (error) {
      handleFailure(error);
    }
  };

  const resize = (size: RenderSize) => {
    if (disposed || size.width <= 0 || size.height <= 0) return;
    const cssW = Math.round(size.width);
    const cssH = Math.round(size.height);
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

  const onContextLost = (event: Event) => {
    event.preventDefault();
    loop?.stop();
    loop = undefined;
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
    canvas.removeEventListener("webglcontextlost", onContextLost);
    if (gl) {
      if (targets) destroyTargets(gl, targets);
      if (noiseTex) gl.deleteTexture(noiseTex);
      if (vao) gl.deleteVertexArray(vao);
      if (programs) {
        gl.deleteProgram(programs.bake.program);
        gl.deleteProgram(programs.refine.program);
        gl.deleteProgram(programs.shade.program);
        gl.deleteProgram(programs.morph.program);
        gl.deleteProgram(programs.bloom.program);
        gl.deleteProgram(programs.composite.program);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  };

  const initialize = async () => {
    const context = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!context) {
      throw new Error("WebGL2 context unavailable.");
    }
    gl = context;
    canvas.addEventListener("webglcontextlost", onContextLost);

    profile = selectFormatProfile(gl);

    lastCssWidth = Math.max(1, Math.round(canvas.clientWidth));
    lastCssHeight = Math.max(1, Math.round(canvas.clientHeight));
    const width = Math.max(1, Math.round(lastCssWidth * renderDpr));
    const height = Math.max(1, Math.round(lastCssHeight * renderDpr));
    canvas.width = width;
    canvas.height = height;

    const vertShader = compileShader(
      gl,
      gl.VERTEX_SHADER,
      FULLSCREEN_VERTEX_GLSL
    );
    try {
      programs = {
        bake: compileProgram(gl, vertShader, BAKE_FRAGMENT_GLSL, [
          "uResolution",
          "uCamera0",
          "uCamera1",
        ]),
        refine: compileProgram(gl, vertShader, REFINE_FRAGMENT_GLSL, [
          "uResolution",
          "uCamera0",
          "uCamera1",
          "uGHit1",
          "uGSky",
        ]),
        shade: compileProgram(gl, vertShader, SHADE_FRAGMENT_GLSL, [
          "uShade0",
          "uShade1",
          "uDisk0",
          "uDisk1",
          "uDisk2",
          "uDisk3",
          "uStars0",
          "uStarsTwinkle",
          "uGHit1",
          "uGHit2",
          "uGSky",
          "uGView",
          "uGAa",
          "uGAaGeom",
          "uNoiseVolume",
        ]),
        morph: compileProgram(gl, vertShader, MORPH_FRAGMENT_GLSL, [
          "uFrameInfo",
          "uCurrentPose",
          "uSourceA",
          "uSourceB",
          "uCamera",
          "uStars0",
          "uStarsTwinkle",
          "uSceneA",
          "uSceneB",
        ]),
        bloom: compileProgram(gl, vertShader, BLOOM_FRAGMENT_GLSL, [
          "uSourceSize",
          "uDirection",
          "uParams",
          "uSource",
        ]),
        composite: compileProgram(gl, vertShader, COMPOSITE_FRAGMENT_GLSL, [
          "uParams",
          "uHole",
          "uScene",
          "uBloomNear",
          "uBloomMedium",
          "uBloomFar",
        ]),
      };
    } finally {
      gl.deleteShader(vertShader);
    }

    vao = gl.createVertexArray();
    noiseTex = gl.createTexture();
    if (!vao || !noiseTex) {
      throw new Error("WebGL2: failed to allocate base objects.");
    }
    const noiseData = buildNoiseVolume(NOISE_VOLUME_SIZE, 13);
    gl.bindTexture(gl.TEXTURE_3D, noiseTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage3D(
      gl.TEXTURE_3D,
      0,
      gl.R8,
      NOISE_VOLUME_SIZE,
      NOISE_VOLUME_SIZE,
      NOISE_VOLUME_SIZE,
      0,
      gl.RED,
      gl.UNSIGNED_BYTE,
      noiseData
    );
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.REPEAT);

    targets = createTargets(
      gl,
      [width, height],
      defaultHeroSettings(),
      isMobile,
      profile
    );

    const primary = primarySlotForProgress(currentProgress);
    gl.bindVertexArray(vao);
    bakeSlot(primary);
    submitFrame();

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

  const captureSnapshot = (destCanvas: HTMLCanvasElement | null): boolean => {
    if (disposed || !started || !destCanvas || !gl) return false;
    const width = canvas.width;
    const height = canvas.height;
    if (width <= 0 || height <= 0) return false;
    if (destCanvas.width !== width) destCanvas.width = width;
    if (destCanvas.height !== height) destCanvas.height = height;
    const ctx = destCanvas.getContext("2d");
    if (!ctx) return false;
    submitFrame();
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(canvas, 0, 0, width, height);
    return true;
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
      if (started && !active && gl) {
        submitFrame();
      }
      return;
    }

    if (!isMobile && targets) {
      bakeSlot(targets.dark);
      bakeSlot(targets.mid);
      bakeSlot(targets.light);
    }

    animStartProgress = currentProgress;
    animTargetProgress = nextTarget;
    animDirection = nextTarget > currentProgress ? 1 : -1;
    animStartAtMs = undefined;
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

  return { ready, setActive, setVariant, captureSnapshot, dispose };
}
