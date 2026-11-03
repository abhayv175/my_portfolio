import dynamic from "next/dynamic";
import About from "@/components/about";
import Intro from "@/components/intro";
import SectionDivider from "@/components/section-divider";

const Experience = dynamic(() => import("@/components/experience"));
const Projects = dynamic(() => import("@/components/projects"));
const Skills = dynamic(() => import("@/components/skills"));
const Contact = dynamic(() => import("@/components/contact"));

export default function Home() {
  return (
    <main className="flex flex-col items-center px-4 relative z-10 animate-entrance min-h-[100dvh] w-full">
      <Intro />
      <SectionDivider />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Contact />
    </main>
  );
}
