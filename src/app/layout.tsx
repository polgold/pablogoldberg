import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL, PERSON_SAME_AS, SUN_FACTORY_URL } from "@/lib/site";

const defaultDescription =
  "Director and filmmaker. Buenos Aires. Commercials, music videos, documentaries.";

export const metadata: Metadata = {
  title: { default: "Pablo Goldberg | Director", template: "%s | Pablo Goldberg" },
  description: defaultDescription,
  icons: { icon: "/favicon.ico" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Pablo Goldberg | Director",
    description: defaultDescription,
    type: "website",
    siteName: "Pablo Goldberg",
    url: SITE_URL,
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Pablo Goldberg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pablo Goldberg | Director",
    description: defaultDescription,
    images: ["/og-default.png"],
  },
  metadataBase: new URL(SITE_URL),
  viewport: { width: "device-width", initialScale: 1, maximumScale: 5 },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sun Factory",
  url: SUN_FACTORY_URL,
  description: "Film production company. Argentina.",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Pablo Goldberg",
  jobTitle: "Film Director",
  description: defaultDescription,
  url: SITE_URL,
  sameAs: [...PERSON_SAME_AS],
  worksFor: {
    "@type": "Organization",
    name: "Sun Factory",
    url: SUN_FACTORY_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
        {process.env.NEXT_PUBLIC_HERO_IMAGE && (
          <link rel="preload" as="image" href={process.env.NEXT_PUBLIC_HERO_IMAGE} />
        )}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased touch-manipulation">{children}</body>
    </html>
  );
}
