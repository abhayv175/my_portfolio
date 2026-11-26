// GLSL ES 3.00 translations of the black/white-hole shader passes for WebGL 2 fallback devices.

export const FULLSCREEN_VERTEX_GLSL = `#version 300 es
precision highp float;
out vec2 vGlUv;
void main() {
  vec2 pos = vec2(
    gl_VertexID == 1 ? 3.0 : -1.0,
    gl_VertexID == 2 ? 3.0 : -1.0
  );
  vGlUv = pos * 0.5 + 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

const COMMON_GLSL = `
const float HORIZON = 1.0;
const float ISCO = 3.0;
const float TAU = 6.28318530718;
const float PI_CONST = 3.14159265359;

float safePow(float x, float y) {
  return x <= 0.0 ? 0.0 : pow(x, y);
}

vec3 safePow3(vec3 v, float y) {
  return vec3(safePow(v.r, y), safePow(v.g, y), safePow(v.b, y));
}

mat2 makeMat2(vec2 c0, vec2 c1) {
  return mat2(c0.x, c0.y, c1.x, c1.y);
}
`;

const GEODESIC_GLSL = `
const int MAX_STEPS = 768;

struct TraceResult {
  vec2 hit1Plane;
  vec2 hit1Direction;
  vec2 hit2Plane;
  vec2 hit2Direction;
  int hitCount;
  float swallowed;
  float escaped;
  vec3 finalVelocity;
};

struct CameraRay {
  vec3 position;
  vec3 velocity;
};

float escapeRadiusFor(float orbitRadius) {
  return max(120.0, orbitRadius + 8.0);
}

vec2 encodeDirection(vec3 direction) {
  return vec2(direction.y, atan(direction.z, direction.x));
}

vec3 geodesicAcceleration(vec3 position, vec3 velocity) {
  float r2 = max(dot(position, position), 0.0001);
  vec3 angularMomentum = cross(position, velocity);
  float h2 = dot(angularMomentum, angularMomentum);
  return -1.5 * h2 * position / (r2 * r2 * sqrt(r2));
}

CameraRay cameraRay(
  vec2 uvTop,
  vec2 resolution,
  float yaw,
  float pitch,
  float orbitRadius,
  float fov,
  float centerX,
  float centerY,
  float roll
) {
  float aspect = resolution.x / max(resolution.y, 1.0);
  vec2 ndc = vec2(uvTop.x * 2.0 - 1.0, 1.0 - uvTop.y * 2.0);
  vec2 screenPlane = (ndc - vec2(centerX, centerY)) * vec2(aspect, 1.0);
  float cosine = cos(roll);
  float sine = sin(roll);
  vec2 screen = vec2(
    screenPlane.x * cosine - screenPlane.y * sine,
    screenPlane.x * sine + screenPlane.y * cosine
  );

  float clampedPitch = clamp(pitch, -1.319, 1.319);
  vec3 cameraPosition = vec3(
    sin(yaw) * cos(clampedPitch) * orbitRadius,
    sin(clampedPitch) * orbitRadius,
    cos(yaw) * cos(clampedPitch) * orbitRadius
  );
  vec3 forward = normalize(vec3(0.0) - cameraPosition);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, forward);

  CameraRay ray;
  ray.position = cameraPosition;
  ray.velocity = normalize(forward * fov + right * screen.x + up * screen.y);
  return ray;
}

TraceResult traceRay(vec3 cameraPosition, vec3 initialVelocity, float diskOuter, float escapeRadius) {
  vec3 position = cameraPosition;
  vec3 velocity = initialVelocity;

  TraceResult result;
  result.hit1Plane = vec2(0.0);
  result.hit1Direction = vec2(0.0);
  result.hit2Plane = vec2(0.0);
  result.hit2Direction = vec2(0.0);
  result.hitCount = 0;
  result.swallowed = 0.0;
  result.escaped = 0.0;

  for (int stepIndex = 0; stepIndex < MAX_STEPS; stepIndex++) {
    float radius = length(position);
    if (radius < HORIZON * 1.004) {
      result.swallowed = 1.0;
      break;
    }
    if (radius > escapeRadius && dot(position, velocity) > 0.0) {
      result.escaped = 1.0;
      break;
    }

    float stepSize = clamp((radius - HORIZON) * 0.035, 0.0045, 0.075 * max(1.0, radius / 6.0));

    vec3 previousPosition = position;
    vec3 previousVelocity = velocity;

    vec3 acceleration0 = geodesicAcceleration(position, velocity);
    velocity += acceleration0 * (0.5 * stepSize);
    position += velocity * stepSize;
    vec3 acceleration1 = geodesicAcceleration(position, velocity);
    velocity += acceleration1 * (0.5 * stepSize);
    velocity = normalize(velocity);

    if (result.hitCount < 2) {
      float previousSide = previousPosition.y >= 0.0 ? 1.0 : -1.0;
      float currentSide = position.y >= 0.0 ? 1.0 : -1.0;
      if (previousSide != currentSide) {
        float t = clamp(previousPosition.y / (previousPosition.y - position.y), 0.0, 1.0);
        vec3 crossing = mix(previousPosition, position, t);
        float planeRadius = length(crossing.xz);
        if (planeRadius >= ISCO && planeRadius <= diskOuter) {
          vec2 direction = encodeDirection(normalize(mix(previousVelocity, velocity, t)));
          if (result.hitCount == 0) {
            result.hit1Plane = crossing.xz;
            result.hit1Direction = direction;
          } else {
            result.hit2Plane = crossing.xz;
            result.hit2Direction = direction;
          }
          result.hitCount += 1;
        }
      }
    }
  }

  result.finalVelocity = velocity;
  return result;
}
`;

const STARS_GLSL = `
const float STAR_INTENSITY = 1.9;
const float ANCHOR_CELLS = 36.0;
const float ANCHOR_FILL = 0.75;
const float ANCHOR_RADIUS = 0.00110;
const float ANCHOR_PEAK = 1.0;
const float FIELD_CELLS = 93.0;
const float FIELD_FILL = 0.75;
const float FIELD_RADIUS = 0.00070;
const float FIELD_PEAK = 0.45;
const float DUST_CELLS = 151.0;
const float DUST_FILL = 0.75;
const float DUST_RADIUS = 0.00040;
const float DUST_PEAK = 0.22;
const float COUNT_SLOPE = 2.0;
const float STAR_FLUX_AREA = 0.5385;
const float MAX_PREFILTER_PIXELS = 4.0;
const vec3 STAR_WARM = vec3(1.1741, 0.9745, 0.7397);
const vec3 STAR_COOL = vec3(0.8954, 1.0131, 1.1781);

uvec3 pcg3d(uvec3 value) {
  uvec3 hashed = value * 1664525u + 1013904223u;
  hashed.x = hashed.x + hashed.y * hashed.z;
  hashed.y = hashed.y + hashed.z * hashed.x;
  hashed.z = hashed.z + hashed.x * hashed.y;
  hashed = hashed ^ (hashed >> uvec3(16u));
  hashed.x = hashed.x + hashed.y * hashed.z;
  hashed.y = hashed.y + hashed.z * hashed.x;
  hashed.z = hashed.z + hashed.x * hashed.y;
  hashed = hashed ^ (hashed >> uvec3(16u));
  return hashed;
}

