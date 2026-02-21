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
    work: { title: string; subtitle: string; searchPlaceholder: string; all: string; projectsCount: string; noResults: string; viewAllWork: string; archive: string; archiveSubtitle: string };
    workDetail: { gallery: string; galleryStills: string; credits: string; viewAll: string; viewProject: string; navLabel: string };
    gallery: { title: string; subtitle?: string; all: string };
    home: { tagline: string; more: string; role: string; workTitle: string; reel: string; featured: string; viewAll: string; ctaVideos: string; ctaGallery: string; ctaFeatured: string; ctaTitle: string; ctaText: string; ctaButton: string; heroH1: string; heroSub: string; ctaPrimary: string; ctaSecondary: string; aboutText: string; ctaCollaborate: string; photography: string; about: string };
    about: { defaultTitle: string };
    contact: { defaultTitle: string; ctaButton: string };
    metadata: { about: string; contact: string; photography: string; archive: string; work: string; project: string };
  }
> = {
  es: {
    nav: { home: "Inicio", work: "Work", portfolio: "Portfolio", gallery: "Photography", about: "About", contact: "Contact" },
    work: {
      title: "Proyectos",
      subtitle: "Selección de proyectos como director, DP y productor.",
      searchPlaceholder: "Buscar proyectos...",
      all: "Todos",
      projectsCount: "proyecto",
      noResults: "No hay proyectos que coincidan.",
      viewAllWork: "Ver todo el trabajo",
      archive: "Archivo",
      archiveSubtitle: "Todos los proyectos publicados.",
    },
    workDetail: { gallery: "Galería", galleryStills: "Galería / Stills", credits: "Créditos", viewAll: "Ver todos", viewProject: "Ver proyecto", navLabel: "Navegación entre proyectos" },
    gallery: { title: "Galería", subtitle: "Fotografías seleccionadas.", all: "Todas" },
    home: {
      tagline: "Director · Director de fotografía · Productor",
      more: "Más de 20 años contando historias. Buenos Aires.",
      role: "Director / Filmmaker",
      workTitle: "Work",
      reel: "Reel",
      featured: "Featured Work",
      viewAll: "View all",
      ctaVideos: "Watch Reel",
      ctaGallery: "Photography",
      ctaFeatured: "Projects",
      heroH1: "Director & Executive Producer working across commercial and feature film projects.",
      heroSub: "Founder of Sun Factory Films. Production partner for Accerts (USA). Collaborating with agencies and international producers from development to execution.",
      ctaPrimary: "Watch Reel",
      ctaSecondary: "Start a Project",
      aboutText: "Director and Executive Producer with over 20 years of experience. Founder of Sun Factory Films, production partner for Accerts (USA). Collaborating with agencies and international producers from development to execution.",
      ctaCollaborate: "Let's collaborate.",
      photography: "Photography",
      about: "About",
      ctaTitle: "¿Proyecto en mente?",
      ctaText: "Hablemos de tu próximo spot, videoclip o documental.",
      ctaButton: "Contacto / Booking",
    },
    about: { defaultTitle: "Sobre mí" },
    contact: { defaultTitle: "Contacto", ctaButton: "Contacto / Booking" },
    metadata: { about: "Sobre mí | Pablo Goldberg", contact: "Contacto | Pablo Goldberg", photography: "Fotografía | Pablo Goldberg", archive: "Archivo | Pablo Goldberg", work: "Proyectos | Pablo Goldberg", project: "Proyecto | Pablo Goldberg" },
  },
  en: {
    nav: { home: "Home", work: "Work", portfolio: "Portfolio", gallery: "Photography", about: "About", contact: "Contact" },
    work: {
      title: "Projects",
      subtitle: "Selection of projects as director, DP and producer.",
      searchPlaceholder: "Search projects...",
      all: "All",
      projectsCount: "project",
      noResults: "No projects match.",
      viewAllWork: "View All Work",
      archive: "Archive",
      archiveSubtitle: "All published projects.",
    },
    workDetail: { gallery: "Gallery", galleryStills: "Gallery / Stills", credits: "Credits", viewAll: "View all", viewProject: "View project", navLabel: "Project navigation" },
    gallery: { title: "Gallery", subtitle: "Selected photographs.", all: "All" },
    home: {
      tagline: "Director · Director of Photography · Producer",
      more: "Over 20 years telling stories. Buenos Aires.",
      role: "Director / Filmmaker",
      workTitle: "Work",
      reel: "Reel",
      featured: "Featured Work",
      viewAll: "View all",
      ctaVideos: "Watch Reel",
      ctaGallery: "Photography",
      ctaFeatured: "Projects",
      heroH1: "Director & Executive Producer working across commercial and feature film projects.",
      heroSub: "Founder of Sun Factory Films. Production partner for Accerts (USA). Collaborating with agencies and international producers from development to execution.",
      ctaPrimary: "Watch Reel",
      ctaSecondary: "Start a Project",
      aboutText: "Director and Executive Producer with over 20 years of experience. Founder of Sun Factory Films, production partner for Accerts (USA). Collaborating with agencies and international producers from development to execution.",
      ctaCollaborate: "Let's collaborate.",
      photography: "Photography",
      about: "About",
      ctaTitle: "Have a project in mind?",
      ctaText: "Let's talk about your next spot, music video or documentary.",
      ctaButton: "Contact / Booking",
    },
    about: { defaultTitle: "About" },
    contact: { defaultTitle: "Contact", ctaButton: "Contact / Booking" },
    metadata: { about: "About | Pablo Goldberg", contact: "Contact | Pablo Goldberg", photography: "Photography | Pablo Goldberg", archive: "Archive | Pablo Goldberg", work: "Projects | Pablo Goldberg", project: "Project | Pablo Goldberg" },
  },
};
