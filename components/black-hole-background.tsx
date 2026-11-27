"use client";

import React, { useEffect, useRef, useState } from "react";
import { createRenderer, type HoleVariant } from "@/optimized-black-hole/renderer";
import { spaceAudio } from "@/lib/space-audio";

export type BlackHoleStatus = "pending" | "ready" | "fallback";
type RendererBackend = "webgpu" | "webgl2";
type HoleRenderer = ReturnType<typeof createRenderer>;

/**
 * Temporarily swaps the live 3D BlackHole canvas for a pixel-identical 2D snapshot
 * while fullscreen modals open/close so macOS OverlayProcessor avoids Dawn/Metal
 * swapchain stalls.
 */
export function freezeBlackHoleOverlay(freeze: boolean): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("bh:overlay-freeze", { detail: freeze })
  );
}

interface BlackHoleBackgroundProps {
  active?: boolean;
  variant?: HoleVariant;
  onStatusChange?: (status: BlackHoleStatus) => void;
}

/**
 * Full-viewport black/white-hole backdrop supporting real-time 60 FPS swirling
 * transitions via WebGPU on desktop and automatic WebGL 2 fallback on mobile.
 */
export default function BlackHoleBackground({
  active = true,
  variant = "dark",
  onStatusChange,
}: BlackHoleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snapshotCanvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<HoleRenderer | null>(null);
  const activeRef = useRef(active);
  const latestVariantRef = useRef(variant);
  const hasMountedVariantRef = useRef(false);
  const freezeCountRef = useRef(0);
  const unfreezeRafRef = useRef(0);
  activeRef.current = active;
  latestVariantRef.current = variant;

  const [backend, setBackend] = useState<RendererBackend>("webgpu");
  const [status, setStatus] = useState<BlackHoleStatus>("pending");

  useEffect(() => {
    onStatusChange?.(status);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.holeBackdrop = status;
    }
  }, [status, onStatusChange]);

  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        delete document.documentElement.dataset.holeBackdrop;
      }
    };
  }, []);

  useEffect(() => {
    if (freezeCountRef.current === 0) {
      rendererRef.current?.setActive(active);
    }
  }, [active]);

  useEffect(() => {
    const onOverlayFreeze = (event: Event) => {
      const shouldFreeze = Boolean((event as CustomEvent<boolean>).detail);
      const canvas = canvasRef.current;
      const snapCanvas = snapshotCanvasRef.current;
      const renderer = rendererRef.current;

      if (shouldFreeze) {
        const nextCount = freezeCountRef.current + 1;
        freezeCountRef.current = nextCount;
        if (nextCount !== 1) return;

        if (unfreezeRafRef.current) {
          cancelAnimationFrame(unfreezeRafRef.current);
          unfreezeRafRef.current = 0;
        }
        if (renderer && snapCanvas) {
          const captured = renderer.captureSnapshot?.(snapCanvas);
          if (captured) {
            snapCanvas.style.display = "block";
          }
          renderer.setActive(false);
        }
        if (canvas) {
          canvas.style.display = "none";
        }
        return;
      }

      if (freezeCountRef.current === 0) return;
      const nextCount = freezeCountRef.current - 1;
      freezeCountRef.current = nextCount;
      if (nextCount > 0) return;

      if (canvas) {
        canvas.style.display = "block";
      }
      renderer?.setActive(activeRef.current);
      if (snapCanvas) {
        unfreezeRafRef.current = requestAnimationFrame(() => {
          unfreezeRafRef.current = 0;
          if (freezeCountRef.current === 0 && snapshotCanvasRef.current) {
            snapshotCanvasRef.current.style.display = "none";
          }
        });
      }
    };

    window.addEventListener("bh:overlay-freeze", onOverlayFreeze);
    return () => {
      window.removeEventListener("bh:overlay-freeze", onOverlayFreeze);
      if (unfreezeRafRef.current) {
        cancelAnimationFrame(unfreezeRafRef.current);
        unfreezeRafRef.current = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (!hasMountedVariantRef.current) {
      hasMountedVariantRef.current = true;
      return;
    }
    rendererRef.current?.setVariant(variant, true);
  }, [variant]);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;

    if (!canvas || typeof navigator === "undefined") {
      setStatus("fallback");
      return;
    }

    if (backend === "webgpu" && !("gpu" in navigator)) {
      setBackend("webgl2");
      return;
    }

    const domVariant: HoleVariant =
      typeof document !== "undefined" &&
      !document.documentElement.classList.contains("dark")
        ? "light"
        : latestVariantRef.current;

    const onMotionChange = (intensity: number, pan: number) =>
      spaceAudio.setHoleMotion(intensity, pan);

    let renderer: HoleRenderer | null = null;

    const start = async () => {
      if (backend === "webgpu") {
        renderer = createRenderer({
          canvas,
          active: activeRef.current,
          variant: domVariant,
          onMotionChange,
        });
      } else {
        const { createWebGl2Renderer } = await import(
          "@/optimized-black-hole/webgl2-renderer"
        );
        if (cancelled) return;
        renderer = createWebGl2Renderer({
          canvas,
          active: activeRef.current,
          variant: domVariant,
          onMotionChange,
        });
      }

      rendererRef.current = renderer;
      await renderer.ready;
      if (!cancelled) {
        setStatus("ready");
      }
    };

    void start().catch((error) => {
      console.warn(`[BlackHoleBackground] ${backend} failed:`, error);
      if (cancelled) return;
      if (backend === "webgpu") {
        setBackend("webgl2");
      } else {
        setStatus("fallback");
      }
    });

    return () => {
      cancelled = true;
      spaceAudio.setHoleMotion(0, 0);
      if (rendererRef.current === renderer) {
        rendererRef.current = null;
      }
      renderer?.dispose();
    };
  }, [backend]);

  if (status === "fallback") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-hidden transform-gpu transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
        status === "ready"
          ? "opacity-100 scale-100"
          : "opacity-0 scale-[1.035]"
      }`}
    >
      <canvas
        ref={snapshotCanvasRef}
        className="pointer-events-none absolute inset-0 block h-full w-full select-none"
        style={{ display: "none" }}
      />
      <canvas
        key={backend}
        ref={canvasRef}
        className="pointer-events-none relative block h-full w-full select-none"
      />
      {/* Subtle center vignettes to preserve contrast for centered Hero & About copy */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_50%_at_50%_46%,rgba(255,255,255,0.45),rgba(255,255,255,0.14)_65%,transparent_100%)] opacity-100 dark:opacity-0 transition-opacity duration-500 ease-out" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_50%_at_50%_46%,rgba(4,4,8,0.45),rgba(4,4,8,0.14)_65%,transparent_100%)] opacity-0 dark:opacity-100 transition-opacity duration-500 ease-out" />
    </div>
  );
}