float unitFloat(uint hash) {
  return float(hash >> 8u) * (1.0 / 16777216.0);
}

struct StarLook {
  float brightness;
  float density;
  float contrast;
  float warmth;
  float twinkle;
};

vec3 faceCoords(vec3 direction) {
  vec3 magnitude = abs(direction);
  if (magnitude.x >= magnitude.y && magnitude.x >= magnitude.z) {
    return vec3(direction.yz / magnitude.x, direction.x > 0.0 ? 0.0 : 1.0);
  }
  if (magnitude.y >= magnitude.z) {
    return vec3(direction.xz / magnitude.y, direction.y > 0.0 ? 2.0 : 3.0);
  }
  return vec3(direction.xy / magnitude.z, direction.z > 0.0 ? 4.0 : 5.0);
}

vec2 faceProject(vec3 direction, int axis) {
  if (axis == 0) {
    return direction.yz / abs(direction.x);
  }
  if (axis == 1) {
    return direction.xz / abs(direction.y);
  }
  return direction.xy / abs(direction.z);
}

struct SkyFilter {
  mat2 inverseJacobian;
  float pixelsPerFace;
  float faceMajor;
};

SkyFilter skyFilter(vec3 direction, int axis, vec3 ddx, vec3 ddy) {
  vec2 base = faceProject(direction, axis);
  vec2 jx = faceProject(direction + ddx, axis) - base;
  vec2 jy = faceProject(direction + ddy, axis) - base;

  float determinant = jx.x * jy.y - jx.y * jy.x;
  float safeDeterminant = abs(determinant) < 1.0e-24 ? 1.0e-24 : determinant;
  mat2 inverseMat = makeMat2(vec2(jy.y, -jx.y), vec2(-jy.x, jx.x)) * (1.0 / safeDeterminant);

  SkyFilter prefilter;
  prefilter.inverseJacobian = inverseMat;
  prefilter.pixelsPerFace = 1.0 / sqrt(max(abs(determinant), 1.0e-24));
  prefilter.faceMajor = max(length(jx), length(jy));
  return prefilter;
}

struct SkyState {
  float brightness;
  float rangePower;
  float meanFlux;
  float warmth;
  float twinkle;
  float time;
  float fillScale;
  float radiusScale;
};

SkyState resolveSky(StarLook look, vec2 face, float time) {
  float range = clamp(look.contrast, 1.0, 512.0);
  float rangePower = range * range;
  float compression = 1.0 + dot(face, face);
  float root = sqrt(compression);

  SkyState sky;
  sky.brightness = max(0.0, look.brightness) * STAR_INTENSITY;
  sky.rangePower = rangePower;
  sky.meanFlux = COUNT_SLOPE / (range + COUNT_SLOPE - 1.0);
  sky.warmth = clamp(look.warmth, 0.0, 1.0);
  sky.twinkle = clamp(look.twinkle, 0.0, 1.0);
  sky.time = time;
  sky.fillScale = max(0.0, look.density) / (compression * root);
  sky.radiusScale = sqrt(compression * root);
  return sky;
}

struct Species {
  float cells;
  float fill;
  float peak;
  float faceRadius;
  float radiusPixels;
  float gain;
};

Species resolveSpecies(
  float cells,
  float fill,
  float peak,
  float angularRadius,
  SkyState sky,
  SkyFilter prefilter
) {
  float faceRadius = angularRadius * sky.radiusScale;
  float starPixels = faceRadius * prefilter.pixelsPerFace;

  Species species;
  species.cells = cells;
  species.fill = clamp(fill * sky.fillScale, 0.0, 1.0);
  species.peak = peak * sky.brightness;
  species.faceRadius = faceRadius;
  species.radiusPixels = clamp(starPixels, 1.0, MAX_PREFILTER_PIXELS);
  species.gain = min(1.0, starPixels * starPixels);
  return species;
}

vec3 starPoint(
  vec2 cell,
  vec2 grid,
  int faceIndex,
  int seed,
  Species species,
  SkyState sky,
  SkyFilter prefilter
) {
  uvec3 hashed = pcg3d(uvec3(ivec3(ivec2(cell), faceIndex * 131 + seed)));
  float presence = unitFloat(hashed.x);
  if (presence > species.fill) {
    return vec3(0.0);
  }

  vec2 jitter = vec2(unitFloat(hashed.y), unitFloat(hashed.z)) - vec2(0.5);
  vec2 center = cell + vec2(0.5) + jitter * 0.8;
  vec2 offsetPixels = prefilter.inverseJacobian * ((grid - center) / species.cells);
  float falloff = 1.0 - smoothstep(0.0, species.radiusPixels, length(offsetPixels));

  float uniform01 = presence / max(species.fill, 1.0e-6);
  float flux = inversesqrt(1.0 + uniform01 * (sky.rangePower - 1.0));

  vec3 tint = mix(vec3(1.0), mix(STAR_WARM, STAR_COOL, unitFloat(hashed.y ^ hashed.z)), sky.warmth);

  float phase = unitFloat(hashed.y) * 6.2831853;
  float shimmer = 1.0 + sky.twinkle * 0.06 * sin(sky.time * (0.35 + unitFloat(hashed.z) * 0.4) + phase);
  return tint * (falloff * falloff * species.peak * flux * shimmer * species.gain);
}

vec3 starSpecies(vec3 face, int seed, Species species, SkyState sky, SkyFilter prefilter) {
  int faceIndex = int(face.z);
  vec2 grid = face.xy * species.cells;
  vec3 total = starPoint(floor(grid), grid, faceIndex, seed, species, sky, prefilter);

  float extent = species.faceRadius * species.cells;
  float mean = species.peak * sky.meanFlux * species.fill * STAR_FLUX_AREA * extent * extent;
  vec3 meanTint = mix(vec3(1.0), 0.5 * (STAR_WARM + STAR_COOL), sky.warmth);
  float cellsPerPixel = species.cells * prefilter.faceMajor;
  return mix(total, meanTint * mean, smoothstep(1.0, 3.0, cellsPerPixel));
}

vec3 shadeStars(vec3 direction, StarLook look, float time, vec3 ddx, vec3 ddy) {
  vec3 d = normalize(direction);
  vec3 face = faceCoords(d);
  SkyFilter prefilter = skyFilter(d, int(face.z) / 2, ddx, ddy);
  SkyState sky = resolveSky(look, face.xy, time);

  return starSpecies(
    face, 17,
    resolveSpecies(ANCHOR_CELLS, ANCHOR_FILL, ANCHOR_PEAK, ANCHOR_RADIUS, sky, prefilter),
    sky, prefilter
  ) + starSpecies(
    face, 71,
    resolveSpecies(FIELD_CELLS, FIELD_FILL, FIELD_PEAK, FIELD_RADIUS, sky, prefilter),
    sky, prefilter
  ) + starSpecies(
    face, 149,
    resolveSpecies(DUST_CELLS, DUST_FILL, DUST_PEAK, DUST_RADIUS, sky, prefilter),
    sky, prefilter
  );
}
`;

export const BAKE_FRAGMENT_GLSL = `#version 300 es
precision highp float;
precision highp int;
in vec2 vGlUv;

