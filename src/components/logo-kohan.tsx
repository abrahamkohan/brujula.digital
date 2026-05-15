"use client";

import { useState } from "react";
import { LOGO_URL, LOGO_FALLBACK_TEXT } from "@/lib/logo";

interface Props {
  className?: string;
  /** Si true, aplica brightness-0 invert para fondo oscuro */
  invert?: boolean;
}

export function LogoCta({ className = "h-9 mx-auto", invert = false }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`block ${className} flex items-center justify-center font-bold tracking-[0.3em] text-white text-sm`}>
        {LOGO_FALLBACK_TEXT}
      </span>
    );
  }

  return (
    <img
      src={LOGO_URL}
      alt="Kohan & Campos"
      className={`${className} ${invert ? "brightness-0 invert" : ""}`}
      onError={() => setFailed(true)}
    />
  );
}
