import React from "react";
import { FaPaperPlane } from "react-icons/fa";
import { useFormStatus } from "react-dom"; 

export default function SubmitBtn() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="group bg-slate-900/45 hover:bg-slate-900/65 text-white h-[3rem] w-[8rem] flex items-center justify-center gap-2 rounded-full outline-none font-medium text-sm tracking-wide focus:scale-110 hover:scale-110 active:scale-105 transition-all duration-300 ease-in-out cursor-pointer border border-white/25 hover:border-white/40 backdrop-blur-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.45)] disabled:scale-100 disabled:opacity-65"
      disabled={pending}
    >
      {pending ? (
        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
      ) : (
        <>
          Submit
          <FaPaperPlane className="text-xs opacity-80 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </>
      )}
    </button>
  );
}
