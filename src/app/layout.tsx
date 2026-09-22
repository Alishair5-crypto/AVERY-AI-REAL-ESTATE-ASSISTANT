import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "Avery — AI Real Estate Assistant",
  description:
    "Avery is a 24/7 AI real estate assistant that captures, qualifies and follows up with property leads, matches them to listings, and hands off to your team.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="bg-white text-slate-900 antialiased font-sans">{children}</body>
    </html>
  );
}
