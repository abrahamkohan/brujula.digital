"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useRef } from "react";

export function SearchBar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value?.trim();
    if (!q) {
      router.push("/guia");
      return;
    }
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#87867F]" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Buscá shoppings, museos, restaurantes..."
        className="w-full bg-white rounded-2xl pl-14 pr-6 py-3.5 text-sm text-[#1F1E1D] placeholder:text-[#87867F] focus:outline-none focus:ring-2 focus:ring-[#C96442] shadow-sm"
      />
    </form>
  );
}