uniform vec2 uResolution;
uniform vec4 uCamera0; // x: yaw, y: pitch, z: orbitRadius, w: diskOuter
uniform vec4 uCamera1; // x: fov, y: centerX, z: centerY, w: roll

layout(location = 0) out vec4 outHit1;
layout(location = 1) out vec4 outHit2;
layout(location = 2) out vec4 outSky;
layout(location = 3) out vec4 outView;

${COMMON_GLSL}
${GEODESIC_GLSL}

const float FLAG_HOLE = 1.0;
const float FLAG_ESCAPED = 2.0;

void main() {
  vec2 uvTop = vec2(vGlUv.x, 1.0 - vGlUv.y);
  CameraRay ray = cameraRay(
    uvTop,
    uResolution,
    uCamera0.x,
    uCamera0.y,
    uCamera0.z,
    uCamera1.x,
    uCamera1.y,
    uCamera1.z,
    uCamera1.w
  );
  TraceResult traced = traceRay(ray.position, ray.velocity, uCamera0.w, escapeRadiusFor(uCamera0.z));

  if (traced.swallowed < 0.5 && traced.escaped < 0.5) {
    traced.swallowed = 1.0;
  }

  outHit1 = vec4(traced.hit1Plane, 0.0, 1.0);
  outHit2 = vec4(traced.hit2Plane, 0.0, 1.0);
  outSky = vec4(traced.finalVelocity, traced.swallowed * FLAG_HOLE + traced.escaped * FLAG_ESCAPED);
  outView = vec4(traced.hit1Direction, traced.hit2Direction);
}
`;

export const REFINE_FRAGMENT_GLSL = `#version 300 es
precision highp float;
precision highp int;
in vec2 vGlUv;

uniform vec2 uResolution;
uniform vec4 uCamera0; // x: yaw, y: pitch, z: orbitRadius, w: diskOuter
uniform vec4 uCamera1; // x: fov, y: centerX, z: centerY, w: roll
uniform sampler2D uGHit1;
uniform sampler2D uGSky;

layout(location = 0) out vec4 outCoverage;
layout(location = 1) out vec4 outGeometry;

${COMMON_GLSL}
${GEODESIC_GLSL}

const int SUB_STEPS = 4;
const int MASK_RADIUS = 2;
const float GRADIENT_LIMIT = 0.12;
const float B_CRIT = 2.59807621;
const float CRITICAL_BAND = 0.06;

bool isHitAt(vec2 plane) {
  return length(plane) > ISCO * 0.5;
}

