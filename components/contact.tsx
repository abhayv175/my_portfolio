i"use client";

import React, { useRef, useState, useEffect } from "react";
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

function ContactCardScrollWrapper({
  children,
  className = "",
  cardRef,
}: {
  children: React.ReactNode;
  className?: string;
  cardRef: React.RefObject<HTMLDivElement>;
}) {
  const isInScroll = useInView(cardRef, {
    once: true,
    amount: 0.05,
  });

  return (
    <div ref={cardRef} className={`w-full ${className}`}>
      <motion.div
        initial="hidden"
        animate={isInScroll ? "visible" : "hidden"}
        variants={cardVariants}
        className="w-full transform-gpu will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

interface FormErrors {
  email?: string;
  message?: string;
}

export default function Contact() {
  const { ref: sectionRef } = useSectionInView("Contact", 0.25);
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isMobile, setIsMobile] = useState(false);
  const isMobileInCenter = useInView(cardRef, {
    margin: "0px 0px 0px 0px",
    amount: 0.1,
    once: false,
  });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isCardFocused = isMobile ? isMobileInCenter : isHovered;

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
      <div className="w-full">
        <div className="flex justify-center mb-2">
          <span className="text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 shadow-sm">
            Contact
          </span>
        </div>
        <SectionHeading>Contact me</SectionHeading>

        <div className="text-gray-700 -mt-4 dark:text-white/80 font-normal leading-relaxed text-sm sm:text-base max-w-[34rem] mx-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <span className="text-gray-700 dark:text-white/80">Please contact me directly at</span>
          <button
            type="button"
            onClick={handleCopyEmail}
            title="Click to copy email address"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-sm hover:bg-black/10 dark:hover:bg-white/15 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 text-gray-900 dark:text-white transition-all duration-200 cursor-pointer group active:scale-95 shadow-sm"
          >
            <BsEnvelope className="text-xs opacity-80 group-hover:opacity-100 transition-opacity text-gray-800 dark:text-white" />
            <span className="font-medium text-gray-900 dark:text-white">abhayv175@gmail.com</span>
            {copied ? (
              <BsCheck className="text-sm text-emerald-500 transition-transform duration-200 scale-110" />
            ) : (
              <BsCopy className="text-xs opacity-70 group-hover:opacity-100 transition-opacity text-gray-800 dark:text-white" />
            )}
          </button>
          <span className="text-gray-700 dark:text-white/80">or through this form.</span>
        </div>

        <ContactCardScrollWrapper
          className="mt-8"
          cardRef={cardRef}
        >
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onMouseEnter={() => {
              if (!isMobile) setIsHovered(true);
            }}
            onMouseLeave={() => {
              if (!isMobile) setIsHovered(false);
            }}
            className={`w-full p-6 sm:p-10 rounded-3xl backdrop-blur-md md:backdrop-blur-xl transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out relative overflow-hidden group ${
              isCardFocused
                ? "bg-white/95 dark:bg-zinc-900/80 border-violet-400/80 dark:border-violet-400/80 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_35px_rgba(168,85,247,0.32)] scale-[1.02] -translate-y-1.5"
                : "bg-white/70 dark:bg-zinc-900/40 border border-black/10 dark:border-white/10 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_35px_rgba(168,85,247,0.32)] hover:border-violet-400/70 dark:hover:border-violet-400/70 hover:bg-white/90 dark:hover:bg-zinc-900/75"
            }`}
          >
            {/* Ambient Violet Glow Sheen on Hover (not cursor-dependent) */}
            <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-violet-500/25 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none transition-opacity duration-150 ease-out ${isCardFocused ? "opacity-100" : "opacity-0"} group-hover:opacity-100`} />
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/20 via-purple-500/15 to-transparent pointer-events-none transition-opacity duration-150 ease-out ${isCardFocused ? "opacity-100" : "opacity-0"} group-hover:opacity-100`} />

            <form
              ref={formRef}
              noValidate
              onSubmit={handleSubmit}
              action={formAction}
              className="flex flex-col gap-4 text-left relative z-10"
            >
              {/* Email Input Field & Custom Liquid Glass Error Badge */}
              <div className="flex flex-col w-full">
                <input
                  id="contact-email"
                  name="senderEmail"
                  type="email"
                  autoComplete="email"
                  aria-label="Your email address"
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
                  id="contact-message"
                  name="message"
                  aria-label="Your message"
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
          </motion.div>
        </ContactCardScrollWrapper>
      </div>
    </section>
  );
}
