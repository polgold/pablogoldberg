import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Pablo Goldberg | Director · DP · Producer", template: "%s | Pablo Goldberg" },
  description:
    "Director, cinematographer and producer. Filmmaker based in Buenos Aires. Commercials, music videos, documentaries.",
  openGraph: {
    title: "Pablo Goldberg | Director · DP · Producer",
    description: "Director, cinematographer and producer. Filmmaker based in Buenos Aires.",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Pablo Goldberg" }],
  },
  metadataBase: new URL("https://pablogoldberg.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