void main() {
  ivec2 dimensions = textureSize(uGHit1, 0);
  ivec2 texel = clamp(ivec2(gl_FragCoord.xy), ivec2(0), dimensions - ivec2(1));
  float diskOuter = uCamera0.w;
  float annulus = max(diskOuter - ISCO, 0.001);

  vec2 centerPlane = texelFetch(uGHit1, texel, 0).xy;
  bool centerHit = isHitAt(centerPlane);
  bool centerHole = (int(texelFetch(uGSky, texel, 0).w + 0.5) & 1) != 0;
  float centerRadiusNorm = clamp((length(centerPlane) - ISCO) / annulus, 0.0, 1.0);

  vec2 uvTop = vec2(vGlUv.x, 1.0 - vGlUv.y);
  CameraRay centerRay = cameraRay(
    uvTop,
    uResolution,
    uCamera0.x,
    uCamera0.y,
    uCamera0.z,
    uCamera1.x,
    uCamera1.y,
    uCamera1.z,
    uCamera1.w
  );
  float impactParameter = length(cross(centerRay.position, centerRay.velocity));

  bool boundary = abs(impactParameter - B_CRIT) < CRITICAL_BAND * HORIZON;
  for (int dy = -MASK_RADIUS; dy <= MASK_RADIUS; dy++) {
    for (int dx = -MASK_RADIUS; dx <= MASK_RADIUS; dx++) {
      ivec2 neighbor = clamp(texel + ivec2(dx, dy), ivec2(0), dimensions - ivec2(1));
      vec2 plane = texelFetch(uGHit1, neighbor, 0).xy;
      bool hit = isHitAt(plane);
      bool hole = (int(texelFetch(uGSky, neighbor, 0).w + 0.5) & 1) != 0;
      if (hit != centerHit || hole != centerHole) {
        boundary = true;
      }
      if (hit && centerHit) {
        float radiusNorm = clamp((length(plane) - ISCO) / annulus, 0.0, 1.0);
        if (abs(radiusNorm - centerRadiusNorm) > GRADIENT_LIMIT) {
          boundary = true;
        }
      }
    }
  }

  if (!boundary) {
    outCoverage = vec4(centerHit ? 1.0 : 0.0, 0.0, 0.0, 1.0);
    outGeometry = vec4(0.0);
    return;
  }

  float escapeRadius = escapeRadiusFor(uCamera0.z);
  float hits = 0.0;
  float minRadius = 1e9;
  float maxRadius = -1e9;
  vec2 bestPlane = vec2(0.0);
  vec2 bestDirection = vec2(0.0);
  float bestRadius = 0.0;
  float bestDistance = 1e9;

  for (int sy = 0; sy < SUB_STEPS; sy++) {
    for (int sx = 0; sx < SUB_STEPS; sx++) {
      vec2 offset = (vec2(float(sx), float(sy)) + vec2(0.5)) / float(SUB_STEPS);
      vec2 subUvTop = vec2(
        (float(texel.x) + offset.x) / uResolution.x,
        1.0 - (float(texel.y) + offset.y) / uResolution.y
      );
      CameraRay ray = cameraRay(
        subUvTop,
        uResolution,
        uCamera0.x,
        uCamera0.y,
        uCamera0.z,
        uCamera1.x,
        uCamera1.y,
        uCamera1.z,
        uCamera1.w
      );
      TraceResult traced = traceRay(ray.position, ray.velocity, diskOuter, escapeRadius);
      if (traced.hitCount > 0) {
        float radius = length(traced.hit1Plane);
        hits += 1.0;
        minRadius = min(minRadius, radius);
        maxRadius = max(maxRadius, radius);
        float distance = length(offset - vec2(0.5));
        if (distance < bestDistance) {
          bestDistance = distance;
          bestPlane = traced.hit1Plane;
          bestDirection = traced.hit1Direction;
          bestRadius = radius;
        }
      }
    }
  }

  float coverage = hits / float(SUB_STEPS * SUB_STEPS);
  if (hits < 0.5) {
    outCoverage = vec4(0.0, 0.0, 0.0, 1.0);
    outGeometry = vec4(0.0);
    return;
  }

  float r0 = length(centerPlane);
  float span = 0.0;
  vec4 geometry = vec4(0.0);
  if (centerHit) {
    span = 2.0 * max(abs(maxRadius - r0), abs(r0 - minRadius));
  } else {
    r0 = 0.5 * (minRadius + maxRadius);
    span = maxRadius - minRadius;
    geometry = vec4(bestPlane * (r0 / max(bestRadius, ISCO)), bestDirection);
  }
  outCoverage = vec4(coverage, clamp(span / annulus, 0.0, 1.0), 0.0, 1.0);
  outGeometry = geometry;
}
`;

export const SHADE_FRAGMENT_GLSL = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler3D;
in vec2 vGlUv;

uniform vec4 uShade0; // x: resolution.x, y: resolution.y, z: time, w: diskOuter
uniform vec2 uShade1; // x: sceneYaw, y: centerFade
uniform vec4 uDisk0;  // brightness, speed, stretch, detail
uniform vec4 uDisk1;  // turbulence, density, doppler, cloudScale
uniform vec4 uDisk2;  // cloudSpeed, cloudStrength, spare0, spare1
uniform vec2 uDisk3;  // spare2, spare3
uniform vec4 uStars0; // brightness, density, contrast, warmth
uniform float uStarsTwinkle;

uniform sampler2D uGHit1;
uniform sampler2D uGHit2;
uniform sampler2D uGSky;
uniform sampler2D uGView;
uniform sampler2D uGAa;
uniform sampler2D uGAaGeom;
uniform sampler3D uNoiseVolume;

out vec4 outColor;

${COMMON_GLSL}
${STARS_GLSL}

struct GBufferSample {
  vec3 position;
  vec3 normal;
  vec2 diskUv;
  vec2 diskPolar;
  vec3 rayDirection;
  vec3 viewDirection;
  float side;
  float coverage;
  float span;
  bool isHit;
  bool synthesized;
  bool isBlackHole;
  bool escaped;
};

struct GBufferLayers {
  GBufferSample front;
  GBufferSample back;
};

vec3 decodeDirection(vec2 encoded) {
  float horizontal = sqrt(max(1.0 - encoded.x * encoded.x, 0.0));
  return vec3(cos(encoded.y) * horizontal, encoded.x, sin(encoded.y) * horizontal);
}

GBufferSample decodeLayer(
  vec2 plane,
  vec2 encodedDirection,
  vec4 sky,
  int flags,
  float diskOuter,
  vec2 aa,
  bool synthesized
) {
  GBufferSample s;
  float planeRadius = length(plane);
  bool isHit = planeRadius > ISCO * 0.5;
  float radius = max(planeRadius, ISCO);
  float azimuth = atan(plane.y, plane.x);
  vec3 direction = decodeDirection(encodedDirection);
  float side = direction.y > 0.0 ? -1.0 : 1.0;

  s.position = isHit ? vec3(plane.x, 0.0, plane.y) : vec3(0.0);
  s.normal = isHit ? vec3(0.0, side, 0.0) : vec3(0.0);
  s.diskUv = vec2(
    clamp((radius - ISCO) / max(diskOuter - ISCO, 0.001), 0.0, 1.0),
    (azimuth + PI_CONST) / TAU
  );
  s.diskPolar = vec2(radius, azimuth);
  s.rayDirection = sky.xyz;
  s.viewDirection = direction;
  s.side = isHit ? side : 0.0;
  s.coverage = clamp(aa.x, 0.0, 1.0);
  s.span = clamp(aa.y, 0.0, 1.0);
  s.isHit = isHit;
  s.synthesized = synthesized && isHit;
  s.isBlackHole = (flags & 1) != 0;
  s.escaped = (flags & 2) != 0;
  return s;
}

GBufferLayers decodeGBuffer(
  vec2 hit1,
  vec2 hit2,
  vec4 sky,
  vec4 view,
  float diskOuter,
  vec2 aa,
  vec4 aaGeom
) {
  int flags = int(sky.w + 0.5);
  bool substitute = length(hit1) <= ISCO * 0.5 && length(aaGeom.xy) > ISCO * 0.5;
  vec2 frontPlane = substitute ? aaGeom.xy : hit1;
  vec2 frontDirection = substitute ? aaGeom.zw : view.xy;
  GBufferLayers layers;
  layers.front = decodeLayer(frontPlane, frontDirection, sky, flags, diskOuter, aa, substitute);
  layers.back = decodeLayer(hit2, view.zw, sky, flags, diskOuter, vec2(1.0, 0.0), false);
  if (!layers.front.isHit) {
    layers.back.isHit = false;
    layers.back.side = 0.0;
    layers.back.normal = vec3(0.0);
  }
  return layers;
}

GBufferSample sampleAtRadius(GBufferSample g, float radius, float diskOuter) {
  GBufferSample moved = g;
  float clamped = clamp(radius, ISCO, max(diskOuter, ISCO));
  float azimuth = g.diskPolar.y;
  moved.position = vec3(cos(azimuth) * clamped, 0.0, sin(azimuth) * clamped);
  moved.diskPolar = vec2(clamped, azimuth);
  moved.diskUv = vec2(
    clamp((clamped - ISCO) / max(diskOuter - ISCO, 0.001), 0.0, 1.0),
    g.diskUv.y
  );
  return moved;
}

struct DiskLook {
  float brightness;
  float speed;
  float stretch;
  float detail;
  float turbulence;
  float density;
  float doppler;
  float cloudScale;
  float cloudSpeed;
  float cloudStrength;
  float spare0;
  float spare1;
  float spare2;
  float spare3;
};

struct DiskSample {
  vec3 color;
  float alpha;
};

float noise3(float invSize, vec3 p) {
  vec3 i = floor(p);
  vec3 f = p - i;
  vec3 u = f * f * (3.0 - 2.0 * f);
  return textureLod(uNoiseVolume, (i + u + vec3(0.5)) * invSize, 0.0).r;
}

float streakFbm(
  float invSize,
  float angle,
  float radius,
  float angScale,
  float radScale,
  int octaves,
  float dAngle,
  float dRadius,
  float lacAng,
  float lacRad,
  float seed
) {
  float value = 0.0;
  float total = 0.0;
  float amplitude = 0.5;
  float a = angScale;
  float r = radScale;
  float offset = seed;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    float visible = clamp(1.0 - 1.7 * max(dAngle * a, dRadius * r), 0.0, 1.0);
    float sampleValue = 0.5;
    if (visible > 0.004) {
      sampleValue = mix(
        0.5,
        noise3(invSize, vec3(cos(angle) * a, sin(angle) * a, radius * r + offset)),
        visible
      );
    }
    value += amplitude * sampleValue;
    total += amplitude;
    a *= lacAng;
    r *= lacRad;
    offset += 23.7;
    amplitude *= 0.55;
  }
  return value / max(total, 0.0001);
}

float ridgeFbm(
  float invSize,
  float angle,
  float radius,
  float angScale,
  float radScale,
  int octaves,
  float dAngle,
  float dRadius,
  float lacAng,
  float lacRad,
  float seed
) {
  float value = 0.0;
  float total = 0.0;
  float amplitude = 0.5;
  float a = angScale;
  float r = radScale;
  float offset = seed;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    float visible = clamp(1.0 - 1.7 * max(dAngle * a, dRadius * r), 0.0, 1.0);
    float crest = 0.42;
    if (visible > 0.004) {
      float n = noise3(invSize, vec3(cos(angle) * a, sin(angle) * a, radius * r + offset));
      crest = mix(0.42, safePow(max(1.0 - abs(n * 2.0 - 1.0), 0.0), 1.35), visible);
    }
    value += amplitude * crest;
    total += amplitude;
    a *= lacAng;
    r *= lacRad;
    offset += 41.9;
    amplitude *= 0.62;
  }
  return value / max(total, 0.0001);
}

struct FieldParams {
  float angBase;
  float radBase;
  float flowRad;
  float chaos;
  float outward;
  float dAngle;
  float dRadius;
};

vec2 smokeField(float invSize, float angle, float radius, FieldParams p) {
  float warpA = streakFbm(
    invSize, angle, radius, p.angBase * 0.55, p.flowRad * 1.6,
    2, p.dAngle, p.dRadius, 1.6, 2.0, 3.7
  ) - 0.5;
  float warpB = streakFbm(
    invSize, angle + 2.4, radius * 1.13,
    p.angBase * 2.8, p.radBase * 0.45, 3, p.dAngle, p.dRadius,
    1.7, 2.0, 61.3
  ) - 0.5;
  float radiusW = radius + (warpA * 1.9 + warpB * 1.25 * p.outward) * p.chaos;
  float angleW = angle + (warpB * 0.9 - warpA * 0.35) * p.chaos * 0.55 / max(radius * 0.22, 0.35);

  float flow = streakFbm(
    invSize, angleW, radiusW, p.angBase, p.flowRad,
    3, p.dAngle, p.dRadius, 2.0, 1.12, 131.7
  );
  float threads = ridgeFbm(
    invSize, angleW, radiusW, p.angBase * 0.85, p.radBase,
    5, p.dAngle, p.dRadius, 1.26, 2.05, 0.0
  );

  float fineVis = clamp(1.0 - 1.7 * max(p.dAngle * p.angBase * 0.85, p.dRadius * p.radBase), 0.0, 1.0);
  float field = mix(flow, flow * 0.22 + threads * 1.05, fineVis);
  float rim = (warpA + warpB * 0.5) * 0.9;
  return vec2(field, rim);
}

const float FIELD_MEAN = 0.52;
const float SHEAR_REF_RADIUS = 6.5;
const float SHEAR_PERIOD = 10.0;
const float TWO_PI = 6.283185307;

DiskSample shadeDisk(GBufferSample g, DiskLook look, float time, float footprint) {
  float invSize = 1.0 / float(textureSize(uNoiseVolume, 0).x);

  vec2 plane = vec2(g.position.x, g.position.z);
  float radius = g.diskPolar.x;
  float azimuth = g.diskPolar.y;
  float radiusNorm = clamp(g.diskUv.x, 0.0, 1.0);
  vec3 viewDirection = g.viewDirection;

  float slant = max(abs(viewDirection.y), 0.022);
  float grazing = min(1.0 / slant, 34.0);

  vec2 viewPlane = normalize(vec2(viewDirection.x, viewDirection.z) + vec2(1e-6, 0.0));
  vec2 radialDir = normalize(plane + vec2(1e-6, 0.0));
  float alignR = clamp(abs(dot(radialDir, viewPlane)), 0.0, 1.0);
  float alignT = sqrt(max(1.0 - alignR * alignR, 0.0));
  float stretchSq = grazing * grazing - 1.0;
  float kR = sqrt(1.0 + stretchSq * alignR * alignR);
  float kT = sqrt(1.0 + stretchSq * alignT * alignT);
  float baseScaleR = max(look.detail, 0.05);
  float baseScaleA = max(look.stretch, 0.05);
  float pixelWorld = footprint / max(baseScaleR * kR, baseScaleA * kT / max(radius, ISCO));
  float dRadius = pixelWorld * kR;
  float dAngle = pixelWorld * kT / max(radius, ISCO);

  float omega = look.speed * 0.55 / pow(radius, 1.5);
  float omegaRef = look.speed * 0.55 / pow(SHEAR_REF_RADIUS, 1.5);
  float dOmega = omega - omegaRef;
  float rigid = fract(time * omegaRef / TWO_PI) * TWO_PI;
  float swirl = max(0.0, 0.85 + look.spare1);
  float flowBase = azimuth - rigid + swirl * log(radius / ISCO);

  float cycle = time / SHEAR_PERIOD;
  float u0 = fract(cycle);
  float u1 = fract(cycle + 0.5);
  float shear0 = (u0 - 0.5) * SHEAR_PERIOD;
  float shear1 = (u1 - 0.5) * SHEAR_PERIOD;
  float w0 = 1.0 - abs(2.0 * u0 - 1.0);
  float w1 = 1.0 - w0;
  float angle0 = flowBase - dOmega * shear0;
  float angle1 = flowBase - dOmega * shear1;

  float outward = smoothstep(0.0, 0.92, radiusNorm);
  float fray = max(0.0, 1.0 + look.spare3);
  float chaos = look.turbulence * (0.08 + 2.10 * outward * outward) * fray;

  float angBase = max(look.stretch, 0.05) * 0.45 * (0.80 + 1.45 * outward * fray);
  float radBase = max(look.detail, 0.05) * 2.35;
  float flowRad = max(look.detail, 0.05) * 0.105;

  FieldParams params;
  params.angBase = angBase;
  params.radBase = radBase;
  params.flowRad = flowRad;
  params.chaos = chaos;
  params.outward = outward;
  params.dAngle = dAngle;
  params.dRadius = dRadius;
  float lobeShift = abs(dOmega) * SHEAR_PERIOD * 0.5 * angBase * 0.85;
  float rho = 1.0 - smoothstep(0.12, 1.1, lobeShift);

  vec2 blended;
  float lobeVariance = 1.0;
  if (rho > 0.98) {
    float angleMerged = mix(angle1, angle0, w0);
    blended = smokeField(invSize, angleMerged, radius, params);
  } else {
    vec2 lobe0 = smokeField(invSize, angle0, radius, params);
    vec2 lobe1 = smokeField(invSize, angle1, radius, params);
    blended = mix(lobe1, lobe0, w0);
    lobeVariance = sqrt(max(w0 * w0 + w1 * w1 + 2.0 * rho * w0 * w1, 0.25));
  }
  float field = FIELD_MEAN + (blended.x - FIELD_MEAN) / lobeVariance;

  float cloudRate = omegaRef * look.cloudSpeed;
  float cloudRigid = fract(time * cloudRate / TWO_PI) * TWO_PI;
  float cloudAngle = azimuth - cloudRigid + 0.32 * log(radius / ISCO);
  float cloudScale = max(look.cloudScale, 0.05);
  float cloudRaw = streakFbm(
    invSize, cloudAngle, radius, cloudScale, cloudScale * 0.34,
    2, dAngle, dRadius, 1.72, 1.86, 211.7
  );
  float cloud = smoothstep(0.28, 0.72, cloudRaw);
  float cloudStrength = clamp(look.cloudStrength, 0.0, 0.95);
  float cloudMultiplier = mix(1.0 - cloudStrength, 1.0 + cloudStrength, cloud);
  field *= cloudMultiplier;

  float rimNoise = blended.y;
  float innerEdge = smoothstep(0.0, 0.055, radiusNorm);
  float outerEdge = 1.0 - smoothstep(0.42 + rimNoise * 0.30 * fray, 1.0, radiusNorm);
  float envelope = innerEdge * outerEdge * mix(1.0, 0.62, outward);

  float contrast = max(0.2, 1.0 + look.spare2);
  float lo = 0.50 - 0.16 / contrast;
  float hi = 0.50 + 0.21 / contrast;
  float smoke = clamp(safePow(smoothstep(lo, hi, field), 1.0 + 0.9 * contrast) * envelope, 0.0, 1.0);

  float fieldN = clamp((field - (lo - 0.10)) / max(hi - lo + 0.26, 0.02), 0.0, 1.0);
  float emissivity = (mix(0.05, 1.0, safePow(fieldN, 1.35)) + 2.2 * safePow(fieldN, 5.0)) * envelope;

  float path = pow(grazing, 0.62);
  float thickness = mix(0.30, 0.85, radiusNorm);
  float opticalDepth = smoke * thickness * path * look.density * 0.95;
  float coverage = 1.0 - exp(-opticalDepth);

  float heat = safePow(max(1.0 - radiusNorm, 0.0), 1.25);
  vec3 thermal = mix(vec3(0.52, 0.14, 0.03), vec3(1.0, 0.56, 0.17), smoothstep(0.03, 0.5, heat));
  thermal = mix(thermal, vec3(1.0, 0.94, 0.83), safePow(heat, 2.2));

  vec3 tangent = normalize(vec3(-plane.y, 0.0, plane.x));
  float orbitalSpeed = min(0.64, 0.94 / sqrt(max(radius - HORIZON, 0.25)));
  float towardObserver = dot(tangent, -normalize(viewDirection));
  float beaming = pow(clamp(1.0 / (1.0 - orbitalSpeed * towardObserver), 0.72, 1.55), 1.5 * look.doppler);
  float redshift = sqrt(max(1.0 - HORIZON / radius, 0.025));
  float facing = mix(0.82, 1.0, step(0.0, g.side));
  float flux = safePow(clamp(ISCO / radius, 0.0, 1.0), 1.7);
  float core = 1.0 + 2.6 * safePow(max(1.0 - radiusNorm, 0.0), 5.0);

  float arcLift = max(0.0, 1.0 + look.spare0);
  float faceOn = smoothstep(0.16, 0.75, abs(viewDirection.y));
  float lift = 1.0 + 1.55 * arcLift * faceOn;
  float edgeGlow = 1.0 + 0.55 * smoothstep(6.0, 26.0, grazing);

  vec3 source = thermal * beaming * redshift * facing * flux * lift * edgeGlow * core * emissivity;
  vec3 emission = source * look.brightness * 1.35;

  DiskSample sampleOut;
  sampleOut.color = emission;
  sampleOut.alpha = coverage;
  return sampleOut;
}

const float DISK_GAIN = 1.35;
const int AA_TAPS = 6;
const float AA_SPAN_MIN = 0.15;

float centeredCopyFade(float uvY) {
  float distanceFromCenter = abs(uvY - 0.5);
  return safePow(smoothstep(0.08, 0.38, distanceFromCenter), 2.2);
}

vec2 diskFootprintAxes(GBufferSample g, DiskLook look, float time) {
  float angular = max(look.stretch, 0.05);
  float noiseAngle = g.diskPolar.y
    - min(time, SHEAR_PERIOD * 0.5) * (look.speed * 0.55 / pow(g.diskPolar.x, 1.5));
  vec3 noiseCoords = vec3(
    cos(noiseAngle) * angular,
    sin(noiseAngle) * angular,
    g.diskPolar.x * look.detail
  );
  return vec2(
    max(fwidth(noiseCoords.x), fwidth(noiseCoords.y)),
    fwidth(noiseCoords.z)
  );
}

float diskFootprint(vec2 axes) {
  return min(max(axes.x, axes.y), 4.0);
}

vec3 rotateY(vec3 v, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
}

float wrapAngle(float angle) {
  return angle - TAU * floor((angle + PI_CONST) / TAU);
}

GBufferSample rotateSample(GBufferSample g, float angle) {
  GBufferSample rotated = g;
  rotated.position = rotateY(g.position, angle);
  rotated.viewDirection = rotateY(g.viewDirection, angle);
  rotated.rayDirection = rotateY(g.rayDirection, angle);
  float azimuth = wrapAngle(g.diskPolar.y - angle);
  rotated.diskPolar = vec2(g.diskPolar.x, azimuth);
  rotated.diskUv = vec2(g.diskUv.x, (azimuth + PI_CONST) / TAU);
  return rotated;
}

GBufferLayers rotateLayers(GBufferLayers layers, float angle) {
  GBufferLayers rotated;
  rotated.front = rotateSample(layers.front, angle);
  rotated.back = rotateSample(layers.back, angle);
  return rotated;
}

DiskSample emptyDiskSample() {
  DiskSample s;
  s.color = vec3(0.0);
  s.alpha = 0.0;
  return s;
}

DiskSample shadeFront(GBufferSample g, DiskLook look, float time, float diskOuter, float footprint, float angularFootprint) {
  float annulus = max(diskOuter - ISCO, 0.001);
  float spanWorld = g.span * annulus;
  if (g.span <= AA_SPAN_MIN) {
    return shadeDisk(g, look, time, footprint);
  }

  float tapFootprint = min(max(angularFootprint, max(look.detail, 0.05) * (spanWorld / float(AA_TAPS))), 4.0);
  float stepVal = spanWorld / float(AA_TAPS);
  float start = g.diskPolar.x - spanWorld * 0.5;

  vec3 sumEmission = vec3(0.0);
  float sumAlpha = 0.0;
  float taps = 0.0;
  for (int i = 0; i < AA_TAPS; i++) {
    float radius = start + (float(i) + 0.5) * stepVal;
    if (radius < ISCO || radius > diskOuter) {
      continue;
    }
    DiskSample tap = shadeDisk(sampleAtRadius(g, radius, diskOuter), look, time, tapFootprint);
    sumEmission += tap.color * tap.alpha;
    sumAlpha += tap.alpha;
    taps += 1.0;
  }
  if (taps < 0.5) {
    return shadeDisk(g, look, time, footprint);
  }

  DiskSample sampleOut;
  float meanAlpha = sumAlpha / taps;
  sampleOut.alpha = meanAlpha;
  sampleOut.color = meanAlpha > 1e-6 ? (sumEmission / taps) / max(meanAlpha, 1e-6) : vec3(0.0);
  return sampleOut;
}

vec3 compositeDisk(vec3 under, DiskSample s) {
  return s.color * s.alpha * DISK_GAIN + under * (1.0 - s.alpha);
}

void main() {
  ivec2 dimensions = textureSize(uGHit1, 0);
  ivec2 texel = clamp(ivec2(gl_FragCoord.xy), ivec2(0), dimensions - ivec2(1));
  vec2 uvTop = vec2(vGlUv.x, 1.0 - vGlUv.y);

  DiskLook diskLook;
  diskLook.brightness = uDisk0.x;
  diskLook.speed = uDisk0.y;
  diskLook.stretch = uDisk0.z;
  diskLook.detail = uDisk0.w;
  diskLook.turbulence = uDisk1.x;
  diskLook.density = uDisk1.y;
  diskLook.doppler = uDisk1.z;
  diskLook.cloudScale = uDisk1.w;
  diskLook.cloudSpeed = uDisk2.x;
  diskLook.cloudStrength = uDisk2.y;
  diskLook.spare0 = uDisk2.z;
  diskLook.spare1 = uDisk2.w;
  diskLook.spare2 = uDisk3.x;
  diskLook.spare3 = uDisk3.y;

  StarLook starLook;
  starLook.brightness = uStars0.x;
  starLook.density = uStars0.y;
  starLook.contrast = uStars0.z;
  starLook.warmth = uStars0.w;
  starLook.twinkle = uStarsTwinkle;

  float time = uShade0.z;
  float diskOuter = uShade0.w;
  float sceneYaw = uShade1.x;
  float centerFade = uShade1.y;

  vec2 aa = texelFetch(uGAa, texel, 0).xy;
  vec4 aaGeom = texelFetch(uGAaGeom, texel, 0);

  GBufferLayers baked = decodeGBuffer(
    texelFetch(uGHit1, texel, 0).xy,
    texelFetch(uGHit2, texel, 0).xy,
    texelFetch(uGSky, texel, 0),
    texelFetch(uGView, texel, 0),
    diskOuter,
    aa,
    aaGeom
  );

  vec2 frontAxes = diskFootprintAxes(baked.front, diskLook, time);
  vec2 backAxes = diskFootprintAxes(baked.back, diskLook, time);
  float frontFootprint = diskFootprint(frontAxes);
  float backFootprint = diskFootprint(backAxes);

  vec3 bakedRayDirection = baked.front.rayDirection;
  vec3 skyDdx = dFdx(bakedRayDirection);
  vec3 skyDdy = dFdy(bakedRayDirection);

  GBufferLayers layers = rotateLayers(baked, -sceneYaw);
  GBufferSample g = layers.front;
  vec3 skyDdxRotated = rotateY(skyDdx, -sceneYaw);
  vec3 skyDdyRotated = rotateY(skyDdy, -sceneYaw);

  vec3 background = vec3(0.0);
  if (!g.isBlackHole && g.escaped) {
    background = shadeStars(g.rayDirection, starLook, time, skyDdxRotated, skyDdyRotated);
  }

  DiskSample backSample = emptyDiskSample();
  DiskSample frontSample = emptyDiskSample();
  if (layers.back.isHit) {
    backSample = shadeDisk(layers.back, diskLook, time, backFootprint);
  }
  if (layers.front.isHit) {
    frontSample = shadeFront(layers.front, diskLook, time, diskOuter, frontFootprint, frontAxes.x);
    frontSample.alpha *= layers.front.coverage;
  }

  vec3 color = background;
  color = compositeDisk(color, backSample);
  color = compositeDisk(color, frontSample);

  float centerMask = mix(1.0, centeredCopyFade(uvTop.y), clamp(centerFade, 0.0, 1.0));
  color *= centerMask;

  outColor = vec4(color, 1.0);
}
`;

