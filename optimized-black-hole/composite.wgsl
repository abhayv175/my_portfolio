// Combine bloom levels, tone map, vignette, and convert to display output.

struct Composite {
  // x: bloomStrength, y: progress (0 = dark, 1 = light), z: waveCenterX (NDC), w: transitioning (0 or 1)
  params: vec4f,
  // x: curHoleCenterX (NDC), y: curHoleCenterY (NDC), z: aspect, w: direction (+1 to light, -1 to dark)
  hole: vec4f,
}

@group(0) @binding(0) var<uniform> composite: Composite;
@group(0) @binding(1) var scene: texture_2d<f32>;
@group(0) @binding(2) var bloomNear: texture_2d<f32>;
@group(0) @binding(3) var bloomMedium: texture_2d<f32>;
@group(0) @binding(4) var bloomFar: texture_2d<f32>;
@group(0) @binding(5) var linearSampler: sampler;

const EXPOSURE: f32 = 1.15;
const SATURATION: f32 = 0.0;

fn aces(x: vec3f) -> vec3f {
  let a = 2.51;
  let b = 0.03;
  let c = 2.43;
  let d = 0.59;
  let e = 0.14;
  return clamp((x * (a * x + vec3f(b))) / (x * (c * x + vec3f(d)) + vec3f(e)), vec3f(0.0), vec3f(1.0));
}

fn tonemap(linearColor: vec3f, uv: vec2f, invert: f32) -> vec3f {
  var color = aces(linearColor * EXPOSURE);

  let centered = uv - vec2f(0.5);
  let vignette = 1.0 - smoothstep(0.55, 1.15, length(centered) * 1.6);
  // Skip edge darkening when inverted so white space stays pure white at screen edges
  color *= mix(mix(0.72, 1.0, vignette), 1.0, invert);

  color = pow(color, vec3f(1.0 / 2.2));
  let luma = dot(color, vec3f(0.2126, 0.7152, 0.0722));
  return mix(vec3f(luma), color, SATURATION);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let sceneColor = textureSample(scene, linearSampler, uv).rgb;
  let bloom =
    textureSample(bloomNear, linearSampler, uv).rgb * 0.50 +
    textureSample(bloomMedium, linearSampler, uv).rgb * 0.32 +
    textureSample(bloomFar, linearSampler, uv).rgb * 0.18;
  let hdr = sceneColor + bloom * composite.params.x;

  let progress = clamp(composite.params.y, 0.0, 1.0);
  var localInvert = progress;
  var waveCrest = 0.0;

  if (composite.params.w > 0.5) {
    let ndc = vec2f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0);
    let aspect = max(composite.hole.z, 0.1);
    let dHole = vec2f((ndc.x - composite.hole.x) * aspect, ndc.y - composite.hole.y);
    let rHole = length(dHole);
    let angHole = atan2(dHole.y, dHole.x);
    let dir = composite.hole.w;

    // Swirling gravitational wavefront synced across the moving Black/White Hole center
    let swirlWarp =
      0.15 * sin(ndc.y * 2.1 - dir * progress * 3.14159265) +
      0.13 * sin(angHole * 2.0 + dir * progress * 5.2) * exp(-rHole * 0.95);
    let signedDist = ndc.x - (composite.params.z + swirlWarp);
    let bandHalfWidth = 0.18;
    localInvert = smoothstep(-bandHalfWidth, bandHalfWidth, signedDist);
    waveCrest = 4.0 * localInvert * (1.0 - localInvert);
  }

  let mapped = tonemap(hdr, uv, localInvert);
  var output = mix(mapped, vec3f(1.0) - mapped, localInvert);
  // Subtle luminous silver horizon sheen right on the wave boundary so crossover never goes dull gray
  output = clamp(output + vec3f(0.22 * waveCrest), vec3f(0.0), vec3f(1.0));
  return vec4f(output, 1.0);
}
