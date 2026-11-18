import React from "react";
import { FaPaperPlane } from "react-icons/fa";
import { useFormStatus } from "react-dom";

export default function SubmitBtn() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="px-8 py-3.5 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 w-fit mx-auto mt-6 active:scale-95 hover:scale-105 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shadow-md hover:shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] border border-black/10 dark:border-white/20 group disabled:scale-100 disabled:hover:scale-100 disabled:opacity-65 cursor-pointer disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/50"
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
