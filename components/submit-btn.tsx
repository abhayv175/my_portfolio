import React from "react";
import { FaPaperPlane } from "react-icons/fa";
import { useFormStatus } from "react-dom";

export default function SubmitBtn() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-fit mx-auto mt-6 px-8 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-medium backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group disabled:scale-100 disabled:opacity-65 cursor-pointer disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-white/50"
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
