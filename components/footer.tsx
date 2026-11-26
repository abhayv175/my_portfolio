import React from "react";

export default function Footer() {
  return (
    <footer className="relative z-10 mb-12 sm:mb-10 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] px-4 text-center text-gray-700 dark:text-white/65 drop-shadow-[0_1px_10px_rgba(250,250,250,0.9)] dark:drop-shadow-[0_1px_10px_rgba(4,4,8,0.9)]">
      <small className="mb-2 block text-xs">
        &copy; Created with ❤️ by Abhay Verma
      </small>
      <p className="text-xs">
        <span className="font-semibold">Thanks for scrolling all the way to the bottom </span>
      </p>
    </footer>
  );
}
