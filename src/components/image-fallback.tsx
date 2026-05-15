"use client";

import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function ImageWithFallback({ src, alt, className = "", fallback }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return <>{fallback ?? <div className={`${className} bg-[#1F1E1D]`} />}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
