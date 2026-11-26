// Real-time 60 FPS flight and swirl morph across pre-baked HDR scene layers.

import { cameraRay } from "./geodesic.wgsl";
import { StarLook, shadeStars } from "./stars.wgsl";

struct Morph {
  // x: resolution.x, y: resolution.y, z: blend (0 = A, 1 = B), w: swirlRad
  frameInfo: vec4f,
  // x: curCenterX, y: curCenterY, z: curRoll, w: sceneYaw
  currentPose: vec4f,
  // x: centerAX, y: centerAY, z: rollA, w: time
  sourceA: vec4f,
  // x: centerBX, y: centerBY, z: rollB, w: cameraPitch
  sourceB: vec4f,
  // x: orbitRadius, y: fov, z: zoom, w: singleSource (0 = dual A+B, 1 = mobile single-source)
  camera: vec4f,
}

@group(0) @binding(0) var<uniform> morph: Morph;
@group(0) @binding(1) var sceneA: texture_2d<f32>;
@group(0) @binding(2) var sceneB: texture_2d<f32>;
@group(0) @binding(3) var linearSampler: sampler;
@group(0) @binding(4) var<uniform> stars: StarLook;

fn rot2(v: vec2f, angle: f32) -> vec2f {
  let c = cos(angle);
  let s = sin(angle);
  return vec2f(v.x * c - v.y * s, v.x * s + v.y * c);
}

fn rotateY(v: vec3f, angle: f32) -> vec3f {
  let c = cos(angle);
  let s = sin(angle);
  return vec3f(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
}

fn boundsWeight(uvCoord: vec2f) -> f32 {
  let margin = min(min(uvCoord.x, 1.0 - uvCoord.x), min(uvCoord.y, 1.0 - uvCoord.y));
  return smoothstep(0.0, 0.025, margin);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let resolution = morph.frameInfo.xy;
  let aspect = resolution.x / max(resolution.y, 1.0);
  let ndc = vec2f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0);

  // Compute screen-plane offset relative to the moving hole core
  var localScreen = (ndc - morph.currentPose.xy) * vec2f(aspect, 1.0);
  localScreen /= max(morph.camera.z, 0.25);

  // Subtle gravitational vortex swirl peaking mid-flight while keeping the inner ring clean
  let radius = length(localScreen);
  let twistProfile = smoothstep(0.20, 0.85, radius) * (1.0 - smoothstep(1.35, 2.6, radius));
  localScreen = rot2(localScreen, morph.frameInfo.w * twistProfile);

  // Transform into baked source A and source B coordinates
  let planeA = rot2(localScreen, morph.currentPose.z - morph.sourceA.z);
  let ndcA = morph.sourceA.xy + planeA / vec2f(aspect, 1.0);
  let uvA = vec2f((ndcA.x + 1.0) * 0.5, (1.0 - ndcA.y) * 0.5);

  let planeB = rot2(localScreen, morph.currentPose.z - morph.sourceB.z);
  let ndcB = morph.sourceB.xy + planeB / vec2f(aspect, 1.0);
  let uvB = vec2f((ndcB.x + 1.0) * 0.5, (1.0 - ndcB.y) * 0.5);

  let colorA = textureSample(sceneA, linearSampler, clamp(uvA, vec2f(0.001), vec2f(0.999))).rgb;
  let colorB = textureSample(sceneB, linearSampler, clamp(uvB, vec2f(0.001), vec2f(0.999))).rgb;

  // Seamless procedural sky stars if extreme tilted corners briefly step outside source bounds
  let curRay = cameraRay(
    uv,
    resolution,
    0.0,
    morph.sourceB.w,
    morph.camera.x,
    morph.camera.y,
    morph.currentPose.x,
    morph.currentPose.y,
    morph.currentPose.z,
  );
  let skyDdx = dpdx(curRay.velocity);
  let skyDdy = dpdy(curRay.velocity);
  let starDir = rotateY(curRay.velocity, -morph.currentPose.w);
  let fallbackStars = shadeStars(
    starDir,
    stars,
    morph.sourceA.w,
    rotateY(skyDdx, -morph.currentPose.w),
    rotateY(skyDdy, -morph.currentPose.w),
  );

  // Mobile or centered single-source path uses sceneA directly with vortex swirl
  if (morph.camera.w > 0.5) {
    let cover = boundsWeight(uvA);
    return vec4f(mix(fallbackStars, colorA, cover), 1.0);
  }

  let blend = clamp(morph.frameInfo.z, 0.0, 1.0);
  let boundA = boundsWeight(uvA);
  let boundB = boundsWeight(uvB);
  let wA = (1.0 - blend) * boundA;
  let wB = blend * boundB;
  let wSum = wA + wB;

  var color = fallbackStars;
  if (wSum > 0.0001) {
    let blendedScene = (colorA * wA + colorB * wB) / wSum;
    let cover = clamp(wSum * 6.0, 0.0, 1.0);
    color = mix(fallbackStars, blendedScene, cover);
  }
  return vec4f(color, 1.0);
}
