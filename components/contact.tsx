"use client";

import React, { useRef, useState } from "react";
import SectionHeading from "./section-heading";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import { sendEmail } from "@/actions/sendEmail";
import SubmitBtn from "./submit-btn";
import toast from "react-hot-toast";
import { BsCheck, BsCopy, BsEnvelope, BsExclamationCircle } from "react-icons/bs";
import clsx from "clsx";

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

interface FormErrors {
  email?: string;
  message?: string;
}

export default function Contact() {
  const { ref: sectionRef } = useSectionInView("Contact", 0.25);
  const motionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isInView = useInView(motionRef, {
    once: false,
    margin: "-80px 0px -80px 0px",
  });
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("abhayv175@gmail.com");
      setCopied(true);
      toast.success("Email copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy email");
    }
  };

  const validateForm = (formData: FormData): FormErrors => {
    const email = (formData.get("senderEmail") as string)?.trim() || "";
    const message = (formData.get("message") as string)?.trim() || "";
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!message) {
      newErrors.message = "Please enter your message";
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
    }
  };

  const formAction = async (formData: FormData) => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const { data, error } = await sendEmail(formData);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Email sent successfully!");
    setErrors({});
    formRef.current?.reset();
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="mb-20 sm:mb-28 w-full max-w-2xl mx-auto px-4 text-center scroll-mt-28"
    >
      <div ref={motionRef} className="w-full">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={cardVariants}
        >
          <SectionHeading>Contact me</SectionHeading>

          <p className="text-gray-700 -mt-4 dark:text-white/80 font-normal leading-relaxed text-sm sm:text-base max-w-[34rem] mx-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span>Please contact me directly at</span>
            <button
              type="button"
              onClick={handleCopyEmail}
              title="Click to copy email address"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 border border-white/15 text-sm hover:bg-white/20 text-gray-900 dark:text-white transition-all duration-200 cursor-pointer group active:scale-95"
            >
              <BsEnvelope className="text-xs opacity-70 group-hover:opacity-100 transition-opacity" />
              <span className="font-medium">abhayv175@gmail.com</span>
              {copied ? (
                <BsCheck className="text-sm text-emerald-500 transition-transform duration-200 scale-110" />
              ) : (
                <BsCopy className="text-xs opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
            <span>or through this form.</span>
          </p>

          <div className="mt-8 w-full p-6 sm:p-10 rounded-3xl bg-white/70 border border-black/10 shadow-xl backdrop-blur-xl dark:bg-black/30 dark:border-white/10 dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <form
              ref={formRef}
              noValidate
              onSubmit={handleSubmit}
              action={formAction}
              className="flex flex-col gap-4 text-left"
            >
              {/* Email Input Field & Custom Liquid Glass Error Badge */}
              <div className="flex flex-col w-full">
                <input
                  name="senderEmail"
                  type="email"
                  maxLength={500}
                  placeholder="Your email"
                  onChange={() => {
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  className={clsx(
                    "h-14 px-5 rounded-2xl backdrop-blur-xl bg-black/5 text-slate-900 placeholder:text-slate-500 dark:bg-white/5 dark:text-white dark:placeholder:text-white/60 focus:outline-none transition-all duration-300 text-base shadow-sm",
                    errors.email
                      ? "border border-rose-500/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20"
                      : "border border-black/15 dark:border-white/10 focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20"
                  )}
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 mt-1.5 text-xs rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-200 backdrop-blur-md w-fit"
                    >
                      <BsExclamationCircle className="text-[0.75rem] text-rose-600 dark:text-rose-300 flex-shrink-0" />
                      <span>{errors.email}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Message Textarea Field & Custom Liquid Glass Error Badge */}
              <div className="flex flex-col w-full">
                <textarea
                  name="message"
                  maxLength={5000}
                  placeholder="Your message"
                  onChange={() => {
                    if (errors.message) {
                      setErrors((prev) => ({ ...prev, message: undefined }));
                    }
                  }}
                  className={clsx(
                    "h-48 p-5 rounded-2xl backdrop-blur-xl bg-black/5 text-slate-900 placeholder:text-slate-500 dark:bg-white/5 dark:text-white dark:placeholder:text-white/60 focus:outline-none transition-all duration-300 text-base leading-relaxed resize-none shadow-sm",
                    errors.message
                      ? "border border-rose-500/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20"
                      : "border border-black/15 dark:border-white/10 focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20"
                  )}
                />
                <AnimatePresence>
                  {errors.message && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 mt-1.5 text-xs rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-200 backdrop-blur-md w-fit"
                    >
                      <BsExclamationCircle className="text-[0.75rem] text-rose-600 dark:text-rose-300 flex-shrink-0" />
                      <span>{errors.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <SubmitBtn />
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
