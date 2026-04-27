"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <motion.section
      ref={ref}
      className="mb-28 max-w-[45rem] text-center leading-8 sm:mb-40 scroll-mt-28"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
      id="about"
    >
      <SectionHeading>About me</SectionHeading>





      <p className="mb-3">
       I am a Test Engineer based in Vilnius, specializing in mobile hardware and software quality. With professional experience at companies like Marquistech and Unity, I bring a meticulous approach to debugging, regression testing, and network analysis. Beyond testing, I am a Full-Stack Developer who loves building with React, Next.js, and Dart. I am dedicated to the "how it works" and "how to make it better" of technology, from the hardware modem level to the front-end user interface.      </p>
       <p>



        <span className="italic">When I'm not coding, I am reading about philosphy, history or geopolitics. </span>
      </p>




    </motion.section>
  );
}
