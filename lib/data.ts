import React from "react";


import { FaUnity } from "react-icons/fa";

import { MdOutlineWork } from "react-icons/md";
import { MdEngineering } from "react-icons/md";

import MoveIt from "@/public/MoveIt.png";
import PassengerText from "@/public/PassengerText.png";
import BankingSystem from "@/public/BankingSystem.png";
import PikaPanic from "@/public/PikaPanic.png";
import GreekVoc from "@/public/GreekVoc.png";

import { url } from "inspector";

export const links = [
  {
    name: "Home",
    hash: "#home",
  },
  {
    name: "About",
    hash: "#about",
  },  
  {
    name: "Experience",
    hash: "#experience",
  },

  {
    name: "Projects",
    hash: "#projects",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
  {
    name: "Contact",
    hash: "#contact",
  },
] as const;

export const experiencesData = [



  {
    title: "Test Engineer",
    company: "Marquiestech",
    location: "Vilnius, Lithuania",
    description:
      "I capture and analyze device and network logs using tools like QXDM, QCAT, and ADB to identify modem, RF, and protocol-level issues in new, unreleased 4G modems for major OEMs. My work involves reproducing and validating network-related problems, such as attach failures and handover issues, while performing root-cause analysis through detailed KPI tracking like RSRP and SINR. I document these findings with comprehensive logs and impact assessments, sharing structured reports with chipset and carrier teams to drive debugging and successful software acceptance testing.",
    icon: React.createElement(MdEngineering),
    date: "2021 - present",
  },
  {
    title: "Junior Test Engineer",
    company: "Unity",
    location: "Vilnius, Lithuania",
    description:
      "As a Junior Test Engineer at Unity, I specialized in identifying and documenting Unity engine's bugs, providing critical workarounds for regressed versions to ensure seamless performance. I executed user submitted manual test cases across complex environments like IL2CPP and DOMS, etc focusing on rigorous regression testing to maintain product stability.",
    icon: React.createElement(FaUnity),
    date: "November 11, 2024 - April 5, 2025",
  },
  {
    title: "Software Developer Intern",
    company: "UAB First Riddle",
    location: "Vilnius, Lithuania",
    description:
      "During my software development internship, I designed and developed an e-commerce test platform focused on improving user experience and engagement. I managed the product catalog and optimized SEO and social media strategies to significantly boost website traffic. Additionally, I engineered a robust user query database to streamline data retrieval and customer support while fostering cross-departmental collaboration to improve overall project completion rates.",
    icon: React.createElement(MdOutlineWork),
    date: "December 9, 2023 - April 8, 2024",
  },
  {
    title: "Software Developer Intern",
    company: "Infowiz",
    location: "Chandigard, India",
    description:
      "As my first professional internship, this experience provided a foundational understanding of industry standards and collaborative workflows. I worked closely with a team to develop entry-level projects, gaining practical insights into the software development lifecycle while simultaneously earning my CCNA certification to strengthen my networking expertise.",
    icon: React.createElement(MdOutlineWork),
    date: "May, 2023 - July, 2023",
  },
 

] as const;






export const projectsData = [
  
   {
    title: "Move it",
    description:
      "Move It is a swift and secure courier service featuring a sleek, easy-to-navigate website for effortless pickup scheduling and real-time shipment tracking.",
    tags: ["CSS", "Bootstrap", "JavaScript","React js", "MongoDB"],
    imageUrl: MoveIt,
    url: "https://abhayv175.github.io/MOVE-IT/"
  },
  {
    title: "Passenger Text",
    description:
      "A modern messenger clone that enables real-time communication and seamless media sharing through a robust, cloud-integrated architecture.",
    tags: ["React", "Typescript", "nextauth", "cloudinary", "pusher", "mongoDB"],
    imageUrl: PassengerText,
    url: "https://github.com/abhayv175/passenger-messenger"
  },
  {
    title: "BANKING APPLICATION",
    description:
      "This JavaFX-based banking application features a custom-styled, user-friendly interface that enables seamless execution of various financial operations.",
    tags: ["Java", "JavaFX", "CSS", "SceneBuilder(fxml)"],
    imageUrl: BankingSystem,
    url: "https://github.com/abhayv175/Bank_Application"
  },
  {
    title: "GREEK VOC",
    description:
      "This Dart-powered mobile application helps users master Greek travel and food vocabulary by tracking learning progress and tasks through efficient local storage.",
    tags: ["Flutter", "Dart", "Swift", "Android Studio", "Emulators"],
    imageUrl: GreekVoc,
    url: "https://github.com/BenBinary/greek_vocs"
  },
  {
    title: "PIKA PANIC",
    description:
      "Pika Panic is an immersive Unity game featuring levels inspired by real-world Vilnius landmarks that blend creative storytelling with technical precision.",
    tags: ["Unity", "C#", "Plastic SCM"],
    imageUrl: PikaPanic,
    url: "https://cloud.unity.com/home/organizations/24756934479511c6-4dab-94d2-c940bf45f6a4/details"
  },
] as const;

export const skillsData = [
  "Cross Platform Testing", "regression", "Structured Debugging", "Jira", "API Testing", "REST API", "React Js", "Next Js", "UI/UX", "MongoDB", "MS SQL", "C#", "C++", "Python", "JavaScript", "Plastic SCM", "Android Studio", "GitHub", "Linux", "custom operating systems",
] as const;
