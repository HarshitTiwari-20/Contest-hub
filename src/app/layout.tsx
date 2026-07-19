import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Contest Hub — Competitive Programming Dashboard",
    template: "%s · Contest Hub",
  },
  description:
    "Track contests, multi-platform stats, practice goals, and growth in one competitive programming dashboard.",
  keywords: [
    "competitive programming",
    "leetcode",
    "codeforces",
    "contest calendar",
    "coding dashboard",
    "DSA",
    "contest-hub",
  ],
  authors: [{ name: "Contest Hub" }],
  openGraph: {
    title: "Contest Hub — Competitive Programming Dashboard",
    description:
      "Track contests, multi-platform stats, and growth in one place.",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
