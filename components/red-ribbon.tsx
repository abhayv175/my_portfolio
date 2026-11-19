"use client";

import React, { useEffect, useRef } from "react";

interface RibbonPoint {
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

    // Trail points for the silky ribbon
    const points: RibbonPoint[] = [];

    // Max length ~200px (~5.5 cm) - elegant, delicate proportion
    const MAX_TRAIL_LENGTH = 200;
    const MAX_AGE_MS = 280; // Fast ethereal fade when stopping

    // Damped follower for silk ribbon drag physics
    const mouse = { x: -1000, y: -1000 };
    const lead = { x: -1000, y: -1000 };
    let isMouseInWindow = false;

    // High-DPI Retina handling
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (!isMouseInWindow) {
        lead.x = e.clientX;
        lead.y = e.clientY;
      }
      isMouseInWindow = true;

      if (!isRunning) {
        isRunning = true;
        animFrameId = requestAnimationFrame(render);
      }
    };

    const handleMouseLeave = () => {
      isMouseInWindow = false;
    };

    const handleMouseEnter = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      lead.x = e.clientX;
      lead.y = e.clientY;
      isMouseInWindow = true;
      if (!isRunning) {
        isRunning = true;
        animFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    const render = () => {
      const now = performance.now();

      // Damped spring follower for graceful silk inertia
      if (isMouseInWindow && mouse.x > 0) {
        const dx = mouse.x - lead.x;
        const dy = mouse.y - lead.y;

        lead.x += dx * 0.38;
        lead.y += dy * 0.38;

        const last = points[0];
        if (!last || Math.hypot(lead.x - last.x, lead.y - last.y) >= 2.5) {
          points.unshift({
            x: lead.x,
            y: lead.y,
            time: now,
          });
        }
      }

      // Age out old points
      while (points.length > 0 && now - points[points.length - 1].time > MAX_AGE_MS) {
        points.pop();
      }

      // Clear canvas
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (points.length < 2) {
        if (!isMouseInWindow || points.length === 0) {
          isRunning = false;
          return;
        }
      }

      // Calculate total trail distance and clamp to MAX_TRAIL_LENGTH
      let cumDist = 0;
      let validCount = points.length;

      for (let i = 1; i < points.length; i++) {
        cumDist += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
        if (cumDist >= MAX_TRAIL_LENGTH) {
          validCount = i + 1;
          break;
        }
      }

      points.splice(validCount);

      if (points.length >= 2) {
        const isDark = document.documentElement.classList.contains("dark");

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Subtle, elegant celestial glow
        ctx.shadowBlur = isDark ? 6 : 4;
        ctx.shadowColor = isDark
          ? "rgba(56, 189, 248, 0.45)"
          : "rgba(79, 70, 229, 0.3)";

        let distAlong = 0;

        // Render silky tapering ribbon from tail to head
        for (let i = points.length - 2; i >= 0; i--) {
          const p0 = points[i + 1];
          const p1 = points[i];
          const segDist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
          distAlong += segDist;

          // Head progress: 0 at tail, 1 at cursor tip
          const progress = Math.min(Math.max((cumDist - distAlong) / cumDist, 0), 1);
          
          // Delicate, slender stroke width: 0.3px at tail -> 3.2px at head
          const strokeWidth = 0.3 + Math.pow(progress, 1.2) * 2.9;
          const opacity = Math.pow(progress, 1.1) * (isDark ? 0.85 : 0.75);

          ctx.beginPath();
          ctx.lineWidth = strokeWidth;

          if (isDark) {
            // Dark Mode: Ethereal Sky/Cyan (#38bdf8) at head -> Deep Cosmic Violet (#818cf8) at tail
            const r = Math.round(56 + (1 - progress) * 73);
            const g = Math.round(189 - (1 - progress) * 49);
            const b = 248;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          } else {
            // Light Mode: Royal Indigo (#4f46e5) at head -> Soft Sky (#38bdf8) at tail
            const r = Math.round(79 - (1 - progress) * 23);
            const g = Math.round(70 + (1 - progress) * 119);
            const b = Math.round(229 + (1 - progress) * 19);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          }

          // Smooth midpoint Bezier curve interpolation for pure silky ribbon flow
          const midX = (p0.x + p1.x) / 2;
          const midY = (p0.y + p1.y) / 2;
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
          ctx.stroke();
        }

        ctx.restore();
      }

      animFrameId = requestAnimationFrame(render);
    };

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
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
