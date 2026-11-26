"use client";

import React, { useEffect, useRef } from "react";

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

export default function CursorRibbon() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Only activate for devices with a fine pointer (desktop mice / trackpads)
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let isRunning = false;

    // Sub-frame sampled pointer history
    const points: TrailPoint[] = [];
    const MAX_AGE_MS = 320; // Natural paint stroke dissipation lifetime
    const MAX_PAINT_WIDTH = 18; // Lush paint brush stroke body width

    // High-DPI Retina display handling
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const startLoop = () => {
      if (!isRunning) {
        isRunning = true;
        animFrameId = requestAnimationFrame(render);
      }
    };

    // Sub-frame pointer sampling via pointermove + getCoalescedEvents
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;

      const coalesced =
        typeof e.getCoalescedEvents === "function"
          ? e.getCoalescedEvents()
          : [];
      const events = coalesced.length > 0 ? coalesced : [e];

      const now = performance.now();
      for (let i = 0; i < events.length; i++) {
        const ev = events[i];
        const x = ev.clientX;
        const y = ev.clientY;

        const last = points[points.length - 1];
        if (!last || Math.hypot(x - last.x, y - last.y) >= 2.0) {
          points.push({ x, y, time: now });
        }
      }

      startLoop();
    };

    const handlePointerLeave = () => {
      // Remaining brush stroke smoothly lifts and dissolves away
    };

    const handlePointerEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      points.length = 0;
      points.push({
        x: e.clientX,
        y: e.clientY,
        time: performance.now(),
      });
      startLoop();
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("pointerenter", handlePointerEnter);

    const render = () => {
      const now = performance.now();

      // Discard points older than MAX_AGE_MS
      while (points.length > 0 && now - points[0].time > MAX_AGE_MS) {
        points.shift();
      }

      // Clear canvas
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Stop animation loop when empty to consume 0% CPU
      if (points.length < 2) {
        isRunning = false;
        return;
      }

      const N = points.length;
      const isDark = document.documentElement.classList.contains("dark");

      // Precalculate midpoints for C1-continuous midpoint quadratic Bézier spline
      const mids: { x: number; y: number }[] = [];
      for (let i = 0; i < N - 1; i++) {
        mids.push({
          x: (points[i].x + points[i + 1].x) * 0.5,
          y: (points[i].y + points[i + 1].y) * 0.5,
        });
      }

      ctx.save();

      // Soft aura glow matching theme contrast (white-cyan in dark, subtle ink in light)
      ctx.shadowBlur = isDark ? 12 : 8;
      ctx.shadowColor = isDark
        ? "rgba(255, 255, 255, 0.35)"
        : "rgba(0, 0, 0, 0.25)";

      // Helper function to draw a full segment sequence along the spline
      const drawSplineSegments = (
        drawSegment: (
          index: number,
          u: number,
          totalFade: number
        ) => { width: number; strokeStyle: string } | null
      ) => {
        // Tail segment: points[0] to mids[0]
        {
          const u = 0;
          const age = now - points[0].time;
          const ageFade = Math.max(0, 1 - age / MAX_AGE_MS);
          const tailFade = Math.pow(u, 1.15); // Dissolves smoothly at the tail tip
          const totalFade = tailFade * Math.pow(ageFade, 1.2);

          const style = drawSegment(0, u, totalFade);
          if (style && totalFade > 0.001) {
            ctx.beginPath();
            ctx.lineWidth = style.width;
            ctx.strokeStyle = style.strokeStyle;
            ctx.lineCap = "round";
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(mids[0].x, mids[0].y);
            ctx.stroke();
          }
        }

        // Intermediate quadratic Bézier curve segments: mids[j] to mids[j+1]
        for (let j = 0; j < N - 2; j++) {
          const u = (j + 1) / (N - 1);
          const age = now - points[j + 1].time;
          const ageFade = Math.max(0, 1 - age / MAX_AGE_MS);
          const tailFade = Math.pow(u, 1.15);
          const totalFade = tailFade * Math.pow(ageFade, 1.2);

          const style = drawSegment(j + 1, u, totalFade);
          if (style && totalFade > 0.001) {
            ctx.beginPath();
            ctx.lineWidth = style.width;
            ctx.strokeStyle = style.strokeStyle;
            ctx.lineCap = "butt"; // Seamless joint without double-alpha overlapping dots
            ctx.moveTo(mids[j].x, mids[j].y);
            ctx.quadraticCurveTo(
              points[j + 1].x,
              points[j + 1].y,
              mids[j + 1].x,
              mids[j + 1].y
            );
            ctx.stroke();
          }
        }

        // Head segment: mids[N-2] to points[N-1] (cursor tip)
        {
          const u = 1;
          const age = now - points[N - 1].time;
          const ageFade = Math.max(0, 1 - age / MAX_AGE_MS);
          const totalFade = Math.pow(ageFade, 1.2);

          const style = drawSegment(N - 1, u, totalFade);
          if (style && totalFade > 0.001) {
            ctx.beginPath();
            ctx.lineWidth = style.width;
            ctx.strokeStyle = style.strokeStyle;
            ctx.lineCap = "round"; // Round cap at the active brush head
            ctx.moveTo(mids[N - 2].x, mids[N - 2].y);
            ctx.lineTo(points[N - 1].x, points[N - 1].y);
            ctx.stroke();
          }
        }
      };

      // Keep the trailing ~50% of the ribbon pure white (dark) / pure black (light),
      // blending to cyan / indigo only toward the active cursor head.
      const headBlend = (u: number) =>
        u <= 0.5 ? 0 : Math.pow((u - 0.5) / 0.5, 1.3);

      // PASS 1: Wet Paint Glaze Wash (Tail: pure white in dark mode, pure black in light mode)
      drawSplineSegments((_, u, totalFade) => {
        const m = headBlend(u);
        const washWidth = 1.0 + Math.pow(u, 1.2) * (MAX_PAINT_WIDTH * 1.35);
        const washAlpha = totalFade * (isDark ? 0.24 : 0.2);
        let strokeStyle = "";
        if (isDark) {
          const r = Math.round(255 - m * 199);
          const g = Math.round(255 - m * 66);
          const b = Math.round(255 - m * 7);
          strokeStyle = `rgba(${r}, ${g}, ${b}, ${washAlpha})`;
        } else {
          const r = Math.round(m * 79);
          const g = Math.round(m * 70);
          const b = Math.round(m * 229);
          strokeStyle = `rgba(${r}, ${g}, ${b}, ${washAlpha})`;
        }
        return { width: washWidth, strokeStyle };
      });

      // PASS 2: Main Calligraphic Paint Brush Body (Tail: pure white in dark, pure black in light)
      drawSplineSegments((_, u, totalFade) => {
        const m = headBlend(u);
        // Tapers from ~0.6px at tail to ~18px at brush head
        const bodyWidth = 0.6 + Math.pow(u, 1.25) * (MAX_PAINT_WIDTH - 0.6);
        const bodyAlpha = totalFade * (isDark ? 0.92 : 0.9);

        let strokeStyle = "";
        if (isDark) {
          // Dark Mode: Tail (u <= 0.5) is White (#ffffff) -> Head (u=1) is Electric Cyan (#38bdf8)
          const r = Math.round(255 - m * 199);
          const g = Math.round(255 - m * 66);
          const b = Math.round(255 - m * 7);
          strokeStyle = `rgba(${r}, ${g}, ${b}, ${bodyAlpha})`;
        } else {
          // Light Mode: Tail (u <= 0.5) is Black (#000000) -> Head (u=1) is Royal Indigo (#4f46e5)
          const r = Math.round(m * 79);
          const g = Math.round(m * 70);
          const b = Math.round(m * 229);
          strokeStyle = `rgba(${r}, ${g}, ${b}, ${bodyAlpha})`;
        }

        return { width: bodyWidth, strokeStyle };
      });

      // PASS 3: Core Spine Sheen (pure white tail in dark mode, pure black tail in light mode)
      drawSplineSegments((_, u, totalFade) => {
        const m = headBlend(u);
        const coreWidth = 0.4 + Math.pow(u, 1.4) * 3.5;
        const coreAlpha = totalFade * (isDark ? 0.95 : 0.85);
        let strokeStyle = "";
        if (isDark) {
          const r = Math.round(255 - m * 31);
          const g = Math.round(255 - m * 13);
          const b = Math.round(255 - m * 1);
          strokeStyle = `rgba(${r}, ${g}, ${b}, ${coreAlpha})`;
        } else {
          const r = Math.round(m * 199);
          const g = Math.round(m * 210);
          const b = Math.round(m * 254);
          strokeStyle = `rgba(${r}, ${g}, ${b}, ${coreAlpha})`;
        }
        return { width: coreWidth, strokeStyle };
      });

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("pointerenter", handlePointerEnter);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-[9990]"
    />
  );
}

// Re-export as RedRibbon for backwards compatibility
export { CursorRibbon as RedRibbon };
