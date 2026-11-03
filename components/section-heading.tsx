import React from "react";

type SectionHeadingProps = {
  children: React.ReactNode;
};

export default function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight capitalize mb-8 text-center text-gray-950 dark:text-white">
      {children}
    </h2>
  );
}
