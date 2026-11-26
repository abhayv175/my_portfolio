import type { Effect, Frame, Gpu, Surface, Target } from "vgpu";

import bakeWgsl from "./bake.wgsl";
import bloomWgsl from "./bloom.wgsl";
import compositeWgsl from "./composite.wgsl";
import morphWgsl from "./morph.wgsl";
import {
  createNoiseVolume,
  NOISE_VOLUME_SIZE,
  noiseVolumeSampler,
} from "./noise-volume.mjs";
import refineWgsl from "./refine.wgsl";
import shadeWgsl from "./shade.wgsl";
import type { HeroSettings } from "./settings";

export type VgpuApi = typeof import("vgpu");
type Output = Surface | Target;
type NoiseVolume = ReturnType<typeof createNoiseVolume>;

export interface BakePose {
  centerX: number;
  centerY: number;
  cameraRoll: number;
}

export interface BakeSlot {
  gbuffer: Target;
  aa: Target;
  pose: BakePose;
  baked: boolean;
}

export interface Effects {
  bake: Effect;
  refine: Effect;
  shadeA: Effect;
  shadeB: Effect;
  morph: Effect;
  bloomExtract: Effect;
  bloomBlurH0: Effect;
  bloomBlurV0: Effect;
  bloomDown1: Effect;
  bloomBlurH1: Effect;
  bloomBlurV1: Effect;
  bloomDown2: Effect;
  bloomBlurH2: Effect;
  bloomBlurV2: Effect;
  composite: Effect;
  postSampler: GPUSampler;
  noiseVolume: NoiseVolume;
  noiseSampler: GPUSampler;
}

export interface Targets {
  dark: BakeSlot;
  mid?: BakeSlot;
  light?: BakeSlot;
  scene: Target;
  sceneA: Target;
  sceneB: Target;
  bloom0: Target;
  bloomPing0: Target;
  bloom1: Target;
  bloomPing1: Target;
  bloom2: Target;
  bloomPing2: Target;
}

export interface MorphFrameParams {
  progress: number;
  blend: number;
  swirlRad: number;
  waveCenterX: number;
  direction: number;
  currentCenterX: number;
  currentCenterY: number;
  currentRoll: number;
  sceneYaw: number;
  time: number;
  singleSource: boolean;
  transitioning: boolean;
  slotA: BakeSlot;
  slotB: BakeSlot;
}

const GBUFFER_FORMATS: readonly GPUTextureFormat[] = [
  "rg32float",
  "rg32float",
  "rgba16float",
  "rgba16float",
];
const AA_FORMATS: readonly GPUTextureFormat[] = ["rg8unorm", "rgba16float"];
const CLEAR: readonly [number, number, number, number] = [0, 0, 0, 1];