export const MORPH_FRAGMENT_GLSL = `#version 300 es
precision highp float;
precision highp int;
in vec2 vGlUv;

uniform vec4 uFrameInfo;    // x: res.x, y: res.y, z: blend, w: swirlRad
uniform vec4 uCurrentPose;  // x: curCenterX, y: curCenterY, z: curRoll, w: sceneYaw
uniform vec4 uSourceA;      // x: centerAX, y: centerAY, z: rollA, w: time
uniform vec4 uSourceB;      // x: centerBX, y: centerBY, z: rollB, w: cameraPitch
uniform vec4 uCamera;       // x: orbitRadius, y: fov, z: zoom, w: singleSource
uniform vec4 uStars0;
uniform float uStarsTwinkle;

uniform sampler2D uSceneA;
uniform sampler2D uSceneB;

out vec4 outColor;

${COMMON_GLSL}
${GEODESIC_GLSL}
${STARS_GLSL}

vec2 rot2(vec2 v, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}

vec3 rotateY(vec3 v, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
}

float boundsWeight(vec2 uvCoord) {
  float margin = min(min(uvCoord.x, 1.0 - uvCoord.x), min(uvCoord.y, 1.0 - uvCoord.y));
  return smoothstep(0.0, 0.025, margin);
}

void main() {
  vec2 resolution = uFrameInfo.xy;
  float aspect = resolution.x / max(resolution.y, 1.0);
  vec2 uvTop = vec2(vGlUv.x, 1.0 - vGlUv.y);
  vec2 ndc = vGlUv * 2.0 - 1.0;

  vec2 localScreen = (ndc - uCurrentPose.xy) * vec2(aspect, 1.0);
  localScreen /= max(uCamera.z, 0.25);

  float radius = length(localScreen);
  float twistProfile = smoothstep(0.20, 0.85, radius) * (1.0 - smoothstep(1.35, 2.6, radius));
  localScreen = rot2(localScreen, uFrameInfo.w * twistProfile);

  vec2 planeA = rot2(localScreen, uCurrentPose.z - uSourceA.z);
  vec2 ndcA = uSourceA.xy + planeA / vec2(aspect, 1.0);
  vec2 glUvA = (ndcA + 1.0) * 0.5;

  vec2 planeB = rot2(localScreen, uCurrentPose.z - uSourceB.z);
  vec2 ndcB = uSourceB.xy + planeB / vec2(aspect, 1.0);
  vec2 glUvB = (ndcB + 1.0) * 0.5;

  vec3 colorA = texture(uSceneA, clamp(glUvA, vec2(0.001), vec2(0.999))).rgb;
  vec3 colorB = texture(uSceneB, clamp(glUvB, vec2(0.001), vec2(0.999))).rgb;

  CameraRay curRay = cameraRay(
    uvTop,
    resolution,
    0.0,
    uSourceB.w,
    uCamera.x,
    uCamera.y,
    uCurrentPose.x,
    uCurrentPose.y,
    uCurrentPose.z
  );
  vec3 skyDdx = dFdx(curRay.velocity);
  vec3 skyDdy = dFdy(curRay.velocity);
  vec3 starDir = rotateY(curRay.velocity, -uCurrentPose.w);
  StarLook starLook;
  starLook.brightness = uStars0.x;
  starLook.density = uStars0.y;
  starLook.contrast = uStars0.z;
  starLook.warmth = uStars0.w;
  starLook.twinkle = uStarsTwinkle;
  vec3 fallbackStars = shadeStars(
    starDir,
    starLook,
    uSourceA.w,
    rotateY(skyDdx, -uCurrentPose.w),
    rotateY(skyDdy, -uCurrentPose.w)
  );

  if (uCamera.w > 0.5) {
    float cover = boundsWeight(glUvA);
    outColor = vec4(mix(fallbackStars, colorA, cover), 1.0);
    return;
  }

  float blend = clamp(uFrameInfo.z, 0.0, 1.0);
  float boundA = boundsWeight(glUvA);
  float boundB = boundsWeight(glUvB);
  float wA = (1.0 - blend) * boundA;
  float wB = blend * boundB;
  float wSum = wA + wB;

  vec3 color = fallbackStars;
  if (wSum > 0.0001) {
    vec3 blendedScene = (colorA * wA + colorB * wB) / wSum;
    float cover = clamp(wSum * 6.0, 0.0, 1.0);
    color = mix(fallbackStars, blendedScene, cover);
  }
  outColor = vec4(color, 1.0);
}
`;

