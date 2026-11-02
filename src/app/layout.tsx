import type { Metadata, Viewport } from "next";
import { AppProvider, SETTINGS_KEY } from "@/components/AppProvider";
import { Header } from "@/components/Header";
import { SearchPalette } from "@/components/SearchPalette";
import "./globals.css";

export const metadata: Metadata = {
  title: "Śrī Lalitā Sahasranāma — Study & Chant",
  description: "A distraction-free reader for studying and chanting the Śrī Lalitā Sahasranāma from the Brahmāṇḍa Purāṇa.",
};
export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#faf3e0" }, { media: "(prefers-color-scheme: dark)", color: "#101324" }],
};

// Applies the saved theme before first paint to avoid a flash.
const themeScript = `try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_KEY)})||"{}");var t=s.theme||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Noto+Serif+Devanagari:wght@400;600&display=swap"
        />
      </head>
      <body className="min-h-screen">
        <AppProvider>
          <Header />
          <main>{children}</main>
          <SearchPalette />
        </AppProvider>
      </body>
    </html>
  );
}
