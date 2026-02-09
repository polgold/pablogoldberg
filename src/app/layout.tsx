import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: { default: "Pablo Goldberg | Director", template: "%s | Pablo Goldberg" },
  description:
    "Director and filmmaker. Buenos Aires. Commercials, music videos, documentaries.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Pablo Goldberg | Director",
    description: "Director and filmmaker. Buenos Aires.",
    type: "website",
    siteName: "Pablo Goldberg",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Pablo Goldberg" }],
  },
  metadataBase: new URL("https://pablogoldberg.com"),
  viewport: { width: "device-width", initialScale: 1, maximumScale: 5 },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={dmSans.variable}>
      <body className="min-h-screen flex flex-col font-sans antialiased touch-manipulation">{children}</body>
    </html>
  );
}