export const BLOOM_FRAGMENT_GLSL = `#version 300 es
precision highp float;
in vec2 vGlUv;

uniform vec2 uSourceSize;
uniform vec2 uDirection;
uniform vec4 uParams; // threshold, knee, radius, mode
uniform sampler2D uSource;

out vec4 outColor;

vec3 softThreshold(vec3 color) {
  float threshold = uParams.x;
  if (threshold <= 0.0) {
    return color;
  }
  float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float knee = max(min(uParams.y, threshold), 0.000001);
  float soft = clamp(brightness - threshold + knee, 0.0, 2.0 * knee);
  float softContribution = soft * soft / (4.0 * knee + 0.0001);
  float contribution = max(brightness - threshold, softContribution) / max(brightness, 0.0001);
  return color * contribution;
}

vec3 downsample(vec2 uv) {
  vec2 texel = 1.0 / uSourceSize;
  vec2 offset = texel * 0.5;
  vec3 color = (
    texture(uSource, uv + vec2(-offset.x, -offset.y)).rgb +
    texture(uSource, uv + vec2( offset.x, -offset.y)).rgb +
    texture(uSource, uv + vec2(-offset.x,  offset.y)).rgb +
    texture(uSource, uv + vec2( offset.x,  offset.y)).rgb
  ) * 0.25;
  return softThreshold(color);
}

vec3 gaussianBlur(vec2 uv) {
  float sigma = max(uParams.z, 0.5);
  float inverseTwoSigmaSquared = 0.5 / (sigma * sigma);
  float w0 = 1.0;
  float w1 = exp(-1.0 * inverseTwoSigmaSquared);
  float w2 = exp(-4.0 * inverseTwoSigmaSquared);
  float w3 = exp(-9.0 * inverseTwoSigmaSquared);
  float w4 = exp(-16.0 * inverseTwoSigmaSquared);

  float pair12 = w1 + w2;
  float pair34 = w3 + w4;
  float offset12 = (w1 + 2.0 * w2) / max(pair12, 0.000001);
  float offset34 = (3.0 * w3 + 4.0 * w4) / max(pair34, 0.000001);
  float normalization = w0 + 2.0 * (pair12 + pair34);
  vec2 texel = uDirection / uSourceSize;

  vec3 color = texture(uSource, uv).rgb * w0;
  color += texture(uSource, uv + texel * offset12).rgb * pair12;
  color += texture(uSource, uv - texel * offset12).rgb * pair12;
  color += texture(uSource, uv + texel * offset34).rgb * pair34;
  color += texture(uSource, uv - texel * offset34).rgb * pair34;
  return color / normalization;
}

void main() {
  vec3 color = uParams.w > 0.5 ? gaussianBlur(vGlUv) : downsample(vGlUv);
  outColor = vec4(color, 1.0);
}
`;

