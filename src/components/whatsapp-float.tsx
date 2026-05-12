"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/595982000808?text=Hola%2C+quiero+informaci%C3%B3n+sobre+Brujula"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
