import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "JobScoutAI — AI-Powered Job Alert System",
  description:
    "Track, filter, and get notified about the latest job listings scraped from top Philippine job boards. Never miss an opportunity.",
  keywords:
    "job tracker, job alerts, philippines jobs, react jobs, developer jobs, job scraper",
  icons: {
    icon: "/jobscoutai.png",
  },
  openGraph: {
    title: "JobScoutAI",
    description:
      "AI-powered job scraping and alert system for Filipino developers",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={inter.variable}
    >
      <body
        className={`${inter.className} min-h-screen antialiased text-slate-900 overflow-x-hidden`}
        suppressHydrationWarning
      >
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