export const COMPOSITE_FRAGMENT_GLSL = `#version 300 es
precision highp float;
in vec2 vGlUv;

uniform vec4 uParams; // x: bloomStrength, y: progress, z: waveCenterX, w: transitioning
uniform vec4 uHole;   // x: curCenterX, y: curCenterY, z: aspect, w: direction
uniform sampler2D uScene;
uniform sampler2D uBloomNear;
uniform sampler2D uBloomMedium;
uniform sampler2D uBloomFar;

out vec4 outColor;

${COMMON_GLSL}

const float EXPOSURE = 1.15;
const float SATURATION = 0.0;

vec3 aces(vec3 x) {
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;
  return clamp((x * (a * x + vec3(b))) / (x * (c * x + vec3(d)) + vec3(e)), vec3(0.0), vec3(1.0));
}

vec3 tonemap(vec3 linearColor, vec2 uvTop, float invert) {
  vec3 color = aces(linearColor * EXPOSURE);

  vec2 centered = uvTop - vec2(0.5);
  float vignette = 1.0 - smoothstep(0.55, 1.15, length(centered) * 1.6);
  color *= mix(mix(0.72, 1.0, vignette), 1.0, invert);

  color = safePow3(color, 1.0 / 2.2);
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  return mix(vec3(luma), color, SATURATION);
}

void main() {
  vec3 sceneColor = texture(uScene, vGlUv).rgb;
  vec3 bloom =
    texture(uBloomNear, vGlUv).rgb * 0.50 +
    texture(uBloomMedium, vGlUv).rgb * 0.32 +
    texture(uBloomFar, vGlUv).rgb * 0.18;
  vec3 hdr = sceneColor + bloom * uParams.x;

  float progress = clamp(uParams.y, 0.0, 1.0);
  float localInvert = progress;
  float waveCrest = 0.0;

  if (uParams.w > 0.5) {
    vec2 ndc = vGlUv * 2.0 - 1.0;
    float aspect = max(uHole.z, 0.1);
    vec2 dHole = vec2((ndc.x - uHole.x) * aspect, ndc.y - uHole.y);
    float rHole = length(dHole);
    float angHole = atan(dHole.y, dHole.x);
    float dir = uHole.w;

    float swirlWarp =
      0.15 * sin(ndc.y * 2.1 - dir * progress * PI_CONST) +
      0.13 * sin(angHole * 2.0 + dir * progress * 5.2) * exp(-rHole * 0.95);
    float signedDist = ndc.x - (uParams.z + swirlWarp);
    float bandHalfWidth = 0.18;
    localInvert = smoothstep(-bandHalfWidth, bandHalfWidth, signedDist);
    waveCrest = 4.0 * localInvert * (1.0 - localInvert);
  }

  vec2 uvTop = vec2(vGlUv.x, 1.0 - vGlUv.y);
  vec3 mapped = tonemap(hdr, uvTop, localInvert);
  vec3 outputColor = mix(mapped, vec3(1.0) - mapped, localInvert);
  outputColor = clamp(outputColor + vec3(0.22 * waveCrest), vec3(0.0), vec3(1.0));
  outColor = vec4(outputColor, 1.0);
}
`;
