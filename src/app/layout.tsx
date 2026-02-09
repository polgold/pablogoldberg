import type { Metadata } from "next";
import { Bebas_Neue, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});
const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: { default: "Pablo Goldberg | Director", template: "%s | Pablo Goldberg" },
  description:
    "Director and filmmaker. Buenos Aires. Commercials, music videos, documentaries.",
  openGraph: {
    title: "Pablo Goldberg | Director",
    description: "Director and filmmaker. Buenos Aires.",
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
    <html lang="es" className={`${bebasNeue.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col font-body antialiased">{children}</body>
    </html>
  );
}
