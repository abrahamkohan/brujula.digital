import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import PageTransition from "@/components/page-transition";
import KeyboardShortcuts from "@/components/keyboard-shortcuts";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brujula — Datos públicos del Estado paraguayo",
  description: "Verificación de funcionarios, precios de licitaciones, KYC empresarial y más. Datos oficiales de Paraguay.",
  openGraph: {
    title: "Brujula — Datos públicos, dirección clara",
    description: "Consultá datos del Estado paraguayo en segundos.",
    url: "https://brujula.digital",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
        <KeyboardShortcuts />
        <Navbar />
        <main className="flex-1"><PageTransition>{children}</PageTransition></main>
        </ToastProvider>
      </body>
    </html>
  );
}
