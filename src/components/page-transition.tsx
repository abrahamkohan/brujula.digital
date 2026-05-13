"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Fade effect on route change
    const main = document.querySelector("main");
    if (main) {
      main.style.opacity = "0";
      main.style.transition = "opacity 150ms ease";
      requestAnimationFrame(() => {
        main.style.opacity = "1";
      });
    }
  }, [pathname]);

  return <>{children}</>;
}
