"use client";

import { useEffect } from "react";

export default function KeyboardShortcuts() {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        // Focus first input on page
        const input = document.querySelector('input[type="text"], input:not([type])');
        if (input) (input as HTMLInputElement).focus();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return null;
}
