"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { projectsData } from "@/lib/data";
import Project from "./project";
import { useSectionInView } from "@/lib/hooks";

export default function Projects() {
  const { ref } = useSectionInView("Projects", 0.15);

  return (
    <section ref={ref} id="projects" className="scroll-mt-28 mb-28 relative">
      <SectionHeading>My projects</SectionHeading>
      <div className="flex flex-col items-center group/list relative">
        {projectsData.map((project, index) => (
          <React.Fragment key={index}>
            <Project {...project} />
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
