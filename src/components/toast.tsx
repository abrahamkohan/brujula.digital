"use client";

import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";

interface Toast { id: string; message: string; type: "success"|"error" }
const ToastContext = createContext<{
  toast: (message: string, type?: "success"|"error") => void;
}>({ toast: () => {} });

export function useToast() { return useContext(ToastContext); }

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function toast(message: string, type: "success"|"error" = "success") {
    const id = String(++toastId);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-right ${
            t.type === "success" ? "bg-[#5A7D5A] text-white" : "bg-red-500 text-white"
          }`}>
            {t.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
