"use client";

import React, { useEffect, useRef, useState } from "react";
import { createRenderer, type HoleVariant } from "@/optimized-black-hole/renderer";
import { spaceAudio } from "@/lib/space-audio";

export type BlackHoleStatus = "pending" | "ready" | "fallback";
type RendererBackend = "webgpu" | "webgl2";
type HoleRenderer = ReturnType<typeof createRenderer>;

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
  const rendererRef = useRef<HoleRenderer | null>(null);
  const activeRef = useRef(active);
  const latestVariantRef = useRef(variant);
  const hasMountedVariantRef = useRef(false);
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
    rendererRef.current?.setActive(active);
  }, [active]);

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
        key={backend}
        ref={canvasRef}
        className="pointer-events-none block h-full w-full select-none"
      />
      {/* Subtle center vignettes to preserve contrast for centered Hero & About copy */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_50%_at_50%_46%,rgba(255,255,255,0.45),rgba(255,255,255,0.14)_65%,transparent_100%)] opacity-100 dark:opacity-0 transition-opacity duration-500 ease-out" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_50%_at_50%_46%,rgba(4,4,8,0.45),rgba(4,4,8,0.14)_65%,transparent_100%)] opacity-0 dark:opacity-100 transition-opacity duration-500 ease-out" />
    </div>
  );
}
