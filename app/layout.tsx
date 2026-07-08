import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { StyleSwitcher } from "@/components/ui/StyleSwitcher";
import { Tilt3D } from "@/components/ui/Tilt3D";
import { WorldCanvas } from "@/components/worlds/WorldCanvas";
import { CursorFX } from "@/components/worlds/CursorFX";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chandrasekhar — AI Engineer & Full-Stack Developer",
  description:
    "Portfolio of Chandrasekhar — AI Engineer building intelligent systems, production-grade AI agents, and scalable web applications.",
  keywords: [
    "AI Engineer",
    "Full-Stack Developer",
    "Machine Learning",
    "AI Agents",
    "Portfolio",
    "Next.js",
    "React",
    "Python",
  ],
  authors: [{ name: "Chandrasekhar" }],
  openGraph: {
    title: "Chandrasekhar — AI Engineer & Full-Stack Developer",
    description:
      "Building intelligent systems, production-grade AI agents, and scalable web applications.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <WorldCanvas />
          {children}
          <ScrollToTop />
          <StyleSwitcher />
          <Tilt3D />
          <CursorFX />
        </ThemeProvider>
      </body>
    </html>
  );
}
