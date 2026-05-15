import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter, Geist_Mono } from "next/font/google";
import PageTransition from "@/components/page-transition";
import KeyboardShortcuts from "@/components/keyboard-shortcuts";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const satoshi = localFont({
  src: [
    { path: "./Satoshi-Variable.woff2", weight: "300 900", style: "normal" },
    { path: "./Satoshi-VariableItalic.woff2", weight: "300 900", style: "italic" },
  ],
  variable: "--font-heading",
});

export const viewport: Viewport = {
  themeColor: "#1F1E1D",
};

export const metadata: Metadata = {
  title: "¿Qué hay hoy? — Brújula Digital",
  description: "Descubrí eventos, recitales, gastronomía, bares, cine y más en Paraguay. La guía del turista para saber qué hacer hoy.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "Brújula",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "¿Qué hay hoy? — Brújula Digital",
    description: "Eventos, recitales, gastronomía, bares, cine y más en Paraguay. Actualizado hoy.",
    siteName: "Brújula Digital",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${satoshi.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
        <KeyboardShortcuts />
        <main className="flex-1"><PageTransition>{children}</PageTransition></main>
        </ToastProvider>
      </body>
    </html>
  );
}
