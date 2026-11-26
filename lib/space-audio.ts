// Procedural Web Audio engine: authentic dark cosmos & Perseus-inspired black hole
// gravitational acoustics with tuned accretion resonators and 5.4s void reverb.

export type ThemeAudioVariant = "light" | "dark";

// Deep D minor / open-fifth black hole register (cavernous cosmic scale)
const SUB_D1_HZ = 36.71;
const FIFTH_A1_HZ = 55.0;
const GRAVITY_D2_HZ = 73.42;
const FIFTH_A2_HZ = 110.0;
const RES_D3_HZ = 146.83;
const CHOIR_F3_HZ = 174.61;
const RES_A3_HZ = 220.0;
const RES_F4_HZ = 349.23;

const NOISE_BUFFER_SECONDS = 5;
const IMPULSE_SECONDS = 5.4;
const LOOP_CROSSFADE_SECONDS = 0.35;

interface AmbientNodes {
  subD1: OscillatorNode;
  subD1Gain: GainNode;
  fifthA1: OscillatorNode;
  fifthA1Gain: GainNode;
  gravityPulseA: OscillatorNode;
  gravityPulseB: OscillatorNode;
  gravityPulseGain: GainNode;
  organA2: OscillatorNode;
  organD2: OscillatorNode;
  organFilter: BiquadFilterNode;
  organGain: GainNode;
  choirF3: OscillatorNode;
  choirF3Gain: GainNode;
  airSource: AudioBufferSourceNode;
  subAirFilter: BiquadFilterNode;
  subAirGain: GainNode;
  coronaFilterA: BiquadFilterNode;
  coronaGainA: GainNode;
  coronaFilterB: BiquadFilterNode;
  coronaGainB: GainNode;
  coronaFilterHigh: BiquadFilterNode;
  coronaGainHigh: GainNode;
  lfoOrbitA: OscillatorNode;
  lfoOrbitB: OscillatorNode;
  lfoFilterGainA: GainNode;
  lfoFilterGainB: GainNode;
  lfoChoirGain: GainNode;
  pannerCore: StereoPannerNode | null;
  pannerCorona: StereoPannerNode | null;
  lfoPanGain: GainNode | null;
}

/** Circular deep Brownian turbulence buffer for tuned accretion resonators & sub rumble. */
function createCosmosTurbulenceBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(sampleRate * NOISE_BUFFER_SECONDS));
  const fadeSamples = Math.min(
    Math.floor(length * 0.25),
    Math.floor(sampleRate * LOOP_CROSSFADE_SECONDS)
  );
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const raw = new Float32Array(length + fadeSamples);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let brown = 0;
    for (let i = 0; i < raw.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      const pink = (b0 + b1 + b2 + white * 0.1848) * 0.11;
      brown = (brown + 0.022 * white) / 1.022;
      raw[i] = (pink * 0.55 + brown * 1.45) * 0.5;
    }

    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      if (i < fadeSamples) {
        const t = i / fadeSamples;
        const fadeIn = Math.sin(t * Math.PI * 0.5);
        const fadeOut = Math.cos(t * Math.PI * 0.5);
        data[i] = raw[i] * fadeIn + raw[length + i] * fadeOut;
      } else {
        data[i] = raw[i];
      }
    }
  }

  return buffer;
}

/** Vast 5.4s abyssal cosmos reverb impulse with dark air absorption. */
function createVoidImpulseBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(sampleRate * IMPULSE_SECONDS));
  const attackSamples = Math.floor(sampleRate * 0.12);
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let lp = 0;
    let peak = 0;
    for (let i = 0; i < length; i++) {
      const sec = i / sampleRate;
      const attack =
        i < attackSamples
          ? Math.sin((i / Math.max(1, attackSamples)) * Math.PI * 0.5)
          : 1;
      const decay =
        0.7 * Math.exp(-sec * 0.88) + 0.3 * Math.exp(-sec * 2.2);
      const white = Math.random() * 2 - 1;
      // Heavy air damping yields an infinite dark void instead of metallic room clatter
      lp += 0.11 * (white - lp);
      const val = lp * attack * decay;
      data[i] = val;
      peak = Math.max(peak, Math.abs(val));
    }
    const norm = peak > 0 ? 0.52 / peak : 1;
    for (let i = 0; i < length; i++) {
      data[i] *= norm;
    }
  }

  return buffer;
}

class SpaceAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private dryBus: GainNode | null = null;
  private wetBus: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private ambient: AmbientNodes | null = null;

  private enabled = false;
  private tabHidden = false;
  private holeMotion = 0;
  private scrollMotion = 0;
  private transitionMotion = 0;
  private panTarget = 0;
  private currentIntensity = 0;
  private rafId = 0;
  private scrollDecayTimer = 0;
  private transitionTimer = 0;
  private listenersAttached = false;

  private attachLifecycleListeners(): void {
    if (this.listenersAttached || typeof document === "undefined") return;
    this.listenersAttached = true;
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  private handleVisibilityChange = (): void => {
    this.tabHidden = typeof document !== "undefined" && document.hidden;
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    if (!this.enabled || this.tabHidden) {
      this.masterGain.gain.setTargetAtTime(0, now, 0.08);
      if (this.ctx.state === "running") {
        window.setTimeout(() => {
          if (
            (!this.enabled || this.tabHidden) &&
            this.ctx?.state === "running"
          ) {
            void this.ctx.suspend().catch(() => {});
          }
        }, 260);
      }
    } else {
      void this.ctx.resume().catch(() => {});
      this.masterGain.gain.setTargetAtTime(1.0, now, 0.22);
      this.ensureModulationLoop();
    }
  };

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (this.ctx) return this.ctx;

    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;

    const ctx = new AudioCtx();

    // Smooth dark ceiling removes any digital fizz above 2.1kHz
    const cosmicCeiling = ctx.createBiquadFilter();
    cosmicCeiling.type = "lowpass";
    cosmicCeiling.frequency.value = 2100;
    cosmicCeiling.Q.value = 0.55;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.knee.value = 14;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.015;
    compressor.release.value = 0.3;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;

    cosmicCeiling.connect(compressor);
    compressor.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Abyssal void balance: weighty sub dry core + huge 5.4s reverberant space
    const dryBus = ctx.createGain();
    dryBus.gain.value = 0.42;
    dryBus.connect(cosmicCeiling);

    const convolver = ctx.createConvolver();
    convolver.buffer = createVoidImpulseBuffer(ctx);
    const wetBus = ctx.createGain();
    wetBus.gain.value = 0.74;
    wetBus.connect(convolver);
    convolver.connect(cosmicCeiling);

    this.ctx = ctx;
    this.masterGain = masterGain;
    this.dryBus = dryBus;
    this.wetBus = wetBus;
    this.noiseBuffer = createCosmosTurbulenceBuffer(ctx);
    this.ambient = this.createAmbientGraph(ctx, dryBus, wetBus, this.noiseBuffer);
    this.attachLifecycleListeners();

    return ctx;
  }

  private createAmbientGraph(
    ctx: AudioContext,
    dryOut: AudioNode,
    wetOut: AudioNode,
    noiseBuffer: AudioBuffer
  ): AmbientNodes {
    const pannerCore =
      typeof ctx.createStereoPanner === "function"
        ? ctx.createStereoPanner()
        : null;
    const coreMix = ctx.createGain();
    coreMix.gain.value = 1;
    if (pannerCore) {
      pannerCore.pan.value = 0;
      pannerCore.connect(coreMix);
    }
    const coreTarget: AudioNode = pannerCore ?? coreMix;
    coreMix.connect(dryOut);
    coreMix.connect(wetOut);

    const pannerCorona =
      typeof ctx.createStereoPanner === "function"
        ? ctx.createStereoPanner()
        : null;
    if (pannerCorona) {
      pannerCorona.pan.value = 0;
      pannerCorona.connect(wetOut);
    }
    const coronaTarget: AudioNode = pannerCorona ?? wetOut;

    // 1. Event-horizon gravity well (D1 36.7Hz + A1 55Hz deep pure waves)
    const subD1 = ctx.createOscillator();
    subD1.type = "sine";
    subD1.frequency.value = SUB_D1_HZ;
    const subD1Gain = ctx.createGain();
    subD1Gain.gain.value = 0.095;
    subD1.connect(subD1Gain);
    subD1Gain.connect(coreTarget);

    const fifthA1 = ctx.createOscillator();
    fifthA1.type = "sine";
    fifthA1.frequency.value = FIFTH_A1_HZ;
    const fifthA1Gain = ctx.createGain();
    fifthA1Gain.gain.value = 0.065;
    fifthA1.connect(fifthA1Gain);
    fifthA1Gain.connect(coreTarget);

    // 2. Slow black-hole pressure-wave interference beat (D2 73.42Hz + 73.58Hz)
    // Produces a natural ~6s cosmic pulse without pitch wobble
    const gravityPulseA = ctx.createOscillator();
    gravityPulseA.type = "sine";
    gravityPulseA.frequency.value = GRAVITY_D2_HZ;

    const gravityPulseB = ctx.createOscillator();
    gravityPulseB.type = "sine";
    gravityPulseB.frequency.value = GRAVITY_D2_HZ + 0.16;

    const gravityPulseGain = ctx.createGain();
    gravityPulseGain.gain.value = 0.048;
    gravityPulseA.connect(gravityPulseGain);
    gravityPulseB.connect(gravityPulseGain);
    gravityPulseGain.connect(coreTarget);

    // 3. Gargantua-style deep pipe organ hollow fifths (D2 + A2 filtered dark)
    const organD2 = ctx.createOscillator();
    organD2.type = "sawtooth";
    organD2.frequency.value = GRAVITY_D2_HZ;

    const organA2 = ctx.createOscillator();
    organA2.type = "triangle";
    organA2.frequency.value = FIFTH_A2_HZ;

    const organFilter = ctx.createBiquadFilter();
    organFilter.type = "lowpass";
    organFilter.frequency.value = 175;
    organFilter.Q.value = 0.85;

    const organGain = ctx.createGain();
    organGain.gain.value = 0.024;

    organD2.connect(organFilter);
    organA2.connect(organFilter);
    organFilter.connect(organGain);
    organGain.connect(coreTarget);

    // 4. Haunting distant minor-third ghost choir (F3 pure sine in deep void reverb)
    const choirF3 = ctx.createOscillator();
    choirF3.type = "sine";
    choirF3.frequency.value = CHOIR_F3_HZ;
    const choirF3Gain = ctx.createGain();
    choirF3Gain.gain.value = 0.011;
    choirF3.connect(choirF3Gain);
    choirF3Gain.connect(wetOut);

    // 5. Tuned Accretion Disk Resonators + Sub-Gravity Void Pressure
    const airSource = ctx.createBufferSource();
    airSource.buffer = noiseBuffer;
    airSource.loop = true;

    // Sub-rumble floor (massive empty space weight, zero mid static)
    const subAirFilter = ctx.createBiquadFilter();
    subAirFilter.type = "lowpass";
    subAirFilter.frequency.value = 110;
    subAirFilter.Q.value = 0.7;
    const subAirGain = ctx.createGain();
    subAirGain.gain.value = 0.025;
    airSource.connect(subAirFilter);
    subAirFilter.connect(subAirGain);
    subAirGain.connect(coreTarget);

    // Resonator A (D3 146.8Hz high-Q glass resonance — Perseus/Voyager plasma tone)
    const coronaFilterA = ctx.createBiquadFilter();
    coronaFilterA.type = "bandpass";
    coronaFilterA.frequency.value = RES_D3_HZ;
    coronaFilterA.Q.value = 12;
    const coronaGainA = ctx.createGain();
    coronaGainA.gain.value = 0.036;
    airSource.connect(coronaFilterA);
    coronaFilterA.connect(coronaGainA);
    coronaGainA.connect(coronaTarget);

    // Resonator B (A3 220Hz orbiting harmonic corona)
    const coronaFilterB = ctx.createBiquadFilter();
    coronaFilterB.type = "bandpass";
    coronaFilterB.frequency.value = RES_A3_HZ;
    coronaFilterB.Q.value = 14;
    const coronaGainB = ctx.createGain();
    coronaGainB.gain.value = 0.026;
    airSource.connect(coronaFilterB);
    coronaFilterB.connect(coronaGainB);
    coronaGainB.connect(coronaTarget);

    // High Accretion Ring Corona (F4 349.2Hz — blooms cleanly during fast motion)
    const coronaFilterHigh = ctx.createBiquadFilter();
    coronaFilterHigh.type = "bandpass";
    coronaFilterHigh.frequency.value = RES_F4_HZ;
    coronaFilterHigh.Q.value = 15;
    const coronaGainHigh = ctx.createGain();
    coronaGainHigh.gain.value = 0.008;
    airSource.connect(coronaFilterHigh);
    coronaFilterHigh.connect(coronaGainHigh);
    coronaGainHigh.connect(coronaTarget);

    // 6. Slow orbital drift LFOs sweeping resonators and stereo space
    const lfoOrbitA = ctx.createOscillator();
    lfoOrbitA.type = "sine";
    lfoOrbitA.frequency.value = 0.055;

    const lfoOrbitB = ctx.createOscillator();
    lfoOrbitB.type = "sine";
    lfoOrbitB.frequency.value = 0.089;

    const lfoFilterGainA = ctx.createGain();
    lfoFilterGainA.gain.value = 12;
    lfoOrbitA.connect(lfoFilterGainA);
    lfoFilterGainA.connect(coronaFilterA.frequency);

    const lfoFilterGainB = ctx.createGain();
    lfoFilterGainB.gain.value = 16;
    lfoOrbitB.connect(lfoFilterGainB);
    lfoFilterGainB.connect(coronaFilterB.frequency);

    const lfoChoirGain = ctx.createGain();
    lfoChoirGain.gain.value = 0.006;
    lfoOrbitA.connect(lfoChoirGain);
    lfoChoirGain.connect(choirF3Gain.gain);

    let lfoPanGain: GainNode | null = null;
    if (pannerCorona) {
      lfoPanGain = ctx.createGain();
      lfoPanGain.gain.value = 0.45;
      lfoOrbitB.connect(lfoPanGain);
      lfoPanGain.connect(pannerCorona.pan);
    }

    subD1.start();
    fifthA1.start();
    gravityPulseA.start();
    gravityPulseB.start();
    organD2.start();
    organA2.start();
    choirF3.start();
    airSource.start();
    lfoOrbitA.start();
    lfoOrbitB.start();

    return {
      subD1,
      subD1Gain,
      fifthA1,
      fifthA1Gain,
      gravityPulseA,
      gravityPulseB,
      gravityPulseGain,
      organA2,
      organD2,
      organFilter,
      organGain,
      choirF3,
      choirF3Gain,
      airSource,
      subAirFilter,
      subAirGain,
      coronaFilterA,
      coronaGainA,
      coronaFilterB,
      coronaGainB,
      coronaFilterHigh,
      coronaGainHigh,
      lfoOrbitA,
      lfoOrbitB,
      lfoFilterGainA,
      lfoFilterGainB,
      lfoChoirGain,
      pannerCore,
      pannerCorona,
      lfoPanGain,
    };
  }

  private ensureModulationLoop(): void {
    if (this.rafId || !this.enabled || this.tabHidden) return;
    const step = () => {
      this.rafId = 0;
      if (!this.enabled || this.tabHidden || !this.ctx || !this.ambient) return;

      const targetIntensity = Math.min(
        1,
        Math.max(
          this.holeMotion,
          this.scrollMotion * 0.72,
          this.transitionMotion
        )
      );

      const rate = targetIntensity > this.currentIntensity ? 0.14 : 0.038;
      this.currentIntensity += (targetIntensity - this.currentIntensity) * rate;
      if (this.currentIntensity < 0.002 && targetIntensity === 0) {
        this.currentIntensity = 0;
      }

      this.applyAmbientParameters(this.currentIntensity, this.panTarget);

      if (this.enabled && !this.tabHidden) {
        this.rafId = window.requestAnimationFrame(step);
      }
    };
    this.rafId = window.requestAnimationFrame(step);
  }

  private applyAmbientParameters(intensity: number, pan: number): void {
    if (!this.ctx || !this.ambient) return;
    const now = this.ctx.currentTime;
    const a = this.ambient;
    const shaped = intensity * (0.55 + 0.45 * intensity);

    // Gravitational sub & fifth swell massively when spinning fast
    a.subD1Gain.gain.setTargetAtTime(0.095 + 0.085 * shaped, now, 0.12);
    a.fifthA1Gain.gain.setTargetAtTime(0.065 + 0.075 * shaped, now, 0.12);

    // Gravitational beat speeds up smoothly (0.16Hz calm pulse -> 1.35Hz relativistic throb)
    a.gravityPulseB.frequency.setTargetAtTime(
      GRAVITY_D2_HZ + 0.16 + 1.19 * shaped,
      now,
      0.16
    );
    a.gravityPulseGain.gain.setTargetAtTime(0.048 + 0.055 * shaped, now, 0.12);

    // Dark pipe organ fifths bloom open under heavy acceleration
    a.organFilter.frequency.setTargetAtTime(175 + 780 * shaped, now, 0.11);
    a.organFilter.Q.setTargetAtTime(0.85 + 0.85 * intensity, now, 0.14);
    a.organGain.gain.setTargetAtTime(0.024 + 0.058 * shaped, now, 0.12);

    // Haunting minor-3rd choir rises inside the void reverb
    a.choirF3Gain.gain.setTargetAtTime(0.011 + 0.042 * shaped, now, 0.14);
    a.lfoChoirGain.gain.setTargetAtTime(0.006 + 0.018 * intensity, now, 0.16);

    // Void pressure sub-rumble + singing harmonic plasma corona resonators
    a.subAirFilter.frequency.setTargetAtTime(110 + 190 * shaped, now, 0.12);
    a.subAirGain.gain.setTargetAtTime(0.025 + 0.065 * shaped, now, 0.12);

    a.coronaGainA.gain.setTargetAtTime(0.036 + 0.11 * shaped, now, 0.11);
    a.coronaGainB.gain.setTargetAtTime(0.026 + 0.09 * shaped, now, 0.11);
    a.coronaGainHigh.gain.setTargetAtTime(
      0.008 + 0.085 * Math.pow(intensity, 1.2),
      now,
      0.11
    );

    a.lfoOrbitA.frequency.setTargetAtTime(0.055 + 0.28 * intensity, now, 0.18);
    a.lfoOrbitB.frequency.setTargetAtTime(0.089 + 0.36 * intensity, now, 0.18);
    a.lfoFilterGainA.gain.setTargetAtTime(12 + 28 * intensity, now, 0.16);
    a.lfoFilterGainB.gain.setTargetAtTime(16 + 38 * intensity, now, 0.16);

    if (a.pannerCore) {
      a.pannerCore.pan.setTargetAtTime(
        Math.max(-0.35, Math.min(0.35, pan * 0.35)),
        now,
        0.16
      );
    }
  }

  setEnabled(nextEnabled: boolean): void {
    this.enabled = nextEnabled;

    if (nextEnabled) {
      const ctx = this.ensureContext();
      if (!ctx || !this.masterGain) return;
      void ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(1.0, now, 0.25);
      this.applyAmbientParameters(this.currentIntensity, this.panTarget);
      this.ensureModulationLoop();
    } else {
      if (this.rafId) {
        window.cancelAnimationFrame(this.rafId);
        this.rafId = 0;
      }
      if (this.ctx && this.masterGain) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setTargetAtTime(0, now, 0.06);
        window.setTimeout(() => {
          if (!this.enabled && this.ctx?.state === "running") {
            void this.ctx.suspend().catch(() => {});
          }
        }, 260);
      }
    }
  }

  setHoleMotion(intensity: number, pan = 0): void {
    this.holeMotion = Math.max(0, Math.min(1, intensity));
    this.panTarget = Math.max(-1, Math.min(1, pan));
  }

  setScrollMotion(intensity: number): void {
    this.scrollMotion = Math.max(0, Math.min(1, intensity));
    if (this.scrollDecayTimer) {
      window.clearTimeout(this.scrollDecayTimer);
    }
    this.scrollDecayTimer = window.setTimeout(() => {
      this.scrollMotion = 0;
      this.scrollDecayTimer = 0;
    }, 100);
  }

  playThemeTransition(toVariant: ThemeAudioVariant): void {
    if (!this.enabled || this.tabHidden) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.dryBus || !this.wetBus || !this.noiseBuffer) return;
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => {});
    }

    // Surge accretion resonance cleanly across the 1s orbital sweep
    this.transitionMotion = 1;
    if (this.transitionTimer) window.clearTimeout(this.transitionTimer);
    this.transitionTimer = window.setTimeout(() => {
      this.transitionMotion = 0;
      this.transitionTimer = 0;
    }, 1000);

    const now = ctx.currentTime;

    // 1. Resonant electromagnetic corona sweep synced to the 320ms midpoint
    const coronaSrc = ctx.createBufferSource();
    coronaSrc.buffer = this.noiseBuffer;

    const coronaSweep = ctx.createBiquadFilter();
    coronaSweep.type = "bandpass";
    coronaSweep.Q.value = toVariant === "light" ? 4.5 : 5.2;

    const coronaGain = ctx.createGain();
    coronaGain.gain.setValueAtTime(0.0001, now);
    coronaGain.gain.linearRampToValueAtTime(0.18, now + 0.32);
    coronaGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);

    if (toVariant === "light") {
      // Dark -> Light: outward burst expanding from D2 gravity core to radiant A4
      coronaSweep.frequency.setValueAtTime(85, now);
      coronaSweep.frequency.exponentialRampToValueAtTime(440, now + 0.38);
      coronaSweep.frequency.exponentialRampToValueAtTime(220, now + 1.18);
    } else {
      // Light -> Dark: inward gravitational implosion spiraling down to D2 horizon
      coronaSweep.frequency.setValueAtTime(493.88, now);
      coronaSweep.frequency.exponentialRampToValueAtTime(73.42, now + 0.72);
    }

    coronaSrc.connect(coronaSweep);
    coronaSweep.connect(coronaGain);
    coronaGain.connect(this.wetBus);
    coronaSrc.start(now);
    coronaSrc.stop(now + 1.3);

    // 2. Deep gravitational bass wave drop / swell (pure sub-sine into void)
    const subWave = ctx.createOscillator();
    subWave.type = "sine";
    const subGain = ctx.createGain();

    if (toVariant === "dark") {
      subWave.frequency.setValueAtTime(110.0, now);
      subWave.frequency.exponentialRampToValueAtTime(SUB_D1_HZ, now + 0.85);
      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.linearRampToValueAtTime(0.11, now + 0.3);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
    } else {
      subWave.frequency.setValueAtTime(GRAVITY_D2_HZ, now);
      subWave.frequency.exponentialRampToValueAtTime(220.0, now + 0.45);
      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.linearRampToValueAtTime(0.07, now + 0.32);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    }

    subWave.connect(subGain);
    subGain.connect(this.dryBus);
    subGain.connect(this.wetBus);
    subWave.start(now);
    subWave.stop(now + 1.32);

    // 3. Open cosmic harmonic glow (D-A-E / D-A-F intervals bathed in 5.4s void)
    const harmonic = ctx.createOscillator();
    harmonic.type = "sine";
    harmonic.frequency.setValueAtTime(
      toVariant === "light" ? 329.63 : CHOIR_F3_HZ,
      now
    );
    const harmonicGain = ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.0001, now);
    harmonicGain.gain.linearRampToValueAtTime(0.032, now + 0.34);
    harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);

    harmonic.connect(harmonicGain);
    harmonicGain.connect(this.wetBus);
    harmonic.start(now);
    harmonic.stop(now + 1.4);

    harmonic.onended = () => {
      coronaSrc.disconnect();
      coronaSweep.disconnect();
      coronaGain.disconnect();
      subWave.disconnect();
      subGain.disconnect();
      harmonic.disconnect();
      harmonicGain.disconnect();
    };
  }

  dispose(): void {
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    if (this.scrollDecayTimer) {
      window.clearTimeout(this.scrollDecayTimer);
      this.scrollDecayTimer = 0;
    }
    if (this.transitionTimer) {
      window.clearTimeout(this.transitionTimer);
      this.transitionTimer = 0;
    }
    if (this.listenersAttached && typeof document !== "undefined") {
      document.removeEventListener(
        "visibilitychange",
        this.handleVisibilityChange
      );
      this.listenersAttached = false;
    }
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    this.ambient = null;
    this.masterGain = null;
    this.dryBus = null;
    this.wetBus = null;
  }
}

export const spaceAudio = new SpaceAudioEngine();
