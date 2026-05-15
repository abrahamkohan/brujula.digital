"use client";

import { Share2 } from "lucide-react";

interface Props {
  name: string;
  descripcion: string;
  url: string;
}

export function ShareButton({ name, descripcion, url }: Props) {
  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const msg = encodeURIComponent(`📍 ${name}\n${descripcion}\n\n${url}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <button
      onClick={handleShare}
      className="absolute top-2 right-2 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}
