"use client";

import React, { useState, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const [disableLenis, setDisableLenis] = useState(false);

  useEffect(() => {
    const check = () => {
      setDisableLenis(
        window.matchMedia("(pointer: coarse)").matches ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
          window.innerWidth < 768
      );
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {disableLenis ? (
        children
      ) : (
        <ReactLenis
          root
          options={{
            lerp: 0.08,
            duration: 1.2,
            smoothWheel: true,
          }}
        >
          {children}
        </ReactLenis>
      )}
    </MotionConfig>
  );
}
