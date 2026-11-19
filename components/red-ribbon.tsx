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

      const events =
        typeof e.getCoalescedEvents === "function"
          ? e.getCoalescedEvents()
          : [e];

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

      // Soft celestial aura glow for luminous wet paint
      ctx.shadowBlur = isDark ? 12 : 8;
      ctx.shadowColor = isDark
        ? "rgba(56, 189, 248, 0.45)"
        : "rgba(79, 70, 229, 0.35)";

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
          const tailFade = Math.pow(u, 1.6); // Dissolves down to 0 at the tail end
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
          const tailFade = Math.pow(u, 1.6); // Continuous smooth fade from head to tail
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

      // PASS 1: Wet Paint Glaze Wash (Broad, translucent watercolor wash under the stroke)
      drawSplineSegments((_, u, totalFade) => {
        const washWidth = 1.0 + Math.pow(u, 1.2) * (MAX_PAINT_WIDTH * 1.35);
        const washAlpha = totalFade * (isDark ? 0.22 : 0.18);
        const strokeStyle = isDark
          ? `rgba(56, 189, 248, ${washAlpha})`
          : `rgba(79, 70, 229, ${washAlpha})`;
        return { width: washWidth, strokeStyle };
      });

      // PASS 2: Main Calligraphic Paint Brush Body (Rich pigment, swelling body, fading tail)
      drawSplineSegments((_, u, totalFade) => {
        // Tapers from ~0.6px at tail to ~18px at brush head
        const bodyWidth = 0.6 + Math.pow(u, 1.25) * (MAX_PAINT_WIDTH - 0.6);
        const bodyAlpha = totalFade * (isDark ? 0.85 : 0.78);

        let strokeStyle = "";
        if (isDark) {
          // Dark Mode: Head is Electric Cyan (#38bdf8) -> Tail is Deep Cosmic Violet (#818cf8)
          const r = Math.round(129 - u * 73);
          const g = Math.round(140 + u * 49);
          const b = 248;
          strokeStyle = `rgba(${r}, ${g}, ${b}, ${bodyAlpha})`;
        } else {
          // Light Mode: Head is Royal Indigo (#4f46e5) -> Tail is Soft Sky Cyan (#38bdf8)
          const r = Math.round(56 + u * 23);
          const g = Math.round(189 - u * 119);
          const b = Math.round(248 - u * 19);
          strokeStyle = `rgba(${r}, ${g}, ${b}, ${bodyAlpha})`;
        }

        return { width: bodyWidth, strokeStyle };
      });

      // PASS 3: Luminous Core Sheen (Brilliant inner highlight down the spine of the wet stroke)
      drawSplineSegments((_, u, totalFade) => {
        const coreWidth = 0.4 + Math.pow(u, 1.4) * 3.5;
        const coreAlpha = totalFade * (isDark ? 0.95 : 0.85);
        const strokeStyle = isDark
          ? `rgba(224, 242, 254, ${coreAlpha})` // Sky-100 pure wet pigment sheen
          : `rgba(199, 210, 254, ${coreAlpha})`; // Indigo-200 luminous sheen
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
