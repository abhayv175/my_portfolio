"use client";

import React from "react";
import { motion } from "framer-motion";

type SectionHeadingProps = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionHeading({
  children,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`overflow-hidden py-1 mb-8 text-center ${className}`}>
      <motion.h2
        initial={{ y: "110%", opacity: 0 }}
        whileInView={{ y: "0%", opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{
          duration: 0.85,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight capitalize text-gray-950 dark:text-white"
      >
        {children}
      </motion.h2>
    </div>
  );
}
