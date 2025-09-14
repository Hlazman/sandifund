import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-center text-sm">
        Create by{" "}
        <a
          href="https://sandifund.com/"
          target="_blank"
          rel="noreferrer"
          className="ml-1 font-medium underline hover:no-underline"
        >
          Sandifund
        </a>
      </div>
    </footer>
  );
}
