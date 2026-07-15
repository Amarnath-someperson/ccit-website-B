import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FluidBackground from "@/components/FluidBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Google Antigravity | AI-First Collaborative Agentic Development Platform",
  description: "Experience Google Antigravity, an AI-first IDE and platform featuring parallel subagent orchestration, non-blocking terminal execution, and a modular browser workspace.",
  keywords: ["Google Antigravity", "AI Agent", "Agentic IDE", "Gemini 3.5 Flash", "Next-gen IDE", "Parallel Subagents", "Software Engineering AI"],
  authors: [{ name: "Google DeepMind" }],
  openGraph: {
    title: "Google Antigravity | AI-First Collaborative Agentic Development Platform",
    description: "Orchestrate autonomous AI agents to plan, edit, build, and verify codebase operations in real-time.",
    url: "https://antigravity.google",
    siteName: "Google Antigravity",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <FluidBackground />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