export function desktopPoses(settings: HeroSettings): {
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

export const MOBILE_POSE: BakePose = {
  centerX: 0,
  centerY: 0,
  cameraRoll: 0,
};

export function createEffects(vgpu: VgpuApi, gpu: Gpu): Effects {
  const postSampler = vgpu.sampler(gpu, {
    minFilter: "linear",
    magFilter: "linear",
  });
  const noiseSampler = noiseVolumeSampler(vgpu, gpu);
  return {
    bake: vgpu.effect(gpu, bakeWgsl, { label: "optimized-black-hole-bake" }),
    refine: vgpu.effect(gpu, refineWgsl, {
      label: "optimized-black-hole-refine",
    }),
    shadeA: vgpu.effect(gpu, shadeWgsl, {
      label: "optimized-black-hole-shade-a",
    }),
    shadeB: vgpu.effect(gpu, shadeWgsl, {
      label: "optimized-black-hole-shade-b",
    }),
    morph: vgpu.effect(gpu, morphWgsl, {
      label: "optimized-black-hole-morph",
    }),
    bloomExtract: vgpu.effect(gpu, bloomWgsl),
    bloomBlurH0: vgpu.effect(gpu, bloomWgsl),
    bloomBlurV0: vgpu.effect(gpu, bloomWgsl),
    bloomDown1: vgpu.effect(gpu, bloomWgsl),
    bloomBlurH1: vgpu.effect(gpu, bloomWgsl),
    bloomBlurV1: vgpu.effect(gpu, bloomWgsl),
    bloomDown2: vgpu.effect(gpu, bloomWgsl),
    bloomBlurH2: vgpu.effect(gpu, bloomWgsl),
    bloomBlurV2: vgpu.effect(gpu, bloomWgsl),
    composite: vgpu.effect(gpu, compositeWgsl),
    postSampler,
    noiseSampler,
    noiseVolume: createNoiseVolume(gpu, NOISE_VOLUME_SIZE),
  };
}

export function createTargets(
  vgpu: VgpuApi,
  gpu: Gpu,
  size: readonly [number, number],
  settings: HeroSettings,
  isMobile: boolean
): Targets {
  const full = normalizeSize(size),
    half = scaleSize(full, 2),
    quarter = scaleSize(full, 4),
    eighth = scaleSize(full, 8);
  const postTarget = (targetSize: readonly [number, number]) =>
    vgpu.target(gpu, {
      size: targetSize,
      colors: [{ format: "rgba16float" }],
    });
  const created: Target[] = [];
  const own = (value: Target) => {
    created.push(value);
    return value;
  };
  const createSlot = (pose: BakePose): BakeSlot => ({
    gbuffer: own(
      vgpu.target(gpu, {
        size: full,
        colors: GBUFFER_FORMATS.map((format) => ({ format })),
      })
    ),
    aa: own(
      vgpu.target(gpu, {
        size: full,
        colors: AA_FORMATS.map((format) => ({ format })),
      })
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
      scene: own(postTarget(full)),
      sceneA: own(postTarget(full)),
      sceneB: own(postTarget(full)),
      bloom0: own(postTarget(half)),
      bloomPing0: own(postTarget(half)),
      bloom1: own(postTarget(quarter)),
      bloomPing1: own(postTarget(quarter)),
      bloom2: own(postTarget(eighth)),
      bloomPing2: own(postTarget(eighth)),
    };
  } catch (error) {
    try {
      destroyTargetList(created.reverse());
    } catch {
      // The allocation failure remains the primary error.
    }
    throw error;
  }
}

export function destroyTargets(targets: Targets): void {
  const list: Target[] = [
    targets.dark.gbuffer,
    targets.dark.aa,
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
  if (targets.mid) {
    list.push(targets.mid.gbuffer, targets.mid.aa);
  }
  if (targets.light) {
    list.push(targets.light.gbuffer, targets.light.aa);
  }
  destroyTargetList(list);
}

function destroyTargetList(values: readonly Target[]): void {
  let failed = false;
  let failure: unknown;
  for (const value of values) {
    try {
      destroyTarget(value);
    } catch (error) {
      if (!failed) failure = error;
      failed = true;
    }
  }
  if (failed) throw failure;
}

function destroyTarget(value: Target | undefined): void {
  (value as { destroy?: () => void } | undefined)?.destroy?.();
}

function geometryForPose(
  resolution: readonly [number, number],
  settings: HeroSettings,
  pose: BakePose
) {
  return {
    resolution,
    yaw: 0,
    pitch: settings.cameraY,
    orbitRadius: settings.distance,
    diskOuter: settings.diskRadius,
    fov: settings.fov,
    centerX: pose.centerX,
    centerY: pose.centerY,
    roll: pose.cameraRoll,
  };
}

export function bindShadeSlot(
  effect: Effect,
  effects: Effects,
  _targets: Targets,
  slot: BakeSlot
): void {
  const [hit1, hit2, sky, view] = slot.gbuffer.colors;
  const [aa, aaGeom] = slot.aa.colors;
  effect.set({
    gHit1: hit1,
    gHit2: hit2,
    gSky: sky,
    gView: view,
    gAa: aa,
    gAaGeom: aaGeom,
    noiseVolume: effects.noiseVolume,
    noiseSampler: effects.noiseSampler,
  });
}

export function setBindings(effects: Effects, targets: Targets): void {
  const [hit1, hit2, sky, view] = targets.dark.gbuffer.colors;
  const [aa, aaGeom] = targets.dark.aa.colors;
  effects.refine.set({
    gHit1: hit1,
    gSky: sky,
  });
  const initShade = (effect: Effect) => {
    effect.set({
      gHit1: hit1,
      gHit2: hit2,
      gSky: sky,
      gView: view,
      gAa: aa,
      gAaGeom: aaGeom,
      noiseVolume: effects.noiseVolume,
      noiseSampler: effects.noiseSampler,
    });
  };
  initShade(effects.shadeA);
  initShade(effects.shadeB);

  const scene = targets.scene.colors[0]!,
    sceneA = targets.sceneA.colors[0]!,
    sceneB = targets.sceneB.colors[0]!,
    bloom0 = targets.bloom0.colors[0]!,
    bloomPing0 = targets.bloomPing0.colors[0]!,
    bloom1 = targets.bloom1.colors[0]!,
    bloomPing1 = targets.bloomPing1.colors[0]!,
    bloom2 = targets.bloom2.colors[0]!,
    bloomPing2 = targets.bloomPing2.colors[0]!;

  effects.morph.set({
    sceneA,
    sceneB,
    linearSampler: effects.postSampler,
  });

  effects.bloomExtract.set({
    source: scene,
    linearSampler: effects.postSampler,
  });
  effects.bloomBlurH0.set({
    source: bloom0,
    linearSampler: effects.postSampler,
  });
  effects.bloomBlurV0.set({
    source: bloomPing0,
    linearSampler: effects.postSampler,
  });
  effects.bloomDown1.set({
    source: bloom0,
    linearSampler: effects.postSampler,
  });
  effects.bloomBlurH1.set({
    source: bloom1,
    linearSampler: effects.postSampler,
  });
  effects.bloomBlurV1.set({
    source: bloomPing1,
    linearSampler: effects.postSampler,
  });
  effects.bloomDown2.set({
    source: bloom1,
    linearSampler: effects.postSampler,
  });
  effects.bloomBlurH2.set({
    source: bloom2,
    linearSampler: effects.postSampler,
  });
  effects.bloomBlurV2.set({
    source: bloomPing2,
    linearSampler: effects.postSampler,
  });
  effects.composite.set({
    scene,
    bloomNear: bloom0,
    bloomMedium: bloom1,
    bloomFar: bloom2,
    linearSampler: effects.postSampler,
  });
}

export function setBakeSlotUniforms(
  effects: Effects,
  slot: BakeSlot,
  settings: HeroSettings
): void {
  const [hit1, , sky] = slot.gbuffer.colors;
  const geometry = geometryForPose(slot.gbuffer.size, settings, slot.pose);
  effects.bake.set({ bake: geometry });
  effects.refine.set({
    gHit1: hit1,
    gSky: sky,
    refine: geometry,
  });
}

export function bakeSlotPass(
  frame: Frame,
  effects: Effects,
  slot: BakeSlot
): void {
  frame.pass({ target: slot.gbuffer, clear: CLEAR }, (pass) =>
    pass.draw(effects.bake)
  );
  frame.pass({ target: slot.aa, clear: CLEAR }, (pass) =>
    pass.draw(effects.refine)
  );
}

export function setShadeUniforms(
  effects: Effects,
  targets: Targets,
  settings: HeroSettings,
  time: number,
  sceneYaw: number
): void {
  const payload = {
    shade: {
      resolution: targets.dark.gbuffer.size,
      time,
      diskOuter: settings.diskRadius,
      sceneYaw,
      centerFade: settings.centerFade,
    },
    disk: settings.disk,
    stars: settings.stars,
  };
  effects.shadeA.set(payload);
  effects.shadeB.set(payload);
}

export function setMorphUniforms(
  effects: Effects,
  targets: Targets,
  settings: HeroSettings,
  params: MorphFrameParams
): void {
  effects.morph.set({
    morph: {
      frameInfo: [
        targets.scene.size[0],
        targets.scene.size[1],
        params.blend,
        params.swirlRad,
      ],
      currentPose: [
        params.currentCenterX,
        params.currentCenterY,
        params.currentRoll,
        params.sceneYaw,
      ],
      sourceA: [
        params.slotA.pose.centerX,
        params.slotA.pose.centerY,
        params.slotA.pose.cameraRoll,
        params.time,
      ],
      sourceB: [
        params.slotB.pose.centerX,
        params.slotB.pose.centerY,
        params.slotB.pose.cameraRoll,
        settings.cameraY,
      ],
      camera: [
        settings.distance,
        settings.fov,
        1.0,
        params.singleSource ? 1 : 0,
      ],
    },
    stars: settings.stars,
  });
}

export function setPostUniforms(
  effects: Effects,
  targets: Targets,
  settings: HeroSettings,
  morph?: MorphFrameParams
): void {
  const threshold = Math.max(0, settings.bloom.threshold),
    knee = Math.max(0.0001, settings.bloom.knee),
    radius = Math.max(0.1, settings.bloom.radius);
  const downsample = (
    sourceSize: readonly [number, number],
    applyThreshold: boolean
  ) => ({
    sourceSize,
    direction: [0, 0],
    params: [applyThreshold ? threshold : -1, knee, radius, 0],
  });
  const blur = (
    sourceSize: readonly [number, number],
    x: number,
    y: number
  ) => ({
    sourceSize,
    direction: [x, y],
    params: [-1, knee, radius, 1],
  });
  effects.bloomExtract.set({ bloom: downsample(targets.scene.size, true) });
  effects.bloomBlurH0.set({ bloom: blur(targets.bloom0.size, 1, 0) });
  effects.bloomBlurV0.set({ bloom: blur(targets.bloomPing0.size, 0, 1) });
  effects.bloomDown1.set({ bloom: downsample(targets.bloom0.size, false) });
  effects.bloomBlurH1.set({ bloom: blur(targets.bloom1.size, 1, 0) });
  effects.bloomBlurV1.set({ bloom: blur(targets.bloomPing1.size, 0, 1) });
  effects.bloomDown2.set({ bloom: downsample(targets.bloom1.size, false) });
  effects.bloomBlurH2.set({ bloom: blur(targets.bloom2.size, 1, 0) });
  effects.bloomBlurV2.set({ bloom: blur(targets.bloomPing2.size, 0, 1) });
  setMorphUniforms(effects, targets, settings, {
    progress: settings.invert,
    blend: 0,
    swirlRad: 0,
    waveCenterX: settings.invert > 0.5 ? -1.55 : 1.55,
    direction: 1,
    currentCenterX: settings.centerX,
    currentCenterY: settings.centerY,
    currentRoll: settings.cameraRoll,
    sceneYaw: 0,
    time: 0,
    singleSource: !targets.mid,
    transitioning: false,
    slotA: targets.dark,
    slotB: targets.dark,
  });
  updateCompositeUniforms(effects, targets, settings, morph);
}

export function updateCompositeUniforms(
  effects: Effects,
  targets: Targets,
  settings: HeroSettings,
  morph?: MorphFrameParams
): void {
  const aspect =
    targets.scene.size[0] / Math.max(targets.scene.size[1], 1);
  const progress = morph ? morph.progress : settings.invert;
  const waveCenterX = morph ? morph.waveCenterX : progress > 0.5 ? -1.55 : 1.55;
  const transitioning = morph?.transitioning ? 1 : 0;
  const curX = morph ? morph.currentCenterX : settings.centerX;
  const curY = morph ? morph.currentCenterY : settings.centerY;
  const direction = morph ? morph.direction : 1;

  effects.composite.set({
    composite: {
      params: [
        Math.max(0, settings.bloom.strength),
        progress,
        waveCenterX,
        transitioning,
      ],
      hole: [curX, curY, aspect, direction],
    },
  });
}

export async function prewarmInitial(
  effects: Effects,
  targets: Targets,
  output: Output
): Promise<void> {
  const bloomOutput = { colors: [targets.bloom0.format] };
  await Promise.all([
    effects.bake.compile(targets.dark.gbuffer),
    effects.refine.compile(targets.dark.aa),
    effects.shadeA.compile(targets.scene),
    effects.bloomExtract.compile(bloomOutput),
    effects.bloomBlurH0.compile(bloomOutput),
    effects.bloomBlurV0.compile(bloomOutput),
    effects.bloomDown1.compile(bloomOutput),
    effects.bloomBlurH1.compile(bloomOutput),
    effects.bloomBlurV1.compile(bloomOutput),
    effects.bloomDown2.compile(bloomOutput),
    effects.bloomBlurH2.compile(bloomOutput),
    effects.bloomBlurV2.compile(bloomOutput),
    effects.composite.compile({ colors: [output.format] }),
  ]);
}

export async function prewarmTransition(
  effects: Effects,
  targets: Targets
): Promise<void> {
  await Promise.all([
    effects.shadeB.compile(targets.sceneB),
    effects.morph.compile(targets.scene),
  ]);
}

export function renderChain(
  frame: Frame,
  effects: Effects,
  targets: Targets,
  output: Output,
  transitioning: boolean,
  singleSource: boolean
): void {
  if (!transitioning) {
    frame.pass({ target: targets.scene, clear: CLEAR }, (pass) =>
      pass.draw(effects.shadeA)
    );
  } else if (singleSource) {
    frame.pass({ target: targets.sceneA, clear: CLEAR }, (pass) =>
      pass.draw(effects.shadeA)
    );
    frame.pass({ target: targets.scene, clear: CLEAR }, (pass) =>
      pass.draw(effects.morph)
    );
  } else {
    frame.pass({ target: targets.sceneA, clear: CLEAR }, (pass) =>
      pass.draw(effects.shadeA)
    );
    frame.pass({ target: targets.sceneB, clear: CLEAR }, (pass) =>
      pass.draw(effects.shadeB)
    );
    frame.pass({ target: targets.scene, clear: CLEAR }, (pass) =>
      pass.draw(effects.morph)
    );
  }

  frame.pass({ target: targets.bloom0, clear: CLEAR }, (pass) =>
    pass.draw(effects.bloomExtract)
  );
  frame.pass({ target: targets.bloomPing0, clear: CLEAR }, (pass) =>
    pass.draw(effects.bloomBlurH0)
  );
  frame.pass({ target: targets.bloom0, clear: CLEAR }, (pass) =>
    pass.draw(effects.bloomBlurV0)
  );
  frame.pass({ target: targets.bloom1, clear: CLEAR }, (pass) =>
    pass.draw(effects.bloomDown1)
  );
  frame.pass({ target: targets.bloomPing1, clear: CLEAR }, (pass) =>
    pass.draw(effects.bloomBlurH1)
  );
  frame.pass({ target: targets.bloom1, clear: CLEAR }, (pass) =>
    pass.draw(effects.bloomBlurV1)
  );
  frame.pass({ target: targets.bloom2, clear: CLEAR }, (pass) =>
    pass.draw(effects.bloomDown2)
  );
  frame.pass({ target: targets.bloomPing2, clear: CLEAR }, (pass) =>
    pass.draw(effects.bloomBlurH2)
  );
  frame.pass({ target: targets.bloom2, clear: CLEAR }, (pass) =>
    pass.draw(effects.bloomBlurV2)
  );
  frame.pass({ target: output, clear: CLEAR }, (pass) =>
    pass.draw(effects.composite)
  );
}

function normalizeSize(size: readonly [number, number]): [number, number] {
  return [Math.max(1, Math.floor(size[0])), Math.max(1, Math.floor(size[1]))];
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
