import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL, PERSON_SAME_AS, SUN_FACTORY_URL, ACCERTS_URL } from "@/lib/site";

const defaultDescription =
  "Director, Producer, Cinematographer. Buenos Aires. Commercials, music videos, documentaries.";

export const metadata: Metadata = {
  title: { default: "Pablo Goldberg | Director", template: "%s | Pablo Goldberg" },
  description: defaultDescription,
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  keywords: [
    "filmmaker", "director", "producer", "cinematographer", "portrait photographer", "product photography",
    "Buenos Aires", "commercials", "music videos", "documentaries", "Pablo Goldberg",
    "director de cine", "productor", "director de fotografía", "fotógrafo de retratos", "fotografía de producto",
    "publicidad", "videoclips", "documentales", "cine",
    "Cannes", "Marché du Film", "Sitges", "Barcelona", "Sevilla", "festival de cine",
    "film festival", "Bestefar Movie", "Accerts Productions", "Accerts",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Pablo Goldberg | Director",
    description: defaultDescription,
    type: "website",
    locale: "es_AR",
    siteName: "Pablo Goldberg",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Pablo Goldberg | Director",
    description: defaultDescription,
  },
  manifest: "/manifest.json",
  metadataBase: new URL(SITE_URL),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sun Factory",
  url: SUN_FACTORY_URL,
  description: "Film production company. Buenos Aires, Argentina.",
  location: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Buenos Aires",
      addressCountry: "AR",
    },
  },
  knowsAbout: ["Film production", "Commercials", "Music videos", "Documentaries", "Branded content"],
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Pablo Goldberg",
  jobTitle: ["Film Director", "Producer", "Cinematographer", "Portrait Photographer"],
  description: defaultDescription,
  url: SITE_URL,
  sameAs: [...PERSON_SAME_AS],
  knowsAbout: [
    "Film directing", "Cinematography", "Film production", "Portrait photography", "Product photography",
    "Commercials", "Music videos", "Documentaries", "Branded content", "Advertising photography",
  ],
  affiliation: [
    { "@type": "Organization", name: "Marché du Film — Festival de Cannes", url: "https://www.marchedufilm.com" },
    { "@type": "Organization", name: "Bestefar Movie", url: "https://www.bestefarmovie.com" },
  ],
  worksFor: [
    { "@type": "Organization", name: "Sun Factory", url: SUN_FACTORY_URL },
    { "@type": "Organization", name: "Accerts Productions", url: ACCERTS_URL },
  ],
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
