"use client";

import React, { useRef } from "react";
import SectionHeading from "./section-heading";
import { motion, useInView } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import { sendEmail } from "@/actions/sendEmail";
import SubmitBtn from "./submit-btn";
import toast from "react-hot-toast";

const cardVariants = {
  hidden: {
    scale: 0.75,
    opacity: 0,
    y: 30,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function Contact() {
  const { ref: sectionRef } = useSectionInView("Contact", 0.25);
  const motionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(motionRef, {
    once: false,
    margin: "-80px 0px -80px 0px",
  });

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="mb-20 sm:mb-28 w-[min(100%,38rem)] text-center scroll-mt-28"
    >
      <div ref={motionRef} className="w-full">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={cardVariants}
        >
          <SectionHeading>Contact me</SectionHeading>

          <p className="text-gray-700 -mt-6 dark:text-white/80 font-normal leading-relaxed text-sm sm:text-base max-w-[32rem] mx-auto">
            Please contact me directly at{" "}
            <a className="underline font-medium hover:text-gray-950 dark:hover:text-white transition-colors duration-200" href="mailto:abhayv175@gmail.com">
              abhayv175@gmail.com
            </a>{" "}
            or through this form.
          </p>

          <form
            className="mt-10 flex flex-col dark:text-black"
            action={async (formData) => {
              const { data, error } = await sendEmail(formData);

              if (error) {
                toast.error(error);
                return;
              }

              toast.success("Email sent successfully!");
            }}
          >
            <input
              className="h-14 px-4 rounded-lg borderBlack bg-white dark:bg-white/90 focus:bg-white dark:focus:bg-white shadow-sm focus:shadow-md focus:ring-2 focus:ring-gray-950/30 dark:focus:ring-white/40 transition-all duration-200 ease-in-out outline-none text-base"
              name="senderEmail"
              type="email"
              required
              maxLength={500}
              placeholder="Your email"
            />
            <textarea
              className="h-52 my-4 rounded-lg borderBlack p-4 bg-white dark:bg-white/90 focus:bg-white dark:focus:bg-white shadow-sm focus:shadow-md focus:ring-2 focus:ring-gray-950/30 dark:focus:ring-white/40 transition-all duration-200 ease-in-out outline-none text-base leading-relaxed"
              name="message"
              placeholder="Your message"
              required
              maxLength={5000}
            />
            <SubmitBtn />
          </form>
        </motion.div>
      </div>
    </section>
  );
}
