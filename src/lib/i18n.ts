import type { Locale } from "./content";

export const LOCALES: Locale[] = ["es", "en"];
export const DEFAULT_LOCALE: Locale = "es";

export function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function getLocaleFromParam(param: string | undefined): Locale {
  if (param && isValidLocale(param)) return param;
  return DEFAULT_LOCALE;
}

export const COPY: Record<
  Locale,
  {
    nav: { home: string; work: string; portfolio: string; gallery: string; about: string; contact: string };
    work: { title: string; subtitle: string; searchPlaceholder: string; all: string; projectsCount: string; noResults: string };
    workDetail: { gallery: string; credits: string; viewAll: string };
    gallery: { title: string; subtitle?: string; all: string };
    home: { tagline: string; more: string; role: string; workTitle: string; reel: string; featured: string; viewAll: string; ctaVideos: string; ctaGallery: string; ctaFeatured: string; ctaTitle: string; ctaText: string; ctaButton: string };
    about: { defaultTitle: string };
    contact: { defaultTitle: string; ctaButton: string };
    metadata: { about: string; contact: string };
  }
> = {
  es: {
    nav: { home: "Inicio", work: "Videos", portfolio: "Portfolio", gallery: "Galería", about: "Sobre mí", contact: "Contacto / Booking" },
    work: {
      title: "Proyectos",
      subtitle: "Selección de proyectos como director, DP y productor.",
      searchPlaceholder: "Buscar proyectos...",
      all: "Todos",
      projectsCount: "proyecto",
      noResults: "No hay proyectos que coincidan.",
    },
    workDetail: { gallery: "Galería", credits: "Créditos", viewAll: "Ver todos" },
    gallery: { title: "Galería", all: "Todas" },
    home: {
      tagline: "Director · Director de fotografía · Productor",
      more: "Más de 20 años contando historias. Buenos Aires.",
      role: "Director / Filmmaker",
      workTitle: "Proyectos",
      reel: "Reel",
      featured: "Trabajo destacado",
      viewAll: "Ver todos",
      ctaVideos: "Videos",
      ctaGallery: "Galería",
      ctaFeatured: "Proyectos",
      ctaTitle: "¿Proyecto en mente?",
      ctaText: "Hablemos de tu próximo spot, videoclip o documental.",
      ctaButton: "Contacto / Booking",
    },
    about: { defaultTitle: "Sobre mí" },
    contact: { defaultTitle: "Contacto", ctaButton: "Contacto / Booking" },
    metadata: { about: "Sobre mí | Pablo Goldberg", contact: "Contacto | Pablo Goldberg" },
  },
  en: {
    nav: { home: "Home", work: "Projects", portfolio: "Portfolio", gallery: "Gallery", about: "About", contact: "Contact / Booking" },
    work: {
      title: "Projects",
      subtitle: "Selection of projects as director, DP and producer.",
      searchPlaceholder: "Search projects...",
      all: "All",
      projectsCount: "project",
      noResults: "No projects match.",
    },
    workDetail: { gallery: "Gallery", credits: "Credits", viewAll: "View all" },
    gallery: { title: "Gallery", all: "All" },
    home: {
      tagline: "Director · Director of Photography · Producer",
      more: "Over 20 years telling stories. Buenos Aires.",
      role: "Director / Filmmaker",
      workTitle: "Projects",
      reel: "Reel",
      featured: "Featured work",
      viewAll: "View all",
      ctaVideos: "Videos",
      ctaGallery: "Gallery",
      ctaFeatured: "Projects",
      ctaTitle: "Have a project in mind?",
      ctaText: "Let's talk about your next spot, music video or documentary.",
      ctaButton: "Contact / Booking",
    },
    about: { defaultTitle: "About" },
    contact: { defaultTitle: "Contact", ctaButton: "Contact / Booking" },
    metadata: { about: "About | Pablo Goldberg", contact: "Contact | Pablo Goldberg" },
  },
};
