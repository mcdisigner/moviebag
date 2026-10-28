import type { Metadata } from "next";
import { Outfit, Noto_Sans_Sinhala } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchModal from "@/components/search/SearchModal";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const notoSansSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  variable: "--font-sinhala",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MovieBag - CineLanka Stream & Season Hub",
  description:
    "Zero-hosting, serverless all-in-one Movie & TV Series streaming and one-click Season Pack hub with Sinhala subtitle integration.",
  keywords: [
    "Sinhala Subtitles",
    "Movie Streaming",
    "Season Packs",
    "TV Series",
    "CineLanka",
    "MovieBag",
    "Baiscope subtitles",
    "SubDL",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${notoSansSinhala.variable} bg-background-primary text-text-primary min-h-screen flex flex-col font-sans selection:bg-accent-primary selection:text-white`}
      >
        <Navbar />
        <main className="flex-1 w-full relative">{children}</main>
        <Footer />
        <SearchModal />
      </body>
    </html>
  );
}
