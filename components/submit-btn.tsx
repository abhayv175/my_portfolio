import React from "react";
import { FaPaperPlane } from "react-icons/fa";
import { useFormStatus } from "react-dom";

export default function SubmitBtn() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="px-8 py-3.5 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 w-fit mx-auto mt-6 active:scale-95 hover:scale-105 bg-slate-900 text-white hover:bg-slate-800 shadow-md dark:bg-white/20 dark:text-white dark:border dark:border-white/20 dark:hover:bg-white/30 dark:backdrop-blur-md group disabled:scale-100 disabled:opacity-65 cursor-pointer disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-slate-900/50 dark:focus-visible:ring-white/50"
      disabled={pending}
    >
      {pending ? (
        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-current"></div>
      ) : (
        <>
          <span>Submit</span>
          <FaPaperPlane className="text-xs opacity-90 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
        </>
      )}
    </button>
  );
}
