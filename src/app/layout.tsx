import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import PageTransition from "@/components/page-transition";
import KeyboardShortcuts from "@/components/keyboard-shortcuts";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-heading", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "¿Qué hay hoy? — Brújula Digital",
  description: "Descubrí eventos, recitales, gastronomía, bares, cine y más en Paraguay. La guía del turista para saber qué hacer hoy.",
  openGraph: {
    title: "¿Qué hay hoy? — Brújula Digital",
    description: "Eventos, recitales, gastronomía, bares, cine y más en Paraguay. Actualizado hoy.",
    siteName: "Brújula Digital",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}>
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
